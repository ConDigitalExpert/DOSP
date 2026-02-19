"use client";

import { create } from "zustand";
import { type Prescription, type PickupStatus } from "@/lib/types";
import { lookupPatient } from "@/lib/patient-records";

interface PickupStore {
  status: PickupStatus;
  patientName: string | null;
  readyPrescriptions: Prescription[];
  processingPrescriptions: Prescription[];

  verifyForPickup: (phone: string, dob: string) => void;
  resetPickup: () => void;
}

export const usePickupStore = create<PickupStore>((set) => ({
  status: "idle",
  patientName: null,
  readyPrescriptions: [],
  processingPrescriptions: [],

  verifyForPickup: (phone: string, dob: string) => {
    const record = lookupPatient(phone, dob);

    if (!record) {
      set({ status: "not_found", patientName: null, readyPrescriptions: [], processingPrescriptions: [] });
      return;
    }

    const name = `${record.firstName} ${record.lastName}`;
    const ready = record.prescriptions.filter((p) => p.status === "ready");
    const processing = record.prescriptions.filter((p) => p.status === "processing");

    if (ready.length === 0 && processing.length === 0) {
      set({ status: "no_prescriptions", patientName: name, readyPrescriptions: [], processingPrescriptions: [] });
      return;
    }

    if (ready.length > 0) {
      set({ status: "success", patientName: name, readyPrescriptions: ready, processingPrescriptions: processing });
    } else {
      set({ status: "processing", patientName: name, readyPrescriptions: [], processingPrescriptions: processing });
    }
  },

  resetPickup: () => {
    set({ status: "idle", patientName: null, readyPrescriptions: [], processingPrescriptions: [] });
  },
}));
