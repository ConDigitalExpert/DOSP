"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useConsultationStore } from "@/stores/consultation-store";
import { EscalationNotice } from "@/components/kiosk/escalation-notice";
import { Button } from "@/components/ui/button";
import { UserCheck, RotateCcw } from "lucide-react";

export default function EscalationPage() {
  const router = useRouter();
  const { consultation, resetKiosk } = useConsultationStore();
  const [waitTime, setWaitTime] = useState(0);

  useEffect(() => {
    if (!consultation) {
      router.replace("/");
    }
  }, [consultation, router]);

  useEffect(() => {
    const timer = setInterval(() => setWaitTime((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!consultation) return null;

  const result = consultation!.triageResult;

  const handleNewConsultation = () => {
    resetKiosk();
    router.push("/");
  };

  const formatWait = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-warning/10 mb-4">
          <UserCheck className="w-10 h-10 text-warning" />
        </div>
        <h2 className="text-3xl font-bold">Please Wait for a Pharmacist</h2>
        <p className="text-muted-foreground mt-2 text-lg">
          Your case requires professional consultation for your safety
        </p>
        <div className="mt-4 text-sm text-muted-foreground">
          Waiting: <span className="font-mono font-bold text-foreground">{formatWait(waitTime)}</span>
        </div>
      </div>

      {result && <EscalationNotice result={result} />}

      <div className="pt-4 text-center">
        <Button variant="outline" size="lg" onClick={handleNewConsultation}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Start New Consultation
        </Button>
      </div>
    </div>
  );
}
