import { useConsultationStore } from "@/stores/consultation-store";
import { useAuthStore } from "@/stores/auth-store";
import { usePickupStore } from "@/stores/pickup-store";
import { SymptomCategory } from "@/lib/types";
import { MOCK_PATIENT_RECORDS } from "@/lib/patient-records";

export interface DemoStep {
  id: string;
  title: string;
  description: string;
  actLabel?: string;
  route?: string;
  spotlightSelector?: string;
  spotlightPadding?: number;
  panelPosition?: "center" | "bottom-right" | "bottom-left" | "top-right" | "top-left";
  action?: () => void | Promise<void>;
  waitAfterAction?: number;
}

const sarahRecord = MOCK_PATIENT_RECORDS[0]; // Sarah Johnson

export const DEMO_STEPS: DemoStep[] = [
  // ===== ACT 1: THE PLATFORM =====
  {
    id: "welcome",
    actLabel: "Act 1 — The Platform",
    title: "Welcome to DOSP",
    description:
      "Digital Off-the-Shelf Pharmacist — an AI-powered OTC triage system that frees pharmacists for clinical care. Safe, conservative, and always backed by a real pharmacist.",
    route: "/",
    panelPosition: "center",
  },
  {
    id: "three-touchpoints",
    actLabel: "Act 1 — The Platform",
    title: "Three User Touchpoints",
    description:
      "Patients use the kiosk for OTC guidance. They can pick up prescriptions at the same terminal. Pharmacists monitor everything from a real-time dashboard.",
    route: "/",
    spotlightSelector: ".grid.grid-cols-1.md\\:grid-cols-3.gap-6.mt-12",
    spotlightPadding: 16,
    panelPosition: "bottom-right",
  },
  {
    id: "safety-first",
    actLabel: "Act 1 — The Platform",
    title: "Safety-First Design",
    description:
      "Conservative by design — if in doubt, DOSP escalates to a real pharmacist. Every interaction is logged with a full audit trail for regulatory compliance.",
    route: "/",
    spotlightSelector: ".grid.grid-cols-1.md\\:grid-cols-3.gap-6:not(.mt-12)",
    spotlightPadding: 12,
    panelPosition: "top-right",
  },

  // ===== ACT 2: PATIENT KIOSK JOURNEY =====
  {
    id: "verification",
    actLabel: "Act 2 — Patient Kiosk",
    title: "Patient Verification",
    description:
      "The patient verifies their identity with phone number and date of birth. Existing pharmacy records are loaded automatically — no re-entering medical history.",
    route: "/verify",
    spotlightSelector: "main",
    spotlightPadding: 8,
    panelPosition: "bottom-right",
    action: () => {
      useConsultationStore.getState().resetKiosk();
      useConsultationStore.getState().startConsultation();
    },
    waitAfterAction: 400,
  },
  {
    id: "profile-loaded",
    actLabel: "Act 2 — Patient Kiosk",
    title: "Profile Auto-Loaded",
    description:
      "Sarah Johnson's medical history is found — diabetes, current medications (metformin, lisinopril), and NSAID allergy are all pre-loaded. This saves time and improves safety.",
    route: "/verify",
    spotlightSelector: "main",
    panelPosition: "bottom-right",
    action: () => {
      useConsultationStore
        .getState()
        .setVerifiedPatient(sarahRecord.id, sarahRecord.profile);
    },
    waitAfterAction: 500,
  },
  {
    id: "symptom-triage",
    actLabel: "Act 2 — Patient Kiosk",
    title: "Symptom Triage",
    description:
      "The patient selects their symptom category — Headache. The system records sub-symptoms (tension headache, sinus pressure), severity (2/5), and duration (1 day).",
    route: "/symptoms",
    spotlightSelector: "main",
    spotlightPadding: 8,
    panelPosition: "bottom-right",
    action: () => {
      useConsultationStore.getState().setSymptoms({
        category: SymptomCategory.HEADACHE,
        subSymptoms: ["tension_headache", "sinus_pressure"],
        severity: 2,
        durationDays: 1,
      });
    },
    waitAfterAction: 400,
  },
  {
    id: "screening",
    actLabel: "Act 2 — Patient Kiosk",
    title: "Smart Screening",
    description:
      "The safety screening form is pre-filled from Sarah's verified profile — age, conditions, medications, allergies, and pregnancy status. The patient just confirms and continues.",
    route: "/screening",
    spotlightSelector: "main",
    spotlightPadding: 8,
    panelPosition: "bottom-right",
  },
  {
    id: "recommendation",
    actLabel: "Act 2 — Patient Kiosk",
    title: "AI-Powered Recommendation",
    description:
      "The triage engine analyzes symptoms against red flags, drug interactions, and contraindications. Result: 95% confidence — safe to recommend an OTC product with proper dosage and warnings.",
    route: "/recommendation",
    spotlightSelector: "main",
    spotlightPadding: 8,
    panelPosition: "bottom-right",
    action: () => {
      const store = useConsultationStore.getState();
      store.setPatient(sarahRecord.profile);
      // setVitals(null) triggers the triage engine internally
      store.setVitals(null);
    },
    waitAfterAction: 600,
  },
  {
    id: "summary",
    actLabel: "Act 2 — Patient Kiosk",
    title: "Consultation Complete",
    description:
      "The patient receives a consultation receipt with the full audit trail — every step logged with timestamps and actors. Total time: under 3 minutes.",
    route: "/summary",
    spotlightSelector: "main",
    spotlightPadding: 8,
    panelPosition: "bottom-right",
    action: () => {
      useConsultationStore.getState().completeConsultation();
    },
    waitAfterAction: 400,
  },

  // ===== ACT 3: MEDICATION PICKUP =====
  {
    id: "pickup-intro",
    actLabel: "Act 3 — Medication Pickup",
    title: "Prescription Pickup",
    description:
      "The same kiosk also handles medication pickup. Patients verify their identity to check prescription status — no waiting in line to ask the pharmacist.",
    route: "/pickup",
    spotlightSelector: "main",
    spotlightPadding: 8,
    panelPosition: "bottom-right",
    action: () => {
      usePickupStore.getState().resetPickup();
    },
    waitAfterAction: 300,
  },
  {
    id: "pickup-result",
    actLabel: "Act 3 — Medication Pickup",
    title: "Ready for Pickup",
    description:
      "Sarah has 2 prescriptions ready — Amoxicillin and a Metformin refill. Clear status indicators show what's ready (green) and what's still being prepared (yellow).",
    route: "/pickup/result",
    spotlightSelector: "main",
    spotlightPadding: 8,
    panelPosition: "bottom-right",
    action: () => {
      usePickupStore
        .getState()
        .verifyForPickup(sarahRecord.phone, sarahRecord.dateOfBirth);
    },
    waitAfterAction: 500,
  },

  // ===== ACT 4: PHARMACIST DASHBOARD =====
  {
    id: "dashboard-overview",
    actLabel: "Act 4 — Pharmacist Dashboard",
    title: "Pharmacist Oversight",
    description:
      "The pharmacist dashboard shows real-time metrics — total consultations, completion rate, escalation rate, and average duration. Complete visibility across all kiosks.",
    route: "/pharmacist/dashboard",
    spotlightSelector: ".space-y-6 > .grid:first-of-type",
    spotlightPadding: 12,
    panelPosition: "bottom-right",
    action: () => {
      useConsultationStore.getState().resetKiosk();
      useAuthStore.getState().login("Dr. Jane Smith", "demo");
    },
    waitAfterAction: 500,
  },
  {
    id: "escalation-queue",
    actLabel: "Act 4 — Pharmacist Dashboard",
    title: "Escalation Queue",
    description:
      "Cases with critical red flags — chest pain, difficulty breathing, high fever — are immediately escalated. The pharmacist reviews each case with full patient context before intervening.",
    route: "/pharmacist/dashboard",
    spotlightSelector: ".lg\\:col-span-2",
    spotlightPadding: 8,
    panelPosition: "top-right",
  },
  {
    id: "consultation-detail",
    actLabel: "Act 4 — Pharmacist Dashboard",
    title: "Escalated Case Deep Dive",
    description:
      "A 67-year-old with diabetes and heart disease reported difficulty breathing and high fever. The system correctly refused to self-recommend and escalated immediately. Full audit trail visible.",
    route: "/pharmacist/consultations/c-002",
    spotlightSelector: ".lg\\:col-span-2",
    spotlightPadding: 8,
    panelPosition: "bottom-right",
    waitAfterAction: 300,
  },
  {
    id: "analytics",
    actLabel: "Act 4 — Pharmacist Dashboard",
    title: "Analytics & Insights",
    description:
      "Track symptom category trends, triage decision ratios, and most common safety flags. Data-driven insights help optimize pharmacy operations and staffing.",
    route: "/pharmacist/analytics",
    spotlightSelector: ".grid.grid-cols-1.lg\\:grid-cols-2",
    spotlightPadding: 12,
    panelPosition: "top-right",
    waitAfterAction: 300,
  },

  // ===== ACT 5: CLOSING =====
  {
    id: "closing",
    actLabel: "The Vision",
    title: "Augmenting, Never Replacing",
    description:
      "Pharmacists freed for clinical care. Patients served faster. Full safety net with conservative escalation. Complete audit trail for compliance. This is the future of pharmacy self-service.",
    panelPosition: "center",
  },
];
