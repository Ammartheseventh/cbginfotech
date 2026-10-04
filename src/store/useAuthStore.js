// src/store/useAuthStore.js
//
// Reactive wrapper around api/auth. Holds the current user, exposes
// login/register/logout/updateProfile actions. Components subscribe via
// useAuthStore((s) => s.user) and re-render when the user changes.
//
// No persist middleware: the session is stored in localStorage by
// data/session.js, and we rehydrate via refresh() on app load.

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
      const { user } = await authApi.register(name, email, password);
      set({ user });
      return user;
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