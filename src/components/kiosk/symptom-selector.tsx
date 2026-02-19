"use client";

import { useState } from "react";
import { type SymptomCategory, type SymptomEntry } from "@/lib/types";
import { getCategoryInfo } from "@/lib/symptom-catalog";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Check } from "lucide-react";

interface SymptomSelectorProps {
  category: SymptomCategory;
  onSubmit: (entry: SymptomEntry) => void;
  onBack: () => void;
}

export function SymptomSelector({ category, onSubmit, onBack }: SymptomSelectorProps) {
  const categoryInfo = getCategoryInfo(category);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [severity, setSeverity] = useState(2);
  const [duration, setDuration] = useState(1);

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    if (selectedSymptoms.length === 0) return;
    onSubmit({
      category,
      subSymptoms: selectedSymptoms,
      severity,
      durationDays: duration,
    });
  };

  const severityLabels = ["Very Mild", "Mild", "Moderate", "Severe", "Very Severe"];
  const durationOptions = [
    { value: 0, label: "Today" },
    { value: 1, label: "1 day" },
    { value: 2, label: "2-3 days" },
    { value: 5, label: "4-6 days" },
    { value: 7, label: "1 week+" },
    { value: 14, label: "2 weeks+" },
  ];

  return (
    <div className="space-y-8">
      {/* Sub-symptom selection */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Select your symptoms:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {categoryInfo.subSymptoms.map((sub) => {
            const isSelected = selectedSymptoms.includes(sub.id);
            return (
              <button
                key={sub.id}
                onClick={() => toggleSymptom(sub.id)}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all cursor-pointer",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border bg-white hover:border-primary/40",
                  sub.isRedFlag && isSelected && "border-destructive bg-destructive/5"
                )}
              >
                <div
                  className={cn(
                    "w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0",
                    isSelected
                      ? sub.isRedFlag
                        ? "border-destructive bg-destructive text-white"
                        : "border-primary bg-primary text-white"
                      : "border-border"
                  )}
                >
                  {isSelected && <Check className="w-4 h-4" />}
                </div>
                <span className="font-medium text-base">{sub.label}</span>
                {sub.isRedFlag && (
                  <AlertTriangle className="w-4 h-4 text-destructive ml-auto flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Severity slider */}
      <div>
        <h3 className="text-lg font-semibold mb-3">How severe are your symptoms?</h3>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((level) => (
            <button
              key={level}
              onClick={() => setSeverity(level)}
              className={cn(
                "flex-1 h-14 rounded-xl border-2 font-semibold text-sm transition-all cursor-pointer",
                severity === level
                  ? level <= 2
                    ? "border-success bg-success/10 text-success"
                    : level <= 3
                    ? "border-warning bg-warning/10 text-warning"
                    : "border-destructive bg-destructive/10 text-destructive"
                  : "border-border bg-white hover:bg-muted"
              )}
            >
              {severityLabels[level - 1]}
            </button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div>
        <h3 className="text-lg font-semibold mb-3">How long have you had these symptoms?</h3>
        <div className="flex flex-wrap gap-2">
          {durationOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDuration(opt.value)}
              className={cn(
                "px-5 py-3 rounded-xl border-2 font-medium text-sm transition-all cursor-pointer",
                duration === opt.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-white hover:bg-muted"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 pt-4">
        <Button variant="outline" size="lg" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button
          size="kiosk"
          onClick={handleSubmit}
          disabled={selectedSymptoms.length === 0}
          className="flex-[2]"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
