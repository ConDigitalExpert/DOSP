"use client";

import { create } from "zustand";

interface AuthStore {
  isAuthenticated: boolean;
  pharmacistName: string | null;
  login: (name: string, password: string) => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: false,
  pharmacistName: null,

  login: (name: string, password: string) => {
    // Mock auth — any non-empty credentials work for MVP
    if (name.trim() && password.trim()) {
      set({ isAuthenticated: true, pharmacistName: name });
      return true;
    }
    return false;
  },

  logout: () => {
    set({ isAuthenticated: false, pharmacistName: null });
  },
}));
