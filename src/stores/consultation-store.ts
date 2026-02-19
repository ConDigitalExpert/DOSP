"use client";

import { create } from "zustand";
import {
  KioskStep,
  ConsultationStatus,
  AuditActor,
  type Consultation,
  type SymptomEntry,
  type PatientProfile,
  type VitalSigns,
  type TriageResult,
  type AuditLogEntry,
} from "@/lib/types";
import { generateId } from "@/lib/utils";
import { runTriage } from "@/lib/triage-engine";
import { MOCK_CONSULTATIONS } from "@/lib/mock-data";
import { TriageDecision } from "@/lib/types";

interface ConsultationStore {
  // Kiosk flow state
  currentStep: KioskStep;
  consultation: Consultation | null;
  verifiedPatientProfile: PatientProfile | null;

  // History for dashboard
  consultationHistory: Consultation[];

  // Kiosk actions
  startConsultation: () => void;
  setVerifiedPatient: (patientId: string, profile: PatientProfile) => void;
  skipVerification: () => void;
  setSymptoms: (symptoms: SymptomEntry) => void;
  setPatient: (patient: PatientProfile) => void;
  setVitals: (vitals: VitalSigns | null) => void;
  executeTriage: () => void;
  completeConsultation: () => void;
  cancelConsultation: () => void;
  goToStep: (step: KioskStep) => void;
  resetKiosk: () => void;

  // Pharmacist actions
  addPharmacistNote: (consultationId: string, note: string, action: string) => void;
  resolveEscalation: (consultationId: string, note: string, action: string) => void;
}

function addAuditEntry(
  consultation: Consultation,
  action: string,
  details: string,
  actor: AuditActor
): Consultation {
  return {
    ...consultation,
    auditLog: [
      ...consultation.auditLog,
      { timestamp: new Date(), action, details, actor },
    ],
  };
}

