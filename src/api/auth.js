// src/api/auth.js
//
// Auth API backed by Supabase. Function signatures match the previous
// mock so that useAuthStore and the pages barely need to change.

import { supabase } from './supabase';

// Shape the auth user + profile row into the frontend user object.
function frontendUser(authUser, profile) {
  return {
    id: authUser.id,
    name: profile?.name ?? authUser.user_metadata?.name ?? '',
    email: authUser.email,
    phone: profile?.phone ?? '',
    role: profile?.role ?? 'customer',
  };
}

// Fetch the profiles row for a given user ID.
async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('name, phone, role')
    .eq('id', userId)
    .single();
  if (error) return null;
  return data;
}

/*
 * Log in with email and password.
 * Returns { user }. Throws on invalid credentials.
 */
export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw new Error(error.message);

  const profile = await fetchProfile(data.user.id);
  return { user: frontendUser(data.user, profile) };
}

/*
 * Register a new customer account.
 *
 * Email confirmation is enabled on the Supabase project, so signUp does
 * not log the user in. Instead it sends a confirmation email. The caller
 * must handle the needsConfirmation case and show a check-your-email screen.
 */
export async function register(name, email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/login`,
      data: { name },
    },
  });
  if (error) throw new Error(error.message);

  return {
    user: data.user,
    needsConfirmation: !data.session,
  };
}

/*
 * Sign out the current user.
 */
export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

/*
 * Return the currently authenticated user, or null.
 */
export async function getCurrentUser() {
  const {
    data: { user: authUser },
    error,
  } = await supabase.auth.getUser();
  if (error || !authUser) return null;

  const profile = await fetchProfile(authUser.id);
  return frontendUser(authUser, profile);
}

/*
 * Update the current user's profile fields.
 * Email changes go through a separate Supabase flow and are not supported here.
 */
export async function updateProfile(patch) {
  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !authUser) throw new Error('Not authenticated');

  if (patch.email && patch.email !== authUser.email) {
    throw new Error('Email changes are not supported yet');
  }

  const updates = {};
  if (patch.name !== undefined) updates.name = patch.name;
  if (patch.phone !== undefined) updates.phone = patch.phone;

  const { error: updateError } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', authUser.id);
  if (updateError) throw new Error(updateError.message);

  const profile = await fetchProfile(authUser.id);
  return frontendUser(authUser, profile);
}
