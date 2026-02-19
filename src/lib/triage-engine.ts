import {
  TriageDecision,
  type SymptomEntry,
  type PatientProfile,
  type VitalSigns,
  type TriageResult,
  type OTCProduct,
} from "./types";
import { getProductsByCategory } from "./otc-catalog";
import { detectRedFlags } from "./red-flags";

export function runTriage(
  symptoms: SymptomEntry,
  patient: PatientProfile,
  vitals?: VitalSigns
): TriageResult {
  const reasoning: string[] = [];
  const redFlags = detectRedFlags(symptoms, patient, vitals);

  // Phase 1: Red Flag Check — any critical flag = instant escalation
  const criticalFlags = redFlags.filter((f) => f.severity === "critical");
  if (criticalFlags.length > 0) {
    reasoning.push("Critical red flag(s) detected — immediate pharmacist escalation required.");
    return {
      decision: TriageDecision.ESCALATE,
      confidence: 1.0,
      recommendedProducts: [],
      reasoning,
      redFlags,
      escalationReason: criticalFlags.map((f) => f.description).join("; "),
    };
  }

  // Phase 2: Get candidate products for the symptom category
  let candidates = getProductsByCategory(symptoms.category);
  reasoning.push(`Found ${candidates.length} candidate product(s) for ${symptoms.category}.`);

  // Phase 3: Age filtering
  const age = parseInt(patient.ageGroup);
  if (!isNaN(age)) {
    candidates = candidates.filter((p) => {
      if (age < p.minAge) return false;
      if (p.maxAge && age > p.maxAge) return false;
      return true;
    });
    reasoning.push(`After age filtering (${age}): ${candidates.length} product(s) remain.`);
  }

  // Phase 4: Pregnancy filter
  if (patient.pregnancyStatus === "pregnant" || patient.pregnancyStatus === "breastfeeding") {
    candidates = candidates.filter((p) => p.pregnancySafe);
    reasoning.push(
      `Patient is ${patient.pregnancyStatus} — filtered to pregnancy-safe products: ${candidates.length} remain.`
    );
  }

  // Phase 5: Contraindication & condition check
  const patientConditionsLower = patient.conditions.map((c) => c.toLowerCase());
  candidates = candidates.filter((p) => {
    const hasContraindication = p.contraindications.some((ci) =>
      patientConditionsLower.some((pc) => pc.includes(ci) || ci.includes(pc))
    );
    return !hasContraindication;
  });
  reasoning.push(`After contraindication check: ${candidates.length} product(s) remain.`);

  // Phase 6: Drug interaction check
  const patientMedsLower = patient.currentMedications.map((m) => m.toLowerCase());
  candidates = candidates.filter((p) => {
    const hasInteraction = p.drugInteractions.some((di) =>
      patientMedsLower.some((pm) => pm.includes(di.toLowerCase()) || di.toLowerCase().includes(pm))
    );
    return !hasInteraction;
  });
  reasoning.push(`After drug interaction check: ${candidates.length} product(s) remain.`);

  // Phase 7: Allergy filter
  const patientAllergiesLower = patient.allergies.map((a) => a.toLowerCase());
  candidates = candidates.filter((p) => {
    const hasAllergen = p.allergens.some((al) =>
      patientAllergiesLower.some((pa) => pa.includes(al.toLowerCase()) || al.toLowerCase().includes(pa))
    );
    return !hasAllergen;
  });
  reasoning.push(`After allergy filter: ${candidates.length} product(s) remain.`);

  // Decision: if any high red flags remain, still escalate
  const highFlags = redFlags.filter((f) => f.severity === "high");
  if (highFlags.length >= 2) {
    reasoning.push("Multiple high-severity flags detected — escalating for safety.");
    return {
      decision: TriageDecision.ESCALATE,
      confidence: 0.8,
      recommendedProducts: candidates.slice(0, 3),
      reasoning,
      redFlags,
      escalationReason: "Multiple high-severity safety concerns detected.",
    };
  }

  // No products left = escalate
  if (candidates.length === 0) {
    reasoning.push("No suitable products after all safety filtering — pharmacist consultation needed.");
    return {
      decision: TriageDecision.ESCALATE,
      confidence: 0.9,
      recommendedProducts: [],
      reasoning,
      redFlags,
      escalationReason: "No suitable OTC products available after safety screening.",
    };
  }

  // Success — recommend top products
  const recommended = candidates.slice(0, 3);
  const confidence = redFlags.length === 0 ? 0.95 : 0.75;
  reasoning.push(
    `Recommending ${recommended.length} product(s) with ${(confidence * 100).toFixed(0)}% confidence.`
  );

  return {
    decision: TriageDecision.RECOMMEND,
    confidence,
    recommendedProducts: recommended,
    reasoning,
    redFlags,
  };
}
