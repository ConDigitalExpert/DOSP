"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConsultationStore } from "@/stores/consultation-store";
import { ConsultationReceipt } from "@/components/kiosk/consultation-receipt";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

export default function SummaryPage() {
  const router = useRouter();
  const { consultation, resetKiosk } = useConsultationStore();

  useEffect(() => {
    if (!consultation) {
      router.replace("/");
    }
  }, [consultation, router]);

  if (!consultation) return null;

  const handleNewConsultation = () => {
    resetKiosk();
    router.push("/");
  };

  return (
    <div className="space-y-8 max-w-xl mx-auto">
      <div className="text-center">
        <h2 className="text-3xl font-bold">Thank You!</h2>
        <p className="text-muted-foreground mt-2 text-lg">
          Here is your consultation summary
        </p>
      </div>

      <ConsultationReceipt consultation={consultation!} />

      <div className="text-center pt-4">
        <Button size="kiosk" onClick={handleNewConsultation}>
          <RotateCcw className="w-5 h-5 mr-2" />
          Start New Consultation
        </Button>
      </div>
    </div>
  );
}
