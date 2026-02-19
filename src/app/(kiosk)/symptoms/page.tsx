"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConsultationStore } from "@/stores/consultation-store";
import { SymptomCategoryGrid } from "@/components/kiosk/symptom-category-grid";
import { SymptomSelector } from "@/components/kiosk/symptom-selector";
import { type SymptomCategory, type SymptomEntry } from "@/lib/types";

export default function SymptomsPage() {
  const router = useRouter();
  const { consultation, setSymptoms } = useConsultationStore();
  const [selectedCategory, setSelectedCategory] = useState<SymptomCategory | null>(null);

  useEffect(() => {
    if (!consultation) {
      router.replace("/");
    }
  }, [consultation, router]);

  if (!consultation) return null;

  const handleSubmit = (entry: SymptomEntry) => {
    setSymptoms(entry);
    router.push("/screening");
  };

  if (!selectedCategory) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold">What are you experiencing?</h2>
          <p className="text-muted-foreground mt-2 text-lg">
            Select the category that best describes your symptoms
          </p>
        </div>
        <SymptomCategoryGrid selected={selectedCategory} onSelect={setSelectedCategory} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold">Tell us more about your symptoms</h2>
        <p className="text-muted-foreground mt-2 text-lg">
          Select all that apply and rate the severity
        </p>
      </div>
      <SymptomSelector
        category={selectedCategory}
        onSubmit={handleSubmit}
        onBack={() => setSelectedCategory(null)}
      />
    </div>
  );
}
