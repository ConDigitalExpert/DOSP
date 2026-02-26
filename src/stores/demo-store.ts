"use client";

import { create } from "zustand";

export type CursorState = "idle" | "moving" | "clicking" | "typing";
export type PanelStyle = "bar" | "card";

interface DemoStore {
  isActive: boolean;
  currentStepIndex: number;
  isTransitioning: boolean;
  isMicroActionPlaying: boolean;
  skipMicroActions: boolean;
  panelStyle: PanelStyle;
  cursorPosition: { x: number; y: number } | null;
  cursorState: CursorState;
  startDemo: () => void;
  stopDemo: () => void;
  nextStep: (totalSteps: number) => void;
  prevStep: () => void;
  setTransitioning: (v: boolean) => void;
  setMicroActionPlaying: (v: boolean) => void;
  requestSkipMicroActions: () => void;
  clearSkipRequest: () => void;
  togglePanelStyle: () => void;
  setCursorPosition: (pos: { x: number; y: number } | null) => void;
  setCursorState: (state: CursorState) => void;
}

export const useDemoStore = create<DemoStore>((set, get) => ({
  isActive: false,
  currentStepIndex: 0,
  isTransitioning: false,
  isMicroActionPlaying: false,
  skipMicroActions: false,
  panelStyle: "bar",
  cursorPosition: null,
  cursorState: "idle",

  startDemo: () => {
    set({
      isActive: true,
      currentStepIndex: 0,
      isTransitioning: false,
      isMicroActionPlaying: false,
      skipMicroActions: false,
      cursorPosition: null,
      cursorState: "idle",
    });
  },

  stopDemo: () => {
    set({
      isActive: false,
      currentStepIndex: 0,
      isTransitioning: false,
      isMicroActionPlaying: false,
      skipMicroActions: false,
      cursorPosition: null,
      cursorState: "idle",
    });
  },

  nextStep: (totalSteps: number) => {
    const { currentStepIndex, isTransitioning, isMicroActionPlaying } = get();
    if (isTransitioning) return;
    // If micro-actions are playing, request skip instead of advancing
    if (isMicroActionPlaying) {
      set({ skipMicroActions: true });
      return;
    }
    if (currentStepIndex < totalSteps - 1) {
      set({ currentStepIndex: currentStepIndex + 1 });
    } else {
      get().stopDemo();
    }
  },

  prevStep: () => {
    const { currentStepIndex, isTransitioning, isMicroActionPlaying } = get();
    if (isTransitioning || isMicroActionPlaying) return;
    if (currentStepIndex > 0) {
      set({ currentStepIndex: currentStepIndex - 1 });
    }
  },

  setTransitioning: (v: boolean) => {
    set({ isTransitioning: v });
  },

  setMicroActionPlaying: (v: boolean) => {
    set({ isMicroActionPlaying: v });
  },

  requestSkipMicroActions: () => {
    set({ skipMicroActions: true });
  },

  clearSkipRequest: () => {
    set({ skipMicroActions: false });
  },

  togglePanelStyle: () => {
    set((s) => ({ panelStyle: s.panelStyle === "bar" ? "card" : "bar" }));
  },

  setCursorPosition: (pos) => {
    set({ cursorPosition: pos });
  },

  setCursorState: (state) => {
    set({ cursorState: state });
  },
}));
