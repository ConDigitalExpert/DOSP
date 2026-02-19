"use client";

import { useRouter } from "next/navigation";
import { useConsultationStore } from "@/stores/consultation-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";
import {
  MonitorSmartphone,
  Stethoscope,
  Shield,
  Zap,
  UserCheck,
  BarChart3,
  Pill,
} from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  const router = useRouter();
  const { startConsultation } = useConsultationStore();

  const handleStartKiosk = () => {
    startConsultation();
    router.push("/verify");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-sky-50">
      {/* Hero */}
      <div className="max-w-5xl mx-auto px-6 pt-16 pb-12 text-center">
        <div className="flex justify-center mb-6">
          <Image src="/dosp-logo.jpg" alt="DOSP" width={80} height={80} />
        </div>
        <h1 className="text-5xl font-bold text-foreground leading-tight">
          DOSP
        </h1>
        <p className="text-xl text-primary font-semibold mt-2">
          Digital Off-the-Shelf Pharmacist
        </p>
        <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
          AI-Powered OTC Triage that frees pharmacists for clinical care.
          Safe, conservative, and always backed by a real pharmacist.
        </p>

        {/* Entry Points */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-5xl mx-auto">
          <Card className="h-full border-2 transition-all hover:border-primary hover:shadow-lg hover:scale-[1.02]">
            <CardHeader className="text-center pb-3">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <MonitorSmartphone className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Patient Kiosk</CardTitle>
              <CardDescription>Start an OTC consultation</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button size="lg" className="w-full" onClick={handleStartKiosk}>
                Start Consultation
              </Button>
              <p className="text-xs text-muted-foreground mt-3">
                Touch-friendly kiosk interface for patients
              </p>
            </CardContent>
          </Card>

          <Link href="/pickup" className="group">
            <Card className="h-full border-2 transition-all hover:border-green-500 hover:shadow-lg group-hover:scale-[1.02]">
              <CardHeader className="text-center pb-3">
                <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-3">
                  <Pill className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">Medication Pickup</CardTitle>
                <CardDescription>Collect your prescription</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button size="lg" variant="outline" className="w-full">
                  Pick Up Medication
                </Button>
                <p className="text-xs text-muted-foreground mt-3">
                  Verify identity and collect ready prescriptions
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/pharmacist/login" className="group">
            <Card className="h-full border-2 transition-all hover:border-primary hover:shadow-lg group-hover:scale-[1.02]">
              <CardHeader className="text-center pb-3">
                <div className="w-16 h-16 rounded-2xl bg-slate-900/10 flex items-center justify-center mx-auto mb-3">
                  <Stethoscope className="w-8 h-8 text-slate-900" />
                </div>
                <CardTitle className="text-xl">Pharmacist Dashboard</CardTitle>
                <CardDescription>Monitor and manage consultations</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button size="lg" variant="outline" className="w-full">
                  Sign In
                </Button>
                <p className="text-xs text-muted-foreground mt-3">
                  Review escalations, audit trails, and analytics
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-center mb-8">Built for Safety & Efficiency</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Shield,
              title: "Conservative by Design",
              description: "If in doubt, DOSP escalates. Only clear-cut, low-risk OTC scenarios are handled autonomously.",
              color: "text-success",
              bg: "bg-success/10",
            },
            {
              icon: Zap,
              title: "Fast & Intuitive",
              description: "Patients get OTC guidance in 2-3 minutes through a simple touch interface.",
              color: "text-primary",
              bg: "bg-primary/10",
            },
            {
              icon: UserCheck,
              title: "Pharmacist Augmentation",
              description: "Augments pharmacists, never replaces them. Full override authority always retained.",
              color: "text-warning",
              bg: "bg-warning/10",
            },
            {
              icon: BarChart3,
              title: "Full Audit Trail",
              description: "Every interaction is logged for accountability and regulatory compliance.",
              color: "text-purple-500",
              bg: "bg-purple-500/10",
            },
            {
              icon: Stethoscope,
              title: "Clinical Integration",
              description: "Seamlessly fits pharmacy workflow. Pharmacists see escalations in real-time.",
              color: "text-blue-500",
              bg: "bg-blue-500/10",
            },
            {
              icon: MonitorSmartphone,
              title: "Kiosk-Optimized",
              description: "Large touch targets, high contrast, minimal scrolling — designed for in-pharmacy use.",
              color: "text-teal-500",
              bg: "bg-teal-500/10",
            },
          ].map((feature) => (
            <div key={feature.title} className="flex gap-4 p-4">
              <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center flex-shrink-0`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-white py-6">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between text-sm text-muted-foreground">
          <p>DOSP - Digital Off-the-Shelf Pharmacist | MVP Demo</p>
          <p>BET 607 - Strategic Innovation | University of Waterloo</p>
        </div>
      </footer>
    </div>
  );
}
