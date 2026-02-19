"use client";

import { useState } from "react";
import { type PatientProfile, type PregnancyStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface PatientFormProps {
  onSubmit: (profile: PatientProfile) => void;
  initialValues?: PatientProfile;
}

const AGE_GROUPS = [
  { value: "1", label: "Under 2" },
  { value: "5", label: "2-5" },
  { value: "10", label: "6-11" },
  { value: "15", label: "12-17" },
  { value: "25", label: "18-34" },
  { value: "45", label: "35-54" },
  { value: "65", label: "55-74" },
  { value: "80", label: "75+" },
];

const COMMON_CONDITIONS = [
  "diabetes", "heart_disease", "high_blood_pressure", "asthma",
  "kidney_disease", "liver_disease", "stomach_ulcer", "thyroid_disease",
  "glaucoma", "enlarged_prostate",
];

const COMMON_ALLERGIES = ["nsaid", "aspirin", "penicillin", "sulfa", "latex", "neomycin", "salicylate"];

const PREGNANCY_OPTIONS: { value: PregnancyStatus; label: string }[] = [
  { value: "not_applicable", label: "Not applicable" },
  { value: "not_pregnant", label: "Not pregnant" },
  { value: "pregnant", label: "Pregnant" },
  { value: "breastfeeding", label: "Breastfeeding" },
];

export function PatientForm({ onSubmit, initialValues }: PatientFormProps) {
  const [ageGroup, setAgeGroup] = useState(initialValues?.ageGroup ?? "");
  const [conditions, setConditions] = useState<string[]>(initialValues?.conditions ?? []);
  const [medications, setMedications] = useState<string[]>(initialValues?.currentMedications ?? []);
  const [medInput, setMedInput] = useState("");
  const [allergies, setAllergies] = useState<string[]>(initialValues?.allergies ?? []);
  const [pregnancyStatus, setPregnancyStatus] = useState<PregnancyStatus>(initialValues?.pregnancyStatus ?? "not_applicable");

  const handleSubmit = () => {
    if (!ageGroup) return;
    onSubmit({
      ageGroup,
      conditions,
      currentMedications: medications,
      allergies,
      pregnancyStatus,
    });
  };

  const toggleCondition = (c: string) =>
    setConditions((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  const toggleAllergy = (a: string) =>
    setAllergies((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));

  const addMedication = () => {
    if (medInput.trim() && !medications.includes(medInput.trim())) {
      setMedications((prev) => [...prev, medInput.trim()]);
      setMedInput("");
    }
  };

  const removeMedication = (m: string) =>
    setMedications((prev) => prev.filter((x) => x !== m));

  return (
    <div className="space-y-8">
      {/* Age Group */}
      <div>
        <Label className="text-lg font-semibold">Age Group *</Label>
        <div className="flex flex-wrap gap-2 mt-3">
          {AGE_GROUPS.map((ag) => (
            <button
              key={ag.value}
              onClick={() => setAgeGroup(ag.value)}
              className={cn(
                "px-5 py-3 rounded-xl border-2 font-medium transition-all cursor-pointer",
                ageGroup === ag.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-white hover:bg-muted"
              )}
            >
              {ag.label}
            </button>
          ))}
        </div>
      </div>

      {/* Existing Conditions */}
      <div>
        <Label className="text-lg font-semibold">Do you have any existing conditions?</Label>
        <p className="text-sm text-muted-foreground mt-1">Select all that apply, or skip if none</p>
        <div className="flex flex-wrap gap-2 mt-3">
          {COMMON_CONDITIONS.map((c) => (
            <button
              key={c}
              onClick={() => toggleCondition(c)}
              className={cn(
                "px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all cursor-pointer capitalize",
                conditions.includes(c)
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-white hover:bg-muted"
              )}
            >
              {c.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Current Medications */}
      <div>
        <Label className="text-lg font-semibold">Current Medications</Label>
        <p className="text-sm text-muted-foreground mt-1">Type and press Enter to add</p>
        <div className="flex gap-2 mt-3">
          <Input
            value={medInput}
            onChange={(e) => setMedInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addMedication()}
            placeholder="e.g., Lisinopril, Metformin..."
          />
          <Button variant="outline" onClick={addMedication}>
            Add
          </Button>
        </div>
        {medications.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {medications.map((m) => (
              <span
                key={m}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary text-sm font-medium"
              >
                {m}
                <button onClick={() => removeMedication(m)} className="ml-1 cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Allergies */}
      <div>
        <Label className="text-lg font-semibold">Known Allergies</Label>
        <div className="flex flex-wrap gap-2 mt-3">
          {COMMON_ALLERGIES.map((a) => (
            <button
              key={a}
              onClick={() => toggleAllergy(a)}
              className={cn(
                "px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all cursor-pointer capitalize",
                allergies.includes(a)
                  ? "border-destructive bg-destructive/10 text-destructive"
                  : "border-border bg-white hover:bg-muted"
              )}
            >
              {a.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Pregnancy Status */}
      <div>
        <Label className="text-lg font-semibold">Pregnancy Status</Label>
        <div className="flex flex-wrap gap-2 mt-3">
          {PREGNANCY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPregnancyStatus(opt.value)}
              className={cn(
                "px-5 py-3 rounded-xl border-2 font-medium transition-all cursor-pointer",
                pregnancyStatus === opt.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-white hover:bg-muted"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <div className="pt-4">
        <Button
          size="kiosk"
          onClick={handleSubmit}
          disabled={!ageGroup}
          className="w-full"
        >
          Continue to Vitals Check
        </Button>
      </div>
    </div>
  );
}
