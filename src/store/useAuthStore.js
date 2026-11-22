// src/store/useAuthStore.js

import { create } from 'zustand';
import * as authApi from '../api/auth';
import { supabase } from '../api/supabase';

export const useAuthStore = create((set) => ({
  user: null,
  loading: true,
  error: null,

  // Subscribe to Supabase auth state changes. Called once from App.jsx.
  // Handles INITIAL_SESSION (page load), SIGNED_IN, SIGNED_OUT,
  // TOKEN_REFRESHED, USER_UPDATED.
  init: () => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          set({ user: null, loading: false });
          return;
        }
        // INITIAL_SESSION, SIGNED_IN, TOKEN_REFRESHED, USER_UPDATED
        try {
          const user = await authApi.getCurrentUser();
          set({ user, loading: false });
        } catch {
          set({ user: null, loading: false });
        }
      }
    );
    return () => subscription.unsubscribe();
  },

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