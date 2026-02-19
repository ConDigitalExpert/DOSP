"use client";

import { useConsultationStore } from "@/stores/consultation-store";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConsultationStatus, SymptomCategory, TriageDecision } from "@/lib/types";
import { BarChart3, PieChart, TrendingUp, Activity } from "lucide-react";

export default function AnalyticsPage() {
  const { consultationHistory } = useConsultationStore();

  // Category breakdown
  const categoryBreakdown = Object.values(SymptomCategory).map((cat) => {
    const count = consultationHistory.filter((c) => c.symptoms?.category === cat).length;
    return { category: cat, count };
  }).filter((c) => c.count > 0).sort((a, b) => b.count - a.count);

  const maxCount = Math.max(...categoryBreakdown.map((c) => c.count), 1);

  // Decision breakdown
  const recommended = consultationHistory.filter(
    (c) => c.triageResult?.decision === TriageDecision.RECOMMEND
  ).length;
  const escalated = consultationHistory.filter(
    (c) => c.triageResult?.decision === TriageDecision.ESCALATE
  ).length;

  // Status breakdown
  const statusBreakdown = Object.values(ConsultationStatus).map((status) => {
    const count = consultationHistory.filter((c) => c.status === status).length;
    return { status, count };
  }).filter((s) => s.count > 0);

  // Red flags frequency
  const redFlagCounts: Record<string, number> = {};
  consultationHistory.forEach((c) => {
    c.triageResult?.redFlags.forEach((f) => {
      redFlagCounts[f.description] = (redFlagCounts[f.description] || 0) + 1;
    });
  });
  const topRedFlags = Object.entries(redFlagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const CATEGORY_COLORS: Record<string, string> = {
    HEADACHE: "bg-purple-500",
    COLD_FLU: "bg-blue-500",
    ALLERGY: "bg-green-500",
    DIGESTIVE: "bg-orange-500",
    PAIN: "bg-red-500",
    SKIN: "bg-teal-500",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-1">Consultation trends and insights</p>
      </div>

      <StatsCards consultations={consultationHistory} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Symptom Categories */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Top Symptom Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {categoryBreakdown.map((item) => (
              <div key={item.category} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="font-medium capitalize">
                    {item.category.replace(/_/g, " ")}
                  </span>
                  <span className="text-muted-foreground">{item.count}</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${CATEGORY_COLORS[item.category] || "bg-primary"}`}
                    style={{ width: `${(item.count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {categoryBreakdown.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No data yet</p>
            )}
          </CardContent>
        </Card>

        {/* Decision Breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <PieChart className="w-5 h-5 text-primary" />
              Triage Decisions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-12 py-8">
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center mb-3">
                  <span className="text-3xl font-bold text-success">{recommended}</span>
                </div>
                <p className="text-sm font-medium">Recommended</p>
                <p className="text-xs text-muted-foreground">OTC products suggested</p>
              </div>
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-warning/10 flex items-center justify-center mb-3">
                  <span className="text-3xl font-bold text-warning">{escalated}</span>
                </div>
                <p className="text-sm font-medium">Escalated</p>
                <p className="text-xs text-muted-foreground">Sent to pharmacist</p>
              </div>
            </div>

            {/* Status list */}
            <div className="border-t pt-4 space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground">By Status</h4>
              {statusBreakdown.map((item) => (
                <div key={item.status} className="flex justify-between text-sm">
                  <span className="capitalize">{item.status.replace(/_/g, " ")}</span>
                  <span className="font-semibold">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Red Flags */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Most Common Safety Flags
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topRedFlags.length > 0 ? (
              <div className="space-y-3">
                {topRedFlags.map(([description, count]) => (
                  <div key={description} className="flex items-center gap-4 p-3 rounded-lg bg-muted">
                    <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                      <Activity className="w-5 h-5 text-destructive" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{description}</p>
                    </div>
                    <span className="text-lg font-bold text-muted-foreground">{count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No red flags recorded yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
