"use client";

import { type Consultation, ConsultationStatus, TriageDecision } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, CheckCircle, AlertTriangle, Clock } from "lucide-react";

interface StatsCardsProps {
  consultations: Consultation[];
}

export function StatsCards({ consultations }: StatsCardsProps) {
  const total = consultations.length;
  const completed = consultations.filter((c) => c.status === ConsultationStatus.COMPLETED).length;
  const escalated = consultations.filter(
    (c) => c.status === ConsultationStatus.ESCALATED || c.status === ConsultationStatus.PHARMACIST_RESOLVED
  ).length;
  const escalationRate = total > 0 ? Math.round((escalated / total) * 100) : 0;

  const avgDuration = consultations
    .filter((c) => c.endTime)
    .reduce((acc, c) => {
      return acc + (c.endTime!.getTime() - c.startTime.getTime());
    }, 0);
  const avgMins = consultations.filter((c) => c.endTime).length > 0
    ? Math.round(avgDuration / consultations.filter((c) => c.endTime).length / 60000)
    : 0;

  const stats = [
    {
      label: "Total Consultations",
      value: total,
      icon: Activity,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Completed",
      value: completed,
      icon: CheckCircle,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      label: "Escalation Rate",
      value: `${escalationRate}%`,
      icon: AlertTriangle,
      color: "text-warning",
      bg: "bg-warning/10",
    },
    {
      label: "Avg. Duration",
      value: `${avgMins} min`,
      icon: Clock,
      color: "text-muted-foreground",
      bg: "bg-muted",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
