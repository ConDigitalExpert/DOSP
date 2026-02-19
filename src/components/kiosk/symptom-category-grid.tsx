"use client";

import { SYMPTOM_CATALOG } from "@/lib/symptom-catalog";
import { type SymptomCategory } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Brain, Thermometer, Flower2, Apple, Bone, Hand } from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  Brain,
  Thermometer,
  Flower2,
  Apple,
  Bone,
  Hand,
};

const COLOR_MAP: Record<string, string> = {
  HEADACHE: "hover:border-purple-400 hover:bg-purple-50",
  COLD_FLU: "hover:border-blue-400 hover:bg-blue-50",
  ALLERGY: "hover:border-green-400 hover:bg-green-50",
  DIGESTIVE: "hover:border-orange-400 hover:bg-orange-50",
  PAIN: "hover:border-red-400 hover:bg-red-50",
  SKIN: "hover:border-teal-400 hover:bg-teal-50",
};

const SELECTED_COLOR_MAP: Record<string, string> = {
  HEADACHE: "border-purple-500 bg-purple-50 ring-2 ring-purple-200",
  COLD_FLU: "border-blue-500 bg-blue-50 ring-2 ring-blue-200",
  ALLERGY: "border-green-500 bg-green-50 ring-2 ring-green-200",
  DIGESTIVE: "border-orange-500 bg-orange-50 ring-2 ring-orange-200",
  PAIN: "border-red-500 bg-red-50 ring-2 ring-red-200",
  SKIN: "border-teal-500 bg-teal-50 ring-2 ring-teal-200",
};

const ICON_COLOR_MAP: Record<string, string> = {
  HEADACHE: "text-purple-500",
  COLD_FLU: "text-blue-500",
  ALLERGY: "text-green-500",
  DIGESTIVE: "text-orange-500",
  PAIN: "text-red-500",
  SKIN: "text-teal-500",
};

interface SymptomCategoryGridProps {
  selected: SymptomCategory | null;
  onSelect: (category: SymptomCategory) => void;
}

export function SymptomCategoryGrid({ selected, onSelect }: SymptomCategoryGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {SYMPTOM_CATALOG.map((cat) => {
        const Icon = ICON_MAP[cat.icon] || Brain;
        const isSelected = selected === cat.id;

        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={cn(
              "flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-border bg-white transition-all duration-200 cursor-pointer",
              COLOR_MAP[cat.id],
              isSelected && SELECTED_COLOR_MAP[cat.id]
            )}
          >
            <Icon className={cn("w-10 h-10", ICON_COLOR_MAP[cat.id])} />
            <span className="text-lg font-semibold">{cat.label}</span>
            <span className="text-xs text-muted-foreground text-center">{cat.description}</span>
          </button>
        );
      })}
    </div>
  );
}
