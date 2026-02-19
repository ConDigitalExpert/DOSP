"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, SkipForward, AlertCircle } from "lucide-react";

interface PatientVerificationProps {
  onVerified: (phone: string, dob: string) => void;
  onSkip?: () => void;
  title: string;
  subtitle: string;
  submitLabel: string;
  error?: string | null;
}

export function PatientVerification({
  onVerified,
  onSkip,
  title,
  subtitle,
  submitLabel,
  error,
}: PatientVerificationProps) {
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");

  const isValid = phone.trim().length >= 7 && dob.length > 0;

  const handleSubmit = () => {
    if (!isValid) return;
    onVerified(phone, dob);
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold">{title}</h2>
        <p className="text-muted-foreground mt-2 text-lg">{subtitle}</p>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-lg font-semibold">Phone Number</Label>
          <p className="text-sm text-muted-foreground mt-1">
            The phone number registered with this pharmacy
          </p>
          <Input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="555-123-4567"
            className="mt-3 text-lg"
          />
        </div>

        <div>
          <Label className="text-lg font-semibold">Date of Birth</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Used to verify your identity
          </p>
          <Input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            max={today}
            className="mt-3 text-lg"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 text-destructive">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="space-y-3 pt-2">
        <Button
          size="kiosk"
          onClick={handleSubmit}
          disabled={!isValid}
          className="w-full"
        >
          <Search className="w-5 h-5 mr-2" />
          {submitLabel}
        </Button>

        {onSkip && (
          <Button
            variant="ghost"
            size="lg"
            onClick={onSkip}
            className="w-full text-muted-foreground"
          >
            <SkipForward className="w-4 h-4 mr-2" />
            Skip — I&apos;m a new patient
          </Button>
        )}
      </div>
    </div>
  );
}
