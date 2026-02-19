"use client";

import { useConsultationStore } from "@/stores/consultation-store";
import { MOCK_KIOSKS } from "@/lib/mock-data";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { KioskStatusCard } from "@/components/dashboard/kiosk-status-card";
import { EscalationQueue } from "@/components/dashboard/escalation-queue";
import { ConsultationTable } from "@/components/dashboard/consultation-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Monitor, AlertTriangle, ClipboardList } from "lucide-react";

export default function DashboardPage() {
  const { consultationHistory } = useConsultationStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Monitor kiosk activity and manage consultations</p>
      </div>

      {/* Stats */}
      <StatsCards consultations={consultationHistory} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kiosk Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Monitor className="w-5 h-5 text-primary" />
              Active Kiosks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {MOCK_KIOSKS.map((kiosk) => (
              <KioskStatusCard key={kiosk.id} kiosk={kiosk} />
            ))}
          </CardContent>
        </Card>

        {/* Escalation Queue */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Escalation Queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EscalationQueue consultations={consultationHistory} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Consultations */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-primary" />
            Recent Consultations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ConsultationTable consultations={consultationHistory} />
        </CardContent>
      </Card>
    </div>
  );
}
