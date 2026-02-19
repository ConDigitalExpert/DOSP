"use client";

import { type Consultation, ConsultationStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { timeAgo } from "@/lib/utils";
import { AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";

interface EscalationQueueProps {
  consultations: Consultation[];
}

export function EscalationQueue({ consultations }: EscalationQueueProps) {
  const escalated = consultations.filter(
    (c) => c.status === ConsultationStatus.ESCALATED
  );

  if (escalated.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">No pending escalations</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {escalated.map((c) => (
        <div
          key={c.id}
          className="flex items-center gap-4 p-4 rounded-xl border-2 border-warning/30 bg-warning/5"
        >
          <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-warning" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">
                {c.symptoms?.category.replace(/_/g, " ") || "Unknown"}
              </span>
              <Badge variant="warning" className="text-xs">Urgent</Badge>
            </div>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {c.triageResult?.escalationReason || "Requires pharmacist review"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Kiosk {c.kioskId} &bull; {timeAgo(c.startTime)}
            </p>
          </div>
          <Link href={`/pharmacist/consultations/${c.id}`}>
            <Button size="sm" variant="outline">
              Review <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      ))}
    </div>
  );
}
