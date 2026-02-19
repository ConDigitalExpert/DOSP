"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConsultationStore } from "@/stores/consultation-store";
import { VitalsInput } from "@/components/kiosk/vitals-input";
import { KioskStep, type VitalSigns } from "@/lib/types";

export default function VitalsPage() {
  const router = useRouter();
  const { consultation, setVitals } = useConsultationStore();

  useEffect(() => {
    if (!consultation) {
      router.replace("/");
    }
  }, [consultation, router]);

  if (!consultation) return null;

  const handleSubmit = (vitals: VitalSigns) => {
    setVitals(vitals);
    const { currentStep: nextStep } = useConsultationStore.getState();
    if (nextStep === KioskStep.ESCALATION) {
      router.push("/escalation");
    } else {
      router.push("/recommendation");
    }
  };

  const handleSkip = () => {
    setVitals(null);
    const { currentStep: nextStep } = useConsultationStore.getState();
    if (nextStep === KioskStep.ESCALATION) {
      router.push("/escalation");
    } else {
      router.push("/recommendation");
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold">Optional Vitals Check</h2>
        <p className="text-muted-foreground mt-2 text-lg">
          If vital sign readings are available, enter them below for a more accurate assessment
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          You can skip this step if vitals are not available
        </p>
      </div>
      <VitalsInput onSubmit={handleSubmit} onSkip={handleSkip} />
    </div>
  );
}
