import { useConsultationStore } from "@/stores/consultation-store";
import { useAuthStore } from "@/stores/auth-store";
import { usePickupStore } from "@/stores/pickup-store";
import { SymptomCategory } from "@/lib/types";
import { MOCK_PATIENT_RECORDS } from "@/lib/patient-records";

// =============================================================================
// MICRO-ACTION TYPE SYSTEM
// =============================================================================

export type MicroAction =
  | { type: "set-state"; action: () => void }
  | { type: "wait"; ms: number }
  | { type: "cursor-move"; selector: string; durationMs?: number }
  | { type: "cursor-click"; selector?: string; visual?: boolean }
  | { type: "type-into"; selector: string; value: string; durationMs?: number }
  | { type: "select-button"; selector: string }
  | { type: "spotlight"; selector: string; padding?: number };

// =============================================================================
// DEMO STEP TYPE
// =============================================================================

export interface DemoStep {
  id: string;
  title: string;
  description: string;
  actLabel?: string;
  route?: string;
  spotlightSelector?: string;
  spotlightPadding?: number;
  panelPosition?:
    | "center"
    | "bottom"
    | "bottom-right"
    | "bottom-left"
    | "top-right"
    | "top-left";
  microActions?: MicroAction[];
  waitAfterAction?: number;
}

const sarahRecord = MOCK_PATIENT_RECORDS[0]; // Sarah Johnson

// =============================================================================
// DEMO STEPS — 16 steps across 5 acts
// =============================================================================

