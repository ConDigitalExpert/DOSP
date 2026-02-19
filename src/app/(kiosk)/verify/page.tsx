"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConsultationStore } from "@/stores/consultation-store";
import { PatientVerification } from "@/components/kiosk/patient-verification";
import { lookupPatient } from "@/lib/patient-records";

export default function VerifyPage() {
  const router = useRouter();
  const { consultation, startConsultation, setVerifiedPatient, skipVerification } =
    useConsultationStore();
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // If no active consultation exists (direct navigation or after static-export
    // hydration where Zustand initialises fresh), start one automatically so the
    // flow always begins cleanly from this page.
    if (!consultation) {
      startConsultation();
    }
    setReady(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Avoid flicker during hydration
  if (!ready) return null;

  const handleVerified = (phone: string, dob: string) => {
    const record = lookupPatient(phone, dob);
    if (record) {
      setVerifiedPatient(record.id, record.profile);
      router.push("/symptoms");
    } else {
      setError("No patient file found. You can continue as a new patient or try again.");
    }
  };

  const handleSkip = () => {
    skipVerification();
    router.push("/symptoms");
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <PatientVerification
        title="Verify Your Identity"
        subtitle="Enter your phone number and date of birth to load your pharmacy file"
        submitLabel="Look Up My File"
        onVerified={handleVerified}
        onSkip={handleSkip}
        error={error}
      />
    </div>
  );
}
