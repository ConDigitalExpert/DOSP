"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePickupStore } from "@/stores/pickup-store";
import { PatientVerification } from "@/components/kiosk/patient-verification";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PickupPage() {
  const router = useRouter();
  const { status, verifyForPickup, resetPickup } = usePickupStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    resetPickup();
  }, [resetPickup]);

  useEffect(() => {
    if (status === "success" || status === "processing" || status === "not_found" || status === "no_prescriptions") {
      router.push("/pickup/result");
    }
  }, [status, router]);

  const handleVerified = (phone: string, dob: string) => {
    setError(null);
    verifyForPickup(phone, dob);
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <PatientVerification
        title="Medication Pickup"
        subtitle="Enter your phone number and date of birth to check your prescriptions"
        submitLabel="Check My Prescriptions"
        onVerified={handleVerified}
        error={error}
      />

      <div className="text-center pt-2">
        <Link href="/">
          <Button variant="ghost" size="lg" className="text-muted-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
