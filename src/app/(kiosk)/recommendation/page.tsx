"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConsultationStore } from "@/stores/consultation-store";
import { ProductCard } from "@/components/kiosk/product-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TriageDecision } from "@/lib/types";
import { CheckCircle, UserCheck, Shield } from "lucide-react";

export default function RecommendationPage() {
  const router = useRouter();
  const { consultation, completeConsultation } = useConsultationStore();

  useEffect(() => {
    if (!consultation) {
      router.replace("/");
    }
  }, [consultation, router]);

  if (!consultation || consultation.triageResult?.decision !== TriageDecision.RECOMMEND) return null;

  const result = consultation!.triageResult!;

  const handleAccept = () => {
    completeConsultation();
    router.push("/summary");
  };

  const handleSeePharmacist = () => {
    router.push("/escalation");
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 mb-4">
          <CheckCircle className="w-8 h-8 text-success" />
        </div>
        <h2 className="text-3xl font-bold">Recommended for You</h2>
        <p className="text-muted-foreground mt-2 text-lg">
          Based on your symptoms and safety screening
        </p>
        <div className="flex items-center justify-center gap-2 mt-3">
          <Shield className="w-4 h-4 text-success" />
          <span className="text-sm text-success font-medium">
            Confidence: {(result.confidence * 100).toFixed(0)}%
          </span>
          {result.redFlags.length > 0 && (
            <Badge variant="warning" className="ml-2">
              {result.redFlags.length} note(s)
            </Badge>
          )}
        </div>
      </div>

      {/* Product Cards */}
      <div className="space-y-4">
        {result.recommendedProducts.map((product, index) => (
          <ProductCard key={product.id} product={product} rank={index + 1} />
        ))}
      </div>

      {/* Disclaimer */}
      <div className="p-4 rounded-xl bg-muted text-center">
        <p className="text-sm text-muted-foreground">
          This is an AI-assisted suggestion, not a medical prescription. Always read the product label.
          If symptoms persist or worsen, consult a pharmacist or physician.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Button variant="outline" size="lg" onClick={handleSeePharmacist} className="flex-1">
          <UserCheck className="w-5 h-5 mr-2" />
          Speak to Pharmacist
        </Button>
        <Button size="kiosk" variant="success" onClick={handleAccept} className="flex-[2]">
          Accept Recommendation
        </Button>
      </div>
    </div>
  );
}
