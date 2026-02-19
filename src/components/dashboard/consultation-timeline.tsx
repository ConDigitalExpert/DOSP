"use client";

import { type AuditLogEntry, AuditActor } from "@/lib/types";
import { formatTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Bot, User, Stethoscope } from "lucide-react";

interface ConsultationTimelineProps {
  entries: AuditLogEntry[];
}

const ACTOR_CONFIG = {
  [AuditActor.SYSTEM]: { icon: Bot, color: "bg-primary/10 text-primary", label: "System" },
  [AuditActor.PATIENT]: { icon: User, color: "bg-muted text-muted-foreground", label: "Patient" },
  [AuditActor.PHARMACIST]: { icon: Stethoscope, color: "bg-success/10 text-success", label: "Pharmacist" },
};

export function ConsultationTimeline({ entries }: ConsultationTimelineProps) {
  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />

      <div className="space-y-4">
        {entries.map((entry, i) => {
          const config = ACTOR_CONFIG[entry.actor];
          const Icon = config.icon;
          const timestamp = entry.timestamp instanceof Date ? entry.timestamp : new Date(entry.timestamp);

          return (
            <div key={i} className="relative flex gap-4 pl-0">
              {/* Icon */}
              <div
                className={cn(
                  "relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                  config.color
                )}
              >
                <Icon className="w-4 h-4" />
              </div>

              {/* Content */}
              <div className="flex-1 pb-4">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm capitalize">
                    {entry.action.replace(/_/g, " ")}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(timestamp)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{entry.details}</p>
                <span className="text-xs text-muted-foreground">{config.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
