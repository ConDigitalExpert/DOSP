"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePickupStore } from "@/stores/pickup-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Pill,
  ArrowLeft,
  UserCheck,
} from "lucide-react";

export default function PickupResultPage() {
  const router = useRouter();
  const { status, patientName, readyPrescriptions, processingPrescriptions, resetPickup } =
    usePickupStore();

  useEffect(() => {
    if (status === "idle") {
      router.replace("/pickup");
    }
  }, [status, router]);

  if (status === "idle" || status === "verifying") return null;

  const handleHome = () => {
    resetPickup();
    router.push("/");
  };

  const handleTryAgain = () => {
    resetPickup();
    router.push("/pickup");
  };

  return (
    <div className="space-y-8 max-w-xl mx-auto">
      {/* Success — has ready prescriptions */}
      {status === "success" && (
        <>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success/10 mb-4">
              <CheckCircle className="w-10 h-10 text-success" />
            </div>
            <h2 className="text-3xl font-bold">Your medications are ready!</h2>
            <p className="text-muted-foreground mt-2 text-lg">
              Welcome back, {patientName}
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Pill className="w-5 h-5 text-success" />
              Ready for Pickup
            </h3>
            {readyPrescriptions.map((rx) => (
              <Card key={rx.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-lg">{rx.medicationName}</p>
                      <p className="text-sm text-muted-foreground mt-1">{rx.dosage}</p>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {rx.quantity}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Prescribed by: {rx.prescribedBy}
                      </p>
                    </div>
                    <Badge variant="success">Ready</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {processingPrescriptions.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-warning" />
                Still Processing
              </h3>
              {processingPrescriptions.map((rx) => (
                <Card key={rx.id} className="border-warning/30">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold">{rx.medicationName}</p>
                        <p className="text-sm text-muted-foreground mt-1">{rx.dosage}</p>
                        <p className="text-sm text-warning font-medium mt-1">
                          Estimated ready in ~{rx.estimatedReadyMinutes} minutes
                        </p>
                      </div>
                      <Badge variant="warning">Processing</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="p-4 rounded-xl bg-success/10 text-center">
            <p className="text-sm font-medium text-success">
              Please proceed to the pharmacy counter to collect your medication.
            </p>
          </div>
        </>
      )}

      {/* Processing — all prescriptions still being prepared */}
      {status === "processing" && (
        <>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-warning/10 mb-4">
              <Clock className="w-10 h-10 text-warning" />
            </div>
            <h2 className="text-3xl font-bold">Your prescription is being prepared</h2>
            <p className="text-muted-foreground mt-2 text-lg">
              Welcome back, {patientName}
            </p>
          </div>

          <div className="space-y-3">
            {processingPrescriptions.map((rx) => (
              <Card key={rx.id} className="border-warning/30">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-lg">{rx.medicationName}</p>
                      <p className="text-sm text-muted-foreground mt-1">{rx.dosage}</p>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {rx.quantity}
                      </p>
                    </div>
                    <Badge variant="warning">Processing</Badge>
                  </div>
                  <div className="mt-3 p-3 rounded-lg bg-warning/10">
                    <p className="text-sm font-medium text-warning">
                      Estimated ready in ~{rx.estimatedReadyMinutes} minutes
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-muted text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <UserCheck className="w-5 h-5 text-muted-foreground" />
              <p className="text-sm font-medium">
                Please check back later or speak with a pharmacist.
              </p>
            </div>
          </div>
        </>
      )}

      {/* Not Found */}
      {status === "not_found" && (
        <>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 mb-4">
              <XCircle className="w-10 h-10 text-destructive" />
            </div>
            <h2 className="text-3xl font-bold">We couldn&apos;t find your records</h2>
            <p className="text-muted-foreground mt-2 text-lg">
              Please double-check your phone number and date of birth, or speak with the
              pharmacist for assistance.
            </p>
          </div>

          <div className="flex gap-4">
            <Button variant="outline" size="lg" onClick={handleTryAgain} className="flex-1">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </>
      )}

      {/* No Prescriptions */}
      {status === "no_prescriptions" && (
        <>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-warning/10 mb-4">
              <AlertTriangle className="w-10 h-10 text-warning" />
            </div>
            <h2 className="text-3xl font-bold">No prescriptions found</h2>
            <p className="text-muted-foreground mt-2 text-lg">
              Hi {patientName}, you don&apos;t currently have any prescriptions on file.
              If you believe this is an error, please speak with the pharmacist.
            </p>
          </div>
        </>
      )}

      {/* Return to Home — shown in all states */}
      <div className="text-center pt-4">
        <Button size="kiosk" onClick={handleHome}>
          <RotateCcw className="w-5 h-5 mr-2" />
          Return to Home
        </Button>
      </div>
    </div>
  );
}
