"use client";

import { type Consultation, ConsultationStatus, TriageDecision } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, timeAgo } from "@/lib/utils";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface ConsultationTableProps {
  consultations: Consultation[];
}

const STATUS_BADGE: Record<ConsultationStatus, { variant: "default" | "success" | "warning" | "destructive" | "secondary"; label: string }> = {
  [ConsultationStatus.IN_PROGRESS]: { variant: "default", label: "In Progress" },
  [ConsultationStatus.COMPLETED]: { variant: "success", label: "Completed" },
  [ConsultationStatus.ESCALATED]: { variant: "warning", label: "Escalated" },
  [ConsultationStatus.PHARMACIST_RESOLVED]: { variant: "default", label: "Resolved" },
  [ConsultationStatus.CANCELLED]: { variant: "secondary", label: "Cancelled" },
};

export function ConsultationTable({ consultations }: ConsultationTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="py-3 px-4 font-semibold text-muted-foreground">ID</th>
            <th className="py-3 px-4 font-semibold text-muted-foreground">Kiosk</th>
            <th className="py-3 px-4 font-semibold text-muted-foreground">Category</th>
            <th className="py-3 px-4 font-semibold text-muted-foreground">Status</th>
            <th className="py-3 px-4 font-semibold text-muted-foreground">Decision</th>
            <th className="py-3 px-4 font-semibold text-muted-foreground">Time</th>
            <th className="py-3 px-4"></th>
          </tr>
        </thead>
        <tbody>
          {consultations.map((c) => {
            const statusInfo = STATUS_BADGE[c.status];
            return (
              <tr key={c.id} className="border-b hover:bg-muted/50 transition-colors">
                <td className="py-3 px-4 font-mono text-xs">{c.id.slice(0, 8)}</td>
                <td className="py-3 px-4">{c.kioskId}</td>
                <td className="py-3 px-4 capitalize">
                  {c.symptoms?.category.replace(/_/g, " ") || "—"}
                </td>
                <td className="py-3 px-4">
                  <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                </td>
                <td className="py-3 px-4">
                  {c.triageResult?.decision === TriageDecision.RECOMMEND ? (
                    <span className="text-success font-medium">Recommend</span>
                  ) : c.triageResult?.decision === TriageDecision.ESCALATE ? (
                    <span className="text-warning font-medium">Escalate</span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="py-3 px-4 text-muted-foreground">{timeAgo(c.startTime)}</td>
                <td className="py-3 px-4">
                  <Link
                    href={`/pharmacist/consultations/${c.id}`}
                    className="text-primary hover:text-primary/80 transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
