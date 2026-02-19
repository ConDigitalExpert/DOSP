"use client";

import { KioskStep, KIOSK_STEP_ORDER, KIOSK_STEP_LABELS } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface ProgressStepperProps {
  currentStep: KioskStep;
}

const VISIBLE_STEPS = KIOSK_STEP_ORDER.filter(
  (s) => s !== KioskStep.WELCOME && s !== KioskStep.SUMMARY
);

export function ProgressStepper({ currentStep }: ProgressStepperProps) {
  if (currentStep === KioskStep.WELCOME || currentStep === KioskStep.SUMMARY) {
    return null;
  }

  const displayStep =
    currentStep === KioskStep.ESCALATION ? KioskStep.RECOMMENDATION : currentStep;
  const currentIndex = VISIBLE_STEPS.indexOf(displayStep);

  return (
    <div className="w-full px-8 py-4">
      <div className="flex items-center justify-between max-w-3xl mx-auto">
        {VISIBLE_STEPS.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300",
                    isCompleted && "bg-success text-white",
                    isCurrent && "bg-primary text-white ring-4 ring-primary/20",
                    !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : index + 1}
                </div>
                <span
                  className={cn(
                    "mt-2 text-xs font-medium whitespace-nowrap",
                    isCurrent ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {KIOSK_STEP_LABELS[step]}
                </span>
              </div>
              {index < VISIBLE_STEPS.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-1 mx-3 rounded-full transition-all duration-500",
                    index < currentIndex ? "bg-success" : "bg-muted"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
