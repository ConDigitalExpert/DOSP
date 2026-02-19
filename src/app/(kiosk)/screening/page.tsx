"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConsultationStore } from "@/stores/consultation-store";
import { PatientForm } from "@/components/kiosk/patient-form";
import { Badge } from "@/components/ui/badge";
import { type PatientProfile } from "@/lib/types";
import { CheckCircle } from "lucide-react";

export default function ScreeningPage() {
  const router = useRouter();
  const { consultation, setPatient, verifiedPatientProfile } = useConsultationStore();

  useEffect(() => {
    if (!consultation) {
      router.replace("/");
    }
  }, [consultation, router]);

  if (!consultation) return null;

  const handleSubmit = (profile: PatientProfile) => {
    setPatient(profile);
    router.push("/vitals");
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold">Safety Screening</h2>
        <p className="text-muted-foreground mt-2 text-lg">
          {verifiedPatientProfile
            ? "We've loaded your information. Please review and confirm."
            : "Help us ensure any recommendation is safe for you"}
        </p>
        {verifiedPatientProfile && (
          <Badge variant="success" className="mt-3 text-sm gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" />
            Profile loaded from your pharmacy file
          </Badge>
        )}
      </div>
      <PatientForm onSubmit={handleSubmit} initialValues={verifiedPatientProfile ?? undefined} />
    </div>
  );
}
