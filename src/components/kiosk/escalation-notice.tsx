"use client";

import { type TriageResult } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, UserCheck, Shield, Phone } from "lucide-react";

interface EscalationNoticeProps {
  result: TriageResult;
}

export function EscalationNotice({ result }: EscalationNoticeProps) {
  return (
    <div className="space-y-6">
      {/* Reason */}
      {result.escalationReason && (
        <div className="p-6 rounded-2xl bg-destructive/5 border-2 border-destructive/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-destructive text-lg">Reason for Escalation</h3>
              <p className="mt-1 text-foreground">{result.escalationReason}</p>
            </div>
          </div>
        </div>
      )}

      {/* Red Flags */}
      {result.redFlags.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Safety Flags Detected</h3>
          <div className="space-y-2">
            {result.redFlags.map((flag, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white border border-border">
                <Badge
                  variant={
                    flag.severity === "critical"
                      ? "destructive"
                      : flag.severity === "high"
                      ? "warning"
                      : "secondary"
                  }
                  className="text-xs"
                >
                  {flag.severity}
                </Badge>
                <span className="text-sm">{flag.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* What to expect */}
      <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20">
        <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Your Safety is Our Priority
        </h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <UserCheck className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            A pharmacist has been notified and will be with you shortly
          </li>
          <li className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            Your consultation details have been securely shared with the pharmacist
          </li>
          <li className="flex items-start gap-2">
            <Phone className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            If urgent, please speak to any available pharmacy staff immediately
          </li>
        </ul>
      </div>
    </div>
  );
}
