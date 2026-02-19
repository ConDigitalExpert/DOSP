// ===== Symptom Types =====
export enum SymptomCategory {
  HEADACHE = "HEADACHE",
  COLD_FLU = "COLD_FLU",
  ALLERGY = "ALLERGY",
  DIGESTIVE = "DIGESTIVE",
  PAIN = "PAIN",
  SKIN = "SKIN",
}

export interface SubSymptom {
  id: string;
  label: string;
  isRedFlag?: boolean;
}

export interface SymptomCategoryInfo {
  id: SymptomCategory;
  label: string;
  icon: string;
  description: string;
  subSymptoms: SubSymptom[];
}

export interface SymptomEntry {
  category: SymptomCategory;
  subSymptoms: string[];
  severity: number; // 1-5
  durationDays: number;
}

// ===== Patient Types =====
export type PregnancyStatus = "not_pregnant" | "pregnant" | "breastfeeding" | "not_applicable";

export interface PatientProfile {
  ageGroup: string;
  weight?: number;
  conditions: string[];
  currentMedications: string[];
  allergies: string[];
  pregnancyStatus: PregnancyStatus;
}

// ===== Vitals Types =====
export interface VitalSigns {
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  temperature?: number; // Fahrenheit
  heartRate?: number;
  spO2?: number;
}

// ===== OTC Product Types =====
export interface OTCProduct {
  id: string;
  name: string;
  genericName: string;
  categories: SymptomCategory[];
  dosageAdult: string;
  dosageChild?: string;
  warnings: string[];
  contraindications: string[];
  drugInteractions: string[];
  allergens: string[];
  minAge: number;
  maxAge?: number;
  pregnancySafe: boolean;
}

// ===== Triage Types =====
export enum TriageDecision {
  RECOMMEND = "RECOMMEND",
  ESCALATE = "ESCALATE",
}

export interface RedFlag {
  rule: string;
  description: string;
  severity: "critical" | "high" | "moderate";
}

export interface TriageResult {
  decision: TriageDecision;
  confidence: number;
  recommendedProducts: OTCProduct[];
  reasoning: string[];
  redFlags: RedFlag[];
  escalationReason?: string;
}

// ===== Prescription Types =====
export interface Prescription {
  id: string;
  medicationName: string;
  dosage: string;
  prescribedBy: string;
  prescribedDate: Date;
  status: "ready" | "processing";
  estimatedReadyMinutes?: number;
  quantity: string;
}

export type PickupStatus = "idle" | "verifying" | "success" | "processing" | "not_found" | "no_prescriptions";

// ===== Consultation Types =====
export enum ConsultationStatus {
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  ESCALATED = "ESCALATED",
  PHARMACIST_RESOLVED = "PHARMACIST_RESOLVED",
  CANCELLED = "CANCELLED",
}

export enum AuditActor {
  SYSTEM = "SYSTEM",
  PATIENT = "PATIENT",
  PHARMACIST = "PHARMACIST",
}

export interface AuditLogEntry {
  timestamp: Date;
  action: string;
  details: string;
  actor: AuditActor;
}

export interface Consultation {
  id: string;
  kioskId: string;
  startTime: Date;
  endTime?: Date;
  status: ConsultationStatus;
  symptoms?: SymptomEntry;
  patient?: PatientProfile;
  vitals?: VitalSigns;
  triageResult?: TriageResult;
  pharmacistNotes?: string;
  pharmacistAction?: string;
  verifiedPatientId?: string;
  isProfilePreFilled?: boolean;
  auditLog: AuditLogEntry[];
}

// ===== Kiosk Flow Types =====
export enum KioskStep {
  WELCOME = "WELCOME",
  VERIFICATION = "VERIFICATION",
  SYMPTOMS = "SYMPTOMS",
  SCREENING = "SCREENING",
  VITALS = "VITALS",
  RECOMMENDATION = "RECOMMENDATION",
  ESCALATION = "ESCALATION",
  SUMMARY = "SUMMARY",
}

export const KIOSK_STEP_ORDER: KioskStep[] = [
  KioskStep.WELCOME,
  KioskStep.VERIFICATION,
  KioskStep.SYMPTOMS,
  KioskStep.SCREENING,
  KioskStep.VITALS,
  KioskStep.RECOMMENDATION,
  KioskStep.SUMMARY,
];

export const KIOSK_STEP_LABELS: Record<KioskStep, string> = {
  [KioskStep.WELCOME]: "Welcome",
  [KioskStep.VERIFICATION]: "Verification",
  [KioskStep.SYMPTOMS]: "Symptoms",
  [KioskStep.SCREENING]: "Screening",
  [KioskStep.VITALS]: "Vitals",
  [KioskStep.RECOMMENDATION]: "Recommendation",
  [KioskStep.ESCALATION]: "Escalation",
  [KioskStep.SUMMARY]: "Summary",
};

// ===== Kiosk Status Types =====
export interface KioskInfo {
  id: string;
  name: string;
  location: string;
  status: "online" | "in_use" | "offline";
  currentConsultationId?: string;
}
