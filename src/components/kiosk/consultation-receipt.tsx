"use client";

import { type Consultation, TriageDecision, ConsultationStatus } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import { FileText, Clock, Pill, Shield, QrCode } from "lucide-react";

interface ConsultationReceiptProps {
  consultation: Consultation;
}

export function ConsultationReceipt({ consultation }: ConsultationReceiptProps) {
  const { symptoms, patient, triageResult, startTime, endTime, id } = consultation;

  return (
    <Card className="border-2">
      <CardHeader className="text-center border-b">
        <div className="flex justify-center mb-2">
          <FileText className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">Consultation Summary</CardTitle>
        <div className="text-sm text-muted-foreground space-y-1">
          <p>Reference: <span className="font-mono font-semibold">{id.slice(0, 12).toUpperCase()}</span></p>
          <p>{formatDateTime(startTime)}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">Status</span>
          <Badge
            variant={
              consultation.status === ConsultationStatus.COMPLETED
                ? "success"
                : consultation.status === ConsultationStatus.ESCALATED
                ? "warning"
                : "secondary"
            }
          >
            {consultation.status.replace(/_/g, " ")}
          </Badge>
        </div>

        {/* Duration */}
        {endTime && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" /> Duration
            </span>
            <span className="text-sm font-semibold">
              {Math.round((endTime.getTime() - startTime.getTime()) / 60000)} min
            </span>
          </div>
        )}

        {/* Symptoms */}
        {symptoms && (
          <div className="p-4 rounded-xl bg-muted">
            <h4 className="text-sm font-semibold mb-2">Symptoms</h4>
            <p className="text-sm">Category: <span className="font-medium">{symptoms.category.replace(/_/g, " ")}</span></p>
            <p className="text-sm">Severity: <span className="font-medium">{symptoms.severity}/5</span></p>
          </div>
        )}

        {/* Recommendation */}
        {triageResult && triageResult.decision === TriageDecision.RECOMMEND && (
          <div className="p-4 rounded-xl bg-success/5 border border-success/20">
            <div className="flex items-center gap-2 mb-2">
              <Pill className="w-4 h-4 text-success" />
              <h4 className="text-sm font-semibold text-success">Recommended Products</h4>
            </div>
            <ul className="text-sm space-y-1">
              {triageResult.recommendedProducts.map((p) => (
                <li key={p.id} className="font-medium">{p.name} ({p.genericName})</li>
              ))}
            </ul>
          </div>
        )}

        {/* Escalation note */}
        {triageResult && triageResult.decision === TriageDecision.ESCALATE && (
          <div className="p-4 rounded-xl bg-warning/5 border border-warning/20">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-warning" />
              <h4 className="text-sm font-semibold text-warning">Referred to Pharmacist</h4>
            </div>
            <p className="text-sm">{triageResult.escalationReason}</p>
          </div>
        )}

        {/* QR Code placeholder */}
        <div className="flex flex-col items-center gap-2 pt-4 border-t">
          <div className="w-32 h-32 bg-muted rounded-xl flex items-center justify-center border-2 border-dashed border-border">
            <QrCode className="w-16 h-16 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground">Scan for digital copy of this summary</p>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground text-center">
          This consultation has been logged for quality assurance purposes. All data is handled in compliance with healthcare privacy regulations.
        </p>
      </CardContent>
    </Card>
  );
}
