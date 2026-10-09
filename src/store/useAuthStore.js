// src/store/useAuthStore.js
//
// Reactive wrapper around api/auth, backed by Supabase.
// Holds the current user and exposes login/register/logout/updateProfile.
//
// Supabase manages session persistence. We don't use localStorage ourselves
// and don't use zustand/persist. On app load, App.jsx calls refresh() once,
// and Supabase's client restores the session from its own storage.

import { create } from 'zustand';
import * as authApi from '../api/auth';

export const useAuthStore = create((set) => ({
  user: null,
  loading: true,
  error: null,

  refresh: async () => {
    set({ loading: true });
    const user = await authApi.getCurrentUser();
    set({ user, loading: false });
  },

  login: async (email, password) => {
    set({ error: null });
    try {
      const { user } = await authApi.login(email, password);
      set({ user });
      return user;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  register: async (name, email, password) => {
    set({ error: null });
    try {
      const result = await authApi.register(name, email, password);
      if (result.needsConfirmation) {
        // Not logged in yet. RegisterPage handles the confirmation screen.
        return { needsConfirmation: true };
      }
      set({ user: result.user });
      return { needsConfirmation: false, user: result.user };
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  logout: async () => {
    await authApi.logout();
    set({ user: null });
  },

  updateProfile: async (patch) => {
    set({ error: null });
    try {
      const user = await authApi.updateProfile(patch);
      set({ user });
      return user;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));