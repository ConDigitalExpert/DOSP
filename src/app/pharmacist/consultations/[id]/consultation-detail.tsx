"use client";

import { useParams, useRouter } from "next/navigation";
import { useConsultationStore } from "@/stores/consultation-store";
import { ConsultationTimeline } from "@/components/dashboard/consultation-timeline";
import { OverrideControls } from "@/components/dashboard/override-controls";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConsultationStatus, TriageDecision } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import {
  ArrowLeft,
  ClipboardList,
  User,
  Activity,
  Pill,
  AlertTriangle,
  Shield,
} from "lucide-react";

const STATUS_BADGE: Record<ConsultationStatus, { variant: "default" | "success" | "warning" | "destructive" | "secondary"; label: string }> = {
  [ConsultationStatus.IN_PROGRESS]: { variant: "default", label: "In Progress" },
  [ConsultationStatus.COMPLETED]: { variant: "success", label: "Completed" },
  [ConsultationStatus.ESCALATED]: { variant: "warning", label: "Escalated" },
  [ConsultationStatus.PHARMACIST_RESOLVED]: { variant: "default", label: "Pharmacist Resolved" },
  [ConsultationStatus.CANCELLED]: { variant: "secondary", label: "Cancelled" },
};

export default function ConsultationDetail() {
  const params = useParams();
  const router = useRouter();
  const { consultationHistory } = useConsultationStore();

  const consultation = consultationHistory.find((c) => c.id === params.id);

  if (!consultation) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Consultation not found</p>
        <Button variant="outline" onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
        </Button>
      </div>
    );
  }

  const statusInfo = STATUS_BADGE[consultation.status];
  const { symptoms, patient, vitals, triageResult } = consultation;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Consultation Detail</h1>
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {consultation.kioskId} &bull; {formatDateTime(consultation.startTime)} &bull; ID: {consultation.id.slice(0, 12)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Symptoms */}
          {symptoms && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Symptoms
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Category:</span>
                    <p className="font-medium capitalize">{symptoms.category.replace(/_/g, " ")}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Severity:</span>
                    <p className="font-medium">{symptoms.severity}/5</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Duration:</span>
                    <p className="font-medium">{symptoms.durationDays} day(s)</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Sub-symptoms:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {symptoms.subSymptoms.map((s) => (
                        <Badge key={s} variant="secondary" className="text-xs capitalize">
                          {s.replace(/_/g, " ")}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Patient Profile */}
          {patient && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Patient Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Age Group:</span>
                    <p className="font-medium">{patient.ageGroup}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Pregnancy Status:</span>
                    <p className="font-medium capitalize">{patient.pregnancyStatus.replace(/_/g, " ")}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Conditions:</span>
                    <p className="font-medium capitalize">
                      {patient.conditions.length > 0
                        ? patient.conditions.map((c) => c.replace(/_/g, " ")).join(", ")
                        : "None"}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Medications:</span>
                    <p className="font-medium">
                      {patient.currentMedications.length > 0
                        ? patient.currentMedications.join(", ")
                        : "None"}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Allergies:</span>
                    <p className="font-medium capitalize">
                      {patient.allergies.length > 0
                        ? patient.allergies.map((a) => a.replace(/_/g, " ")).join(", ")
                        : "None"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Triage Result */}
          {triageResult && (
            <Card className={triageResult.decision === TriageDecision.ESCALATE ? "border-warning" : ""}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Triage Result
                  <Badge
                    variant={triageResult.decision === TriageDecision.RECOMMEND ? "success" : "warning"}
                  >
                    {triageResult.decision}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm">
                  <span className="text-muted-foreground">Confidence:</span>
                  <span className="font-semibold ml-2">{(triageResult.confidence * 100).toFixed(0)}%</span>
                </div>

                {/* Red Flags */}
                {triageResult.redFlags.length > 0 && (
                  <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-destructive" />
                      <span className="font-semibold text-sm text-destructive">Red Flags</span>
                    </div>
                    <ul className="text-sm space-y-1">
                      {triageResult.redFlags.map((f, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Badge variant={f.severity === "critical" ? "destructive" : f.severity === "high" ? "warning" : "secondary"} className="text-xs">
                            {f.severity}
                          </Badge>
                          {f.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Reasoning */}
                <div>
                  <h4 className="text-sm font-semibold mb-1">Reasoning</h4>
                  <ul className="text-sm text-muted-foreground space-y-0.5">
                    {triageResult.reasoning.map((r, i) => (
                      <li key={i}>&bull; {r}</li>
                    ))}
                  </ul>
                </div>

                {/* Recommended Products */}
                {triageResult.recommendedProducts.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Pill className="w-4 h-4 text-success" />
                      <span className="font-semibold text-sm">Recommended Products</span>
                    </div>
                    <div className="space-y-2">
                      {triageResult.recommendedProducts.map((p) => (
                        <div key={p.id} className="p-3 rounded-lg bg-muted text-sm">
                          <p className="font-medium">{p.name}</p>
                          <p className="text-muted-foreground text-xs">{p.genericName} — {p.dosageAdult}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Pharmacist Actions */}
          <OverrideControls consultation={consultation} />
        </div>

        {/* Right column - Audit Trail */}
        <div>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-primary" />
                Audit Trail
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ConsultationTimeline entries={consultation.auditLog} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
