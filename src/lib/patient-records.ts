import { type PatientProfile, type Prescription } from "@/lib/types";

export interface PatientRecord {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string; // YYYY-MM-DD
  profile: PatientProfile;
  prescriptions: Prescription[];
}

export const MOCK_PATIENT_RECORDS: PatientRecord[] = [
  {
    id: "pr-001",
    firstName: "Sarah",
    lastName: "Johnson",
    phone: "555-100-1001",
    dateOfBirth: "1990-05-15",
    profile: {
      ageGroup: "25",
      conditions: ["diabetes"],
      currentMedications: ["metformin", "lisinopril"],
      allergies: ["nsaid"],
      pregnancyStatus: "not_pregnant",
    },
    prescriptions: [
      {
        id: "rx-001",
        medicationName: "Amoxicillin 500mg",
        dosage: "1 capsule 3 times daily",
        prescribedBy: "Dr. Thompson",
        prescribedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        status: "ready",
        quantity: "21 capsules",
      },
      {
        id: "rx-002",
        medicationName: "Metformin 500mg (Refill)",
        dosage: "1 tablet twice daily",
        prescribedBy: "Dr. Thompson",
        prescribedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        status: "ready",
        quantity: "60 tablets",
      },
    ],
  },
  {
    id: "pr-002",
    firstName: "Michael",
    lastName: "Chen",
    phone: "555-100-1002",
    dateOfBirth: "1978-11-22",
    profile: {
      ageGroup: "45",
      conditions: ["high_blood_pressure", "heart_disease"],
      currentMedications: ["amlodipine", "aspirin"],
      allergies: ["penicillin"],
      pregnancyStatus: "not_applicable",
    },
    prescriptions: [
      {
        id: "rx-003",
        medicationName: "Amlodipine 10mg (Refill)",
        dosage: "1 tablet daily",
        prescribedBy: "Dr. Patel",
        prescribedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: "processing",
        estimatedReadyMinutes: 25,
        quantity: "30 tablets",
      },
    ],
  },
  {
    id: "pr-003",
    firstName: "Emily",
    lastName: "Davis",
    phone: "555-100-1003",
    dateOfBirth: "1995-03-08",
    profile: {
      ageGroup: "25",
      conditions: ["asthma"],
      currentMedications: ["albuterol", "sertraline"],
      allergies: ["sulfa"],
      pregnancyStatus: "pregnant",
    },
    prescriptions: [
      {
        id: "rx-004",
        medicationName: "Prenatal Vitamins",
        dosage: "1 tablet daily",
        prescribedBy: "Dr. Martinez",
        prescribedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        status: "ready",
        quantity: "30 tablets",
      },
    ],
  },
  {
    id: "pr-004",
    firstName: "Robert",
    lastName: "Wilson",
    phone: "555-100-1004",
    dateOfBirth: "1955-09-30",
    profile: {
      ageGroup: "65",
      conditions: ["diabetes", "kidney_disease"],
      currentMedications: ["metformin", "insulin", "lisinopril"],
      allergies: ["aspirin"],
      pregnancyStatus: "not_applicable",
    },
    prescriptions: [
      {
        id: "rx-005",
        medicationName: "Insulin Glargine 100U/mL",
        dosage: "20 units at bedtime",
        prescribedBy: "Dr. Kim",
        prescribedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        status: "processing",
        estimatedReadyMinutes: 45,
        quantity: "1 vial (10mL)",
      },
      {
        id: "rx-006",
        medicationName: "Lisinopril 20mg (Refill)",
        dosage: "1 tablet daily",
        prescribedBy: "Dr. Kim",
        prescribedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        status: "ready",
        quantity: "30 tablets",
      },
    ],
  },
  {
    id: "pr-005",
    firstName: "Aisha",
    lastName: "Patel",
    phone: "555-100-1005",
    dateOfBirth: "2001-01-17",
    profile: {
      ageGroup: "25",
      conditions: [],
      currentMedications: [],
      allergies: [],
      pregnancyStatus: "not_applicable",
    },
    prescriptions: [],
  },
];

export function lookupPatient(phone: string, dob: string): PatientRecord | null {
  const normalizedPhone = phone.replace(/\D/g, "");
  return (
    MOCK_PATIENT_RECORDS.find(
      (r) => r.phone.replace(/\D/g, "") === normalizedPhone && r.dateOfBirth === dob
    ) ?? null
  );
}
