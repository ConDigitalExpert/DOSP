import type { SymptomEntry, PatientProfile, VitalSigns, RedFlag } from "./types";
import { getCategoryInfo } from "./symptom-catalog";

export function detectRedFlags(
  symptoms: SymptomEntry,
  patient: PatientProfile,
  vitals?: VitalSigns
): RedFlag[] {
  const flags: RedFlag[] = [];

  // 1. Check sub-symptom red flags from catalog
  const categoryInfo = getCategoryInfo(symptoms.category);
  for (const subId of symptoms.subSymptoms) {
    const sub = categoryInfo.subSymptoms.find((s) => s.id === subId);
    if (sub?.isRedFlag) {
      flags.push({
        rule: `red_flag_symptom:${subId}`,
        description: `Red flag symptom reported: ${sub.label}`,
        severity: "critical",
      });
    }
  }

  // 2. High severity with long duration
  if (symptoms.severity >= 4 && symptoms.durationDays >= 7) {
    flags.push({
      rule: "high_severity_long_duration",
      description: "High severity symptoms persisting for 7+ days",
      severity: "high",
    });
  }

  // 3. Very young or elderly patients
  const age = parseInt(patient.ageGroup);
  if (!isNaN(age)) {
    if (age < 2) {
      flags.push({
        rule: "age_under_2",
        description: "Patient is under 2 years old — pharmacist review required",
        severity: "critical",
      });
    }
    if (age >= 80 && symptoms.severity >= 3) {
      flags.push({
        rule: "elderly_moderate_symptoms",
        description: "Elderly patient (80+) with moderate-to-severe symptoms",
        severity: "high",
      });
    }
  }

  // 4. Pregnancy-related flags
  if (patient.pregnancyStatus === "pregnant" || patient.pregnancyStatus === "breastfeeding") {
    flags.push({
      rule: "pregnancy_breastfeeding",
      description: `Patient is ${patient.pregnancyStatus} — pharmacist consultation recommended`,
      severity: "high",
    });
  }

  // 5. Multiple chronic conditions
  if (patient.conditions.length >= 3) {
    flags.push({
      rule: "multiple_conditions",
      description: "Patient has 3 or more existing conditions — complex case",
      severity: "moderate",
    });
  }

  // 6. Vital sign abnormalities
  if (vitals) {
    if (vitals.bloodPressureSystolic && vitals.bloodPressureSystolic >= 180) {
      flags.push({
        rule: "hypertensive_crisis",
        description: "Systolic blood pressure >= 180 mmHg — hypertensive crisis",
        severity: "critical",
      });
    }
    if (vitals.bloodPressureDiastolic && vitals.bloodPressureDiastolic >= 120) {
      flags.push({
        rule: "hypertensive_crisis_diastolic",
        description: "Diastolic blood pressure >= 120 mmHg — hypertensive crisis",
        severity: "critical",
      });
    }
    if (vitals.temperature && vitals.temperature >= 103) {
      flags.push({
        rule: "high_fever",
        description: "Temperature >= 103°F — high fever",
        severity: "high",
      });
    }
    if (vitals.heartRate && (vitals.heartRate < 50 || vitals.heartRate > 120)) {
      flags.push({
        rule: "abnormal_heart_rate",
        description: `Heart rate ${vitals.heartRate} bpm is outside normal range (50-120)`,
        severity: "high",
      });
    }
    if (vitals.spO2 && vitals.spO2 < 94) {
      flags.push({
        rule: "low_oxygen",
        description: `SpO2 ${vitals.spO2}% is below safe threshold (94%)`,
        severity: "critical",
      });
    }
  }

  return flags;
}