export const useConsultationStore = create<ConsultationStore>((set, get) => ({
  currentStep: KioskStep.WELCOME,
  consultation: null,
  verifiedPatientProfile: null,
  consultationHistory: [...MOCK_CONSULTATIONS],

  startConsultation: () => {
    const newConsultation: Consultation = {
      id: generateId(),
      kioskId: "K-001",
      startTime: new Date(),
      status: ConsultationStatus.IN_PROGRESS,
      auditLog: [
        {
          timestamp: new Date(),
          action: "consultation_started",
          details: "Patient began consultation",
          actor: AuditActor.SYSTEM,
        },
      ],
    };
    set({ consultation: newConsultation, currentStep: KioskStep.VERIFICATION, verifiedPatientProfile: null });
  },

  setVerifiedPatient: (patientId: string, profile: PatientProfile) => {
    const { consultation } = get();
    if (!consultation) return;
    const withVerification: Consultation = { ...consultation, verifiedPatientId: patientId, isProfilePreFilled: true };
    const updated = addAuditEntry(
      withVerification,
      "patient_verified",
      `Patient file found — profile auto-populated (ID: ${patientId})`,
      AuditActor.SYSTEM
    );
    set({
      consultation: updated,
      verifiedPatientProfile: profile,
      currentStep: KioskStep.SYMPTOMS,
    });
  },

  skipVerification: () => {
    const { consultation } = get();
    if (!consultation) return;
    const updated = addAuditEntry(
      consultation,
      "verification_skipped",
      "Patient chose to continue without verification",
      AuditActor.PATIENT
    );
    set({
      consultation: updated,
      currentStep: KioskStep.SYMPTOMS,
      verifiedPatientProfile: null,
    });
  },

  setSymptoms: (symptoms: SymptomEntry) => {
    const { consultation } = get();
    if (!consultation) return;
    const withSymptoms: Consultation = { ...consultation, symptoms };
    const updated = addAuditEntry(
      withSymptoms,
      "symptoms_entered",
      `Category: ${symptoms.category}, Severity: ${symptoms.severity}/5, Duration: ${symptoms.durationDays} days`,
      AuditActor.PATIENT
    );
    set({ consultation: updated, currentStep: KioskStep.SCREENING });
  },

  setPatient: (patient: PatientProfile) => {
    const { consultation } = get();
    if (!consultation) return;
    const withPatient: Consultation = { ...consultation, patient };
    const updated = addAuditEntry(
      withPatient,
      "screening_completed",
      `Age: ${patient.ageGroup}, Conditions: ${patient.conditions.length}, Medications: ${patient.currentMedications.length}`,
      AuditActor.PATIENT
    );
    set({ consultation: updated, currentStep: KioskStep.VITALS });
  },

  setVitals: (vitals: VitalSigns | null) => {
    const { consultation } = get();
    if (!consultation) return;
    const withVitals: Consultation = { ...consultation, vitals: vitals || undefined };
    const updated = addAuditEntry(
      withVitals,
      vitals ? "vitals_recorded" : "vitals_skipped",
      vitals ? "Vitals check completed" : "Patient opted to skip vitals check",
      AuditActor.PATIENT
    );
    set({ consultation: updated });
    get().executeTriage();
  },

  executeTriage: () => {
    const { consultation } = get();
    if (!consultation?.symptoms || !consultation?.patient) return;

    const result = runTriage(
      consultation.symptoms,
      consultation.patient,
      consultation.vitals
    );

    const withResult: Consultation = { ...consultation, triageResult: result };
    let updated = addAuditEntry(
      withResult,
      "triage_completed",
      `Decision: ${result.decision}, Confidence: ${(result.confidence * 100).toFixed(0)}%`,
      AuditActor.SYSTEM
    );

    if (result.decision === TriageDecision.ESCALATE) {
      const escalated: Consultation = { ...updated, status: ConsultationStatus.ESCALATED };
      updated = addAuditEntry(
        escalated,
        "escalated",
        result.escalationReason || "Escalated to pharmacist",
        AuditActor.SYSTEM
      );
      set({
        consultation: updated,
        currentStep: KioskStep.ESCALATION,
      });
    } else {
      set({
        consultation: updated,
        currentStep: KioskStep.RECOMMENDATION,
      });
    }
  },

  completeConsultation: () => {
    const { consultation, consultationHistory } = get();
    if (!consultation) return;
    const completed: Consultation = {
      ...consultation,
      status: ConsultationStatus.COMPLETED,
      endTime: new Date(),
    };
    const updated = addAuditEntry(
      completed,
      "consultation_completed",
      "Patient accepted recommendation",
      AuditActor.SYSTEM
    );
    set({
      consultation: updated,
      currentStep: KioskStep.SUMMARY,
      consultationHistory: [updated, ...consultationHistory],
    });
  },

  cancelConsultation: () => {
    const { consultation, consultationHistory } = get();
    if (!consultation) return;
    const cancelled: Consultation = {
      ...consultation,
      status: ConsultationStatus.CANCELLED,
      endTime: new Date(),
    };
    const updated = addAuditEntry(
      cancelled,
      "consultation_cancelled",
      "Patient cancelled consultation",
      AuditActor.PATIENT
    );
    set({
      consultationHistory: [updated, ...consultationHistory],
    });
    get().resetKiosk();
  },

  goToStep: (step: KioskStep) => {
    set({ currentStep: step });
  },

  resetKiosk: () => {
    set({
      currentStep: KioskStep.WELCOME,
      consultation: null,
      verifiedPatientProfile: null,
    });
  },

  addPharmacistNote: (consultationId: string, note: string, action: string) => {
    const { consultationHistory } = get();
    set({
      consultationHistory: consultationHistory.map((c) =>
        c.id === consultationId
          ? addAuditEntry(
              { ...c, pharmacistNotes: note, pharmacistAction: action },
              "pharmacist_note",
              note,
              AuditActor.PHARMACIST
            )
          : c
      ),
    });
  },

  resolveEscalation: (consultationId: string, note: string, action: string) => {
    const { consultationHistory } = get();
    set({
      consultationHistory: consultationHistory.map((c) =>
        c.id === consultationId
          ? addAuditEntry(
              {
                ...c,
                status: ConsultationStatus.PHARMACIST_RESOLVED,
                pharmacistNotes: note,
                pharmacistAction: action,
                endTime: new Date(),
              },
              "pharmacist_resolved",
              `Action: ${action}. Notes: ${note}`,
              AuditActor.PHARMACIST
            )
          : c
      ),
    });
  },
}));