export const DEMO_STEPS: DemoStep[] = [
  // ===== ACT 1: THE PLATFORM =====
  {
    id: "welcome",
    actLabel: "Act 1 — The Platform",
    title: "Welcome to DOSP",
    description:
      "Digital Off-the-Shelf Pharmacist — an AI-powered OTC triage system that frees pharmacists for clinical care. Safe, conservative, and always backed by a real pharmacist.",
    route: "/",
    panelPosition: "center",
  },
  {
    id: "three-touchpoints",
    actLabel: "Act 1 — The Platform",
    title: "Three User Touchpoints",
    description:
      "Patients use the kiosk for OTC guidance. They can pick up prescriptions at the same terminal. Pharmacists monitor everything from a real-time dashboard.",
    route: "/",
    spotlightSelector: ".grid.grid-cols-1.md\\:grid-cols-3.gap-6.mt-12",
    spotlightPadding: 16,
    panelPosition: "bottom",
    microActions: [
      { type: "wait", ms: 400 },
      {
        type: "cursor-move",
        selector:
          ".grid.grid-cols-1.md\\:grid-cols-3.gap-6.mt-12 > :nth-child(1)",
        durationMs: 600,
      },
      { type: "cursor-click", visual: true },
      { type: "wait", ms: 500 },
      {
        type: "cursor-move",
        selector:
          ".grid.grid-cols-1.md\\:grid-cols-3.gap-6.mt-12 > :nth-child(2)",
        durationMs: 500,
      },
      { type: "cursor-click", visual: true },
      { type: "wait", ms: 500 },
      {
        type: "cursor-move",
        selector:
          ".grid.grid-cols-1.md\\:grid-cols-3.gap-6.mt-12 > :nth-child(3)",
        durationMs: 500,
      },
      { type: "cursor-click", visual: true },
    ],
  },

  // ===== ACT 2: PATIENT KIOSK JOURNEY =====
  {
    id: "verification",
    actLabel: "Act 2 — Patient Kiosk",
    title: "Patient Verification",
    description:
      "The patient verifies their identity with phone number and date of birth. Watch as the data fills in — existing pharmacy records are loaded automatically.",
    route: "/verify",
    spotlightSelector: "main",
    spotlightPadding: 8,
    panelPosition: "bottom",
    microActions: [
      {
        type: "set-state",
        action: () => {
          useConsultationStore.getState().resetKiosk();
          useConsultationStore.getState().startConsultation();
        },
      },
      { type: "wait", ms: 800 },
      // Type phone number (works reliably on all platforms)
      { type: "cursor-move", selector: "input[type='tel']", durationMs: 600 },
      { type: "cursor-click", visual: true },
      {
        type: "type-into",
        selector: "input[type='tel']",
        value: "555-100-1001",
        durationMs: 1400,
      },
      { type: "wait", ms: 400 },
      // Move to date field — visual click only (avoids native date picker)
      {
        type: "cursor-move",
        selector: "input[type='date']",
        durationMs: 500,
      },
      { type: "cursor-click", visual: true },
      {
        type: "type-into",
        selector: "input[type='date']",
        value: "1990-05-15",
        durationMs: 600,
      },
      { type: "wait", ms: 500 },
      // Move to submit button — visual click, then set-state to actually verify
      {
        type: "cursor-move",
        selector: "button:has(.lucide-search)",
        durationMs: 500,
      },
      { type: "cursor-click", visual: true },
      {
        type: "set-state",
        action: () => {
          useConsultationStore
            .getState()
            .setVerifiedPatient(sarahRecord.id, sarahRecord.profile);
        },
      },
    ],
    waitAfterAction: 400,
  },
  {
    id: "profile-loaded",
    actLabel: "Act 2 — Patient Kiosk",
    title: "Profile Auto-Loaded",
    description:
      "Sarah Johnson's medical history is found — diabetes, current medications (metformin, lisinopril), and NSAID allergy are all pre-loaded. This saves time and improves safety.",
    route: "/verify",
    spotlightSelector: "main",
    panelPosition: "bottom",
  },
  {
    id: "symptom-triage",
    actLabel: "Act 2 — Patient Kiosk",
    title: "Symptom Triage",
    description:
      "The patient selects their symptom category — Headache. The system records sub-symptoms, severity, and duration for a complete clinical picture.",
    route: "/symptoms",
    spotlightSelector: "main",
    spotlightPadding: 8,
    panelPosition: "bottom",
    microActions: [
      { type: "wait", ms: 600 },
      // Click the Headache card (first in the grid)
      {
        type: "cursor-move",
        selector: ".grid.grid-cols-2 button:nth-child(1)",
        durationMs: 600,
      },
      { type: "cursor-click" },
      { type: "wait", ms: 700 },
      // Now on sub-symptom page — click first two symptoms
      {
        type: "cursor-move",
        selector: ".grid.grid-cols-1.md\\:grid-cols-2 button:nth-child(1)",
        durationMs: 500,
      },
      { type: "cursor-click" },
      { type: "wait", ms: 400 },
      {
        type: "cursor-move",
        selector: ".grid.grid-cols-1.md\\:grid-cols-2 button:nth-child(2)",
        durationMs: 400,
      },
      { type: "cursor-click" },
      { type: "wait", ms: 400 },
      // Select severity "Mild" (2nd button in severity row)
      {
        type: "cursor-move",
        selector: ".flex.items-center.gap-2 button:nth-child(2)",
        durationMs: 400,
      },
      { type: "cursor-click" },
      { type: "wait", ms: 300 },
      // Select duration "1 day" (2nd in duration options)
      {
        type: "cursor-move",
        selector: ".flex.flex-wrap.gap-2 button:nth-child(2)",
        durationMs: 400,
      },
      { type: "cursor-click" },
      { type: "wait", ms: 300 },
      // Now set the state for the store (so subsequent pages work)
      {
        type: "set-state",
        action: () => {
          useConsultationStore.getState().setSymptoms({
            category: SymptomCategory.HEADACHE,
            subSymptoms: ["tension_headache", "sinus_pressure"],
            severity: 2,
            durationDays: 1,
          });
        },
      },
    ],
    waitAfterAction: 400,
  },
  {
    id: "screening",
    actLabel: "Act 2 — Patient Kiosk",
    title: "Smart Screening",
    description:
      "The safety screening form is pre-filled from Sarah's verified profile — age, conditions, medications, allergies, and pregnancy status. The patient just confirms and continues.",
    route: "/screening",
    spotlightSelector: "main",
    spotlightPadding: 8,
    panelPosition: "bottom",
    microActions: [
      { type: "wait", ms: 600 },
      // Sweep cursor across pre-filled form sections to draw attention
      {
        type: "cursor-move",
        selector: ".flex.flex-wrap.gap-2:nth-of-type(1)",
        durationMs: 600,
      },
      { type: "wait", ms: 500 },
      {
        type: "cursor-move",
        selector: ".flex.flex-wrap.gap-2:nth-of-type(2)",
        durationMs: 500,
      },
      { type: "wait", ms: 500 },
      {
        type: "cursor-move",
        selector: ".flex.flex-wrap.gap-2:nth-of-type(3)",
        durationMs: 500,
      },
    ],
  },
  {
    id: "recommendation",
    actLabel: "Act 2 — Patient Kiosk",
    title: "AI-Powered Recommendation",
    description:
      "The triage engine analyzes symptoms against red flags, drug interactions, and contraindications. Result: 95% confidence — safe to recommend an OTC product with proper dosage and warnings.",
    route: "/recommendation",
    spotlightSelector: "main",
    spotlightPadding: 8,
    panelPosition: "bottom",
    microActions: [
      {
        type: "set-state",
        action: () => {
          const store = useConsultationStore.getState();
          store.setPatient(sarahRecord.profile);
          store.setVitals(null);
        },
      },
    ],
    waitAfterAction: 600,
  },
  {
    id: "summary",
    actLabel: "Act 2 — Patient Kiosk",
    title: "Consultation Complete",
    description:
      "The patient receives a consultation receipt with the full audit trail — every step logged with timestamps and actors. Total time: under 3 minutes.",
    route: "/summary",
    spotlightSelector: "main",
    spotlightPadding: 8,
    panelPosition: "bottom",
    microActions: [
      {
        type: "set-state",
        action: () => {
          useConsultationStore.getState().completeConsultation();
        },
      },
    ],
    waitAfterAction: 400,
  },

  // ===== ACT 3: MEDICATION PICKUP =====
  {
    id: "pickup-intro",
    actLabel: "Act 3 — Medication Pickup",
    title: "Prescription Pickup",
    description:
      "The same kiosk also handles medication pickup. Watch as the patient verifies their identity to check prescription status — no waiting in line.",
    route: "/pickup",
    spotlightSelector: "main",
    spotlightPadding: 8,
    panelPosition: "bottom",
    microActions: [
      {
        type: "set-state",
        action: () => {
          usePickupStore.getState().resetPickup();
        },
      },
      { type: "wait", ms: 800 },
      // Type phone number
      { type: "cursor-move", selector: "input[type='tel']", durationMs: 600 },
      { type: "cursor-click", visual: true },
      {
        type: "type-into",
        selector: "input[type='tel']",
        value: "555-100-1001",
        durationMs: 1200,
      },
      { type: "wait", ms: 400 },
      // Date field — visual click only (avoids native date picker)
      {
        type: "cursor-move",
        selector: "input[type='date']",
        durationMs: 500,
      },
      { type: "cursor-click", visual: true },
      {
        type: "type-into",
        selector: "input[type='date']",
        value: "1990-05-15",
        durationMs: 600,
      },
      { type: "wait", ms: 400 },
      // Submit — visual click, then set-state to actually verify
      {
        type: "cursor-move",
        selector: "button:has(.lucide-search)",
        durationMs: 500,
      },
      { type: "cursor-click", visual: true },
      {
        type: "set-state",
        action: () => {
          usePickupStore
            .getState()
            .verifyForPickup(sarahRecord.phone, sarahRecord.dateOfBirth);
        },
      },
    ],
    waitAfterAction: 300,
  },
  {
    id: "pickup-result",
    actLabel: "Act 3 — Medication Pickup",
    title: "Ready for Pickup",
    description:
      "Sarah has 2 prescriptions ready — Amoxicillin and a Metformin refill. Clear status indicators show what's ready (green) and what's still being prepared (yellow).",
    route: "/pickup/result",
    spotlightSelector: "main",
    spotlightPadding: 8,
    panelPosition: "bottom",
    microActions: [
      {
        type: "set-state",
        action: () => {
          usePickupStore
            .getState()
            .verifyForPickup(sarahRecord.phone, sarahRecord.dateOfBirth);
        },
      },
    ],
    waitAfterAction: 500,
  },

  // ===== ACT 4: PHARMACIST DASHBOARD =====
  {
    id: "dashboard-overview",
    actLabel: "Act 4 — Pharmacist Dashboard",
    title: "Pharmacist Oversight",
    description:
      "The pharmacist dashboard shows real-time metrics — total consultations, completion rate, escalation rate, and average duration. Complete visibility across all kiosks.",
    route: "/pharmacist/dashboard",
    spotlightSelector: ".space-y-6 > .grid:first-of-type",
    spotlightPadding: 12,
    panelPosition: "bottom",
    microActions: [
      {
        type: "set-state",
        action: () => {
          useConsultationStore.getState().resetKiosk();
          useAuthStore.getState().login("Dr. Jane Smith", "demo");
        },
      },
      { type: "wait", ms: 600 },
      // Sweep across stat cards (visual-only clicks — no navigation)
      {
        type: "cursor-move",
        selector: ".space-y-6 > .grid:first-of-type > :nth-child(1)",
        durationMs: 500,
      },
      { type: "cursor-click", visual: true },
      { type: "wait", ms: 400 },
      {
        type: "cursor-move",
        selector: ".space-y-6 > .grid:first-of-type > :nth-child(2)",
        durationMs: 400,
      },
      { type: "cursor-click", visual: true },
      { type: "wait", ms: 400 },
      {
        type: "cursor-move",
        selector: ".space-y-6 > .grid:first-of-type > :nth-child(3)",
        durationMs: 400,
      },
      { type: "cursor-click", visual: true },
      { type: "wait", ms: 400 },
      {
        type: "cursor-move",
        selector: ".space-y-6 > .grid:first-of-type > :nth-child(4)",
        durationMs: 400,
      },
      { type: "cursor-click", visual: true },
    ],
    waitAfterAction: 500,
  },
  {
    id: "escalation-queue",
    actLabel: "Act 4 — Pharmacist Dashboard",
    title: "Escalation Queue",
    description:
      "Cases with critical red flags — chest pain, difficulty breathing, high fever — are immediately escalated. The pharmacist reviews each case with full patient context before intervening.",
    route: "/pharmacist/dashboard",
    spotlightSelector: ".lg\\:col-span-2",
    spotlightPadding: 8,
    panelPosition: "top-right",
  },
  {
    id: "consultation-detail",
    actLabel: "Act 4 — Pharmacist Dashboard",
    title: "Escalated Case Deep Dive",
    description:
      "A 67-year-old with diabetes and heart disease reported difficulty breathing and high fever. The system correctly refused to self-recommend and escalated immediately. Full audit trail visible.",
    route: "/pharmacist/consultations/c-002",
    spotlightSelector: ".lg\\:col-span-2",
    spotlightPadding: 8,
    panelPosition: "bottom",
    waitAfterAction: 300,
  },
  {
    id: "analytics",
    actLabel: "Act 4 — Pharmacist Dashboard",
    title: "Analytics & Insights",
    description:
      "Track symptom category trends, triage decision ratios, and most common safety flags. Data-driven insights help optimize pharmacy operations and staffing.",
    route: "/pharmacist/analytics",
    spotlightSelector: ".grid.grid-cols-1.lg\\:grid-cols-2",
    spotlightPadding: 12,
    panelPosition: "top-right",
    waitAfterAction: 300,
  },

  // ===== ACT 5: CLOSING =====
  {
    id: "closing",
    actLabel: "The Vision",
    title: "Augmenting, Never Replacing",
    description:
      "Pharmacists freed for clinical care. Patients served faster. Full safety net with conservative escalation. Complete audit trail for compliance. This is the future of pharmacy self-service.",
    panelPosition: "center",
  },
];
