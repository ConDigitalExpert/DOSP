import {
  ConsultationStatus,
  SymptomCategory,
  TriageDecision,
  AuditActor,
  type Consultation,
  type KioskInfo,
} from "./types";

export const MOCK_KIOSKS: KioskInfo[] = [
  { id: "K-001", name: "Kiosk 1", location: "Front Entrance", status: "online" },
  { id: "K-002", name: "Kiosk 2", location: "OTC Aisle", status: "in_use", currentConsultationId: "active-1" },
  { id: "K-003", name: "Kiosk 3", location: "Pharmacy Counter", status: "offline" },
];

const now = new Date();
const h = (hoursAgo: number) => new Date(now.getTime() - hoursAgo * 3600000);
const m = (minsAgo: number) => new Date(now.getTime() - minsAgo * 60000);

export const MOCK_CONSULTATIONS: Consultation[] = [
  {
    id: "c-001",
    kioskId: "K-001",
    startTime: h(2),
    endTime: h(1.9),
    status: ConsultationStatus.COMPLETED,
    symptoms: {
      category: SymptomCategory.HEADACHE,
      subSymptoms: ["tension_headache", "sinus_pressure"],
      severity: 2,
      durationDays: 1,
    },
    patient: {
      ageGroup: "35",
      conditions: [],
      currentMedications: [],
      allergies: [],
      pregnancyStatus: "not_applicable",
    },
    triageResult: {
      decision: TriageDecision.RECOMMEND,
      confidence: 0.95,
      recommendedProducts: [],
      reasoning: ["No red flags", "Recommended Tylenol Extra Strength"],
      redFlags: [],
    },
    auditLog: [
      { timestamp: h(2), action: "consultation_started", details: "Patient began symptom input", actor: AuditActor.SYSTEM },
      { timestamp: h(1.95), action: "symptoms_entered", details: "Category: Headache, Severity: 2/5", actor: AuditActor.PATIENT },
      { timestamp: h(1.93), action: "screening_completed", details: "No conditions, no medications", actor: AuditActor.PATIENT },
      { timestamp: h(1.92), action: "vitals_skipped", details: "Patient opted to skip vitals check", actor: AuditActor.PATIENT },
      { timestamp: h(1.91), action: "triage_completed", details: "Decision: RECOMMEND, Confidence: 95%", actor: AuditActor.SYSTEM },
      { timestamp: h(1.9), action: "consultation_completed", details: "Patient accepted recommendation: Tylenol Extra Strength", actor: AuditActor.SYSTEM },
    ],
  },
  {
    id: "c-002",
    kioskId: "K-002",
    startTime: h(1),
    endTime: h(0.8),
    status: ConsultationStatus.ESCALATED,
    symptoms: {
      category: SymptomCategory.COLD_FLU,
      subSymptoms: ["cough_wet", "high_fever", "difficulty_breathing"],
      severity: 4,
      durationDays: 3,
    },
    patient: {
      ageGroup: "67",
      conditions: ["diabetes", "heart_disease"],
      currentMedications: ["metformin", "lisinopril"],
      allergies: [],
      pregnancyStatus: "not_applicable",
    },
    triageResult: {
      decision: TriageDecision.ESCALATE,
      confidence: 1.0,
      recommendedProducts: [],
      reasoning: [
        "Critical red flag: Difficulty breathing",
        "Critical red flag: High fever",
        "Multiple existing conditions",
      ],
      redFlags: [
        { rule: "red_flag_symptom:difficulty_breathing", description: "Difficulty breathing", severity: "critical" },
        { rule: "red_flag_symptom:high_fever", description: "High fever reported", severity: "critical" },
      ],
      escalationReason: "Critical red flags: difficulty breathing, high fever",
    },
    auditLog: [
      { timestamp: h(1), action: "consultation_started", details: "Patient began symptom input", actor: AuditActor.SYSTEM },
      { timestamp: h(0.95), action: "symptoms_entered", details: "Category: Cold & Flu, Severity: 4/5", actor: AuditActor.PATIENT },
      { timestamp: h(0.9), action: "screening_completed", details: "Conditions: diabetes, heart disease", actor: AuditActor.PATIENT },
      { timestamp: h(0.85), action: "red_flags_detected", details: "Critical: difficulty breathing, high fever", actor: AuditActor.SYSTEM },
      { timestamp: h(0.85), action: "escalated", details: "Auto-escalated due to critical red flags", actor: AuditActor.SYSTEM },
    ],
  },
  {
    id: "c-003",
    kioskId: "K-001",
    startTime: h(3),
    endTime: h(2.8),
    status: ConsultationStatus.PHARMACIST_RESOLVED,
    symptoms: {
      category: SymptomCategory.ALLERGY,
      subSymptoms: ["itchy_eyes", "sneezing_allergy", "nasal_congestion"],
      severity: 3,
      durationDays: 5,
    },
    patient: {
      ageGroup: "28",
      conditions: [],
      currentMedications: ["sertraline"],
      allergies: [],
      pregnancyStatus: "pregnant",
    },
    triageResult: {
      decision: TriageDecision.ESCALATE,
      confidence: 0.8,
      recommendedProducts: [],
      reasoning: [
        "Patient is pregnant — pharmacist consultation recommended",
        "Filtered to pregnancy-safe products: 0 remain",
      ],
      redFlags: [
        { rule: "pregnancy_breastfeeding", description: "Patient is pregnant", severity: "high" },
      ],
      escalationReason: "Patient is pregnant — no suitable OTC products without pharmacist guidance",
    },
    pharmacistNotes: "Recommended saline nasal spray and cold compress. Advised follow-up with OB-GYN if symptoms persist.",
    pharmacistAction: "Recommended non-medicated alternatives",
    auditLog: [
      { timestamp: h(3), action: "consultation_started", details: "Patient began symptom input", actor: AuditActor.SYSTEM },
      { timestamp: h(2.95), action: "symptoms_entered", details: "Category: Allergies, Severity: 3/5", actor: AuditActor.PATIENT },
      { timestamp: h(2.9), action: "screening_completed", details: "Pregnant, on sertraline", actor: AuditActor.PATIENT },
      { timestamp: h(2.88), action: "escalated", details: "Pregnancy flag — escalated to pharmacist", actor: AuditActor.SYSTEM },
      { timestamp: h(2.85), action: "pharmacist_review", details: "Pharmacist began review", actor: AuditActor.PHARMACIST },
      { timestamp: h(2.8), action: "pharmacist_resolved", details: "Recommended saline nasal spray", actor: AuditActor.PHARMACIST },
    ],
  },
  {
    id: "c-004",
    kioskId: "K-002",
    startTime: h(4),
    endTime: h(3.85),
    status: ConsultationStatus.COMPLETED,
    symptoms: {
      category: SymptomCategory.DIGESTIVE,
      subSymptoms: ["heartburn", "indigestion"],
      severity: 2,
      durationDays: 2,
    },
    patient: {
      ageGroup: "42",
      conditions: [],
      currentMedications: [],
      allergies: [],
      pregnancyStatus: "not_applicable",
    },
    triageResult: {
      decision: TriageDecision.RECOMMEND,
      confidence: 0.95,
      recommendedProducts: [],
      reasoning: ["No red flags", "Recommended Tums and Prilosec OTC"],
      redFlags: [],
    },
    auditLog: [
      { timestamp: h(4), action: "consultation_started", details: "Patient began symptom input", actor: AuditActor.SYSTEM },
      { timestamp: h(3.95), action: "symptoms_entered", details: "Category: Digestive, Severity: 2/5", actor: AuditActor.PATIENT },
      { timestamp: h(3.9), action: "screening_completed", details: "No conditions", actor: AuditActor.PATIENT },
      { timestamp: h(3.88), action: "triage_completed", details: "Decision: RECOMMEND, Confidence: 95%", actor: AuditActor.SYSTEM },
      { timestamp: h(3.85), action: "consultation_completed", details: "Patient accepted recommendation", actor: AuditActor.SYSTEM },
    ],
  },
  {
    id: "c-005",
    kioskId: "K-001",
    startTime: m(15),
    status: ConsultationStatus.ESCALATED,
    symptoms: {
      category: SymptomCategory.PAIN,
      subSymptoms: ["chest_tightness"],
      severity: 4,
      durationDays: 0,
    },
    patient: {
      ageGroup: "55",
      conditions: ["high_blood_pressure"],
      currentMedications: ["amlodipine"],
      allergies: ["nsaid"],
      pregnancyStatus: "not_applicable",
    },
    triageResult: {
      decision: TriageDecision.ESCALATE,
      confidence: 1.0,
      recommendedProducts: [],
      reasoning: ["Critical red flag: Chest pain or tightness"],
      redFlags: [
        { rule: "red_flag_symptom:chest_tightness", description: "Chest pain or tightness", severity: "critical" },
      ],
      escalationReason: "Critical: chest pain/tightness reported — immediate pharmacist required",
    },
    auditLog: [
      { timestamp: m(15), action: "consultation_started", details: "Patient began symptom input", actor: AuditActor.SYSTEM },
      { timestamp: m(13), action: "symptoms_entered", details: "Category: Pain, Severity: 4/5", actor: AuditActor.PATIENT },
      { timestamp: m(11), action: "screening_completed", details: "Conditions: high BP", actor: AuditActor.PATIENT },
      { timestamp: m(10), action: "red_flags_detected", details: "Critical: chest tightness", actor: AuditActor.SYSTEM },
      { timestamp: m(10), action: "escalated", details: "Auto-escalated — awaiting pharmacist", actor: AuditActor.SYSTEM },
    ],
  },
];
