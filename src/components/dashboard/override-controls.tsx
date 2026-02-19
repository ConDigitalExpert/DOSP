"use client";

import { useState } from "react";
import { type Consultation, ConsultationStatus } from "@/lib/types";
import { useConsultationStore } from "@/stores/consultation-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Stethoscope } from "lucide-react";

interface OverrideControlsProps {
  consultation: Consultation;
}

export function OverrideControls({ consultation }: OverrideControlsProps) {
  const { resolveEscalation, addPharmacistNote } = useConsultationStore();
  const [note, setNote] = useState("");
  const [action, setAction] = useState("");
  const [saved, setSaved] = useState(false);

  const isEscalated = consultation.status === ConsultationStatus.ESCALATED;
  const isResolved = consultation.status === ConsultationStatus.PHARMACIST_RESOLVED;

  const handleResolve = () => {
    if (!note.trim() || !action.trim()) return;
    resolveEscalation(consultation.id, note, action);
    setSaved(true);
  };

  const handleAddNote = () => {
    if (!note.trim()) return;
    addPharmacistNote(consultation.id, note, action || "Note added");
    setSaved(true);
  };

  if (isResolved || consultation.status === ConsultationStatus.COMPLETED) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-success" />
            Pharmacist Resolution
          </CardTitle>
        </CardHeader>
        <CardContent>
          {consultation.pharmacistNotes ? (
            <div className="space-y-3">
              {consultation.pharmacistAction && (
                <div>
                  <Label className="text-xs text-muted-foreground">Action Taken</Label>
                  <p className="font-medium">{consultation.pharmacistAction}</p>
                </div>
              )}
              <div>
                <Label className="text-xs text-muted-foreground">Notes</Label>
                <p className="text-sm">{consultation.pharmacistNotes}</p>
              </div>
              <Badge variant="success">Resolved</Badge>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No pharmacist notes recorded.</p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={isEscalated ? "border-warning border-2" : ""}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-primary" />
          Pharmacist Actions
          {isEscalated && <Badge variant="warning">Action Required</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {saved ? (
          <div className="flex items-center gap-2 text-success p-4 bg-success/5 rounded-xl">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">
              {isEscalated ? "Escalation resolved successfully" : "Note saved"}
            </span>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label>Action Taken</Label>
              <Input
                value={action}
                onChange={(e) => setAction(e.target.value)}
                placeholder="e.g., Recommended alternative medication, Advised physician visit..."
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Enter your clinical notes..."
                className="flex w-full rounded-xl border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[100px] resize-y"
              />
            </div>
            <div className="flex gap-3">
              {isEscalated && (
                <Button
                  variant="success"
                  onClick={handleResolve}
                  disabled={!note.trim() || !action.trim()}
                  className="flex-1"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Resolve Escalation
                </Button>
              )}
              <Button
                variant={isEscalated ? "outline" : "default"}
                onClick={handleAddNote}
                disabled={!note.trim()}
                className={isEscalated ? "" : "flex-1"}
              >
                Add Note
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
