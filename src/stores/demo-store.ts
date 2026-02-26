"use client";

import { create } from "zustand";

interface DemoStore {
  isActive: boolean;
  currentStepIndex: number;
  isTransitioning: boolean;
  startDemo: () => void;
  stopDemo: () => void;
  nextStep: (totalSteps: number) => void;
  prevStep: () => void;
  setTransitioning: (v: boolean) => void;
}

export const useDemoStore = create<DemoStore>((set, get) => ({
  isActive: false,
  currentStepIndex: 0,
  isTransitioning: false,

  startDemo: () => {
    set({ isActive: true, currentStepIndex: 0, isTransitioning: false });
  },

  stopDemo: () => {
    set({ isActive: false, currentStepIndex: 0, isTransitioning: false });
  },

  nextStep: (totalSteps: number) => {
    const { currentStepIndex, isTransitioning } = get();
    if (isTransitioning) return;
    if (currentStepIndex < totalSteps - 1) {
      set({ currentStepIndex: currentStepIndex + 1 });
    } else {
      // Last step — exit demo
      get().stopDemo();
    }
  },

  prevStep: () => {
    const { currentStepIndex, isTransitioning } = get();
    if (isTransitioning) return;
    if (currentStepIndex > 0) {
      set({ currentStepIndex: currentStepIndex - 1 });
    }
  },

  setTransitioning: (v: boolean) => {
    set({ isTransitioning: v });
  },
}));
