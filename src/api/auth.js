// src/api/auth.js
//
// The auth API. When the backend arrives, every function here becomes a
// fetch() call. The function signatures, return shapes, and error
// behavior are designed to match what a real API would do.

import { write, seedIfEmpty } from '../data/store';
import { usersSeed } from '../data/users';
import { getSession, setSession, clearSession } from '../data/session';

const USERS_KEY = 'users';

function getAllUsers() {
  return seedIfEmpty(USERS_KEY, usersSeed);
}

function hashPassword(password) {
  // Mock hashing.
  return `mock:${password}`;
}

function verifyPassword(password, hash) {
  return hashPassword(password) === hash;
}

function generateToken() {
  // A fake token. Real tokens are JWTs signed by the server. Format
  // doesn't matter here, only that it's an opaque string.
  return `mock-token-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function publicUser(user) {
  // Strip passwordHash before returning a user to the client.
  // Real APIs never send password hashes over the wire.
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone ?? '',
    role: user.role,
  };
}

/*
 * Log in with email and password.
 * Returns { token, user }. Throws on invalid credentials.
 */
export async function login(email, password) {
  // Simulate network latency so loading states are real.
  await new Promise((r) => setTimeout(r, 400));

  const user = getAllUsers().find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );

  // Same error for "no user" and "wrong password". prevents user enumeration.
  if (!user || !verifyPassword(password, user.passwordHash)) {
    throw new Error('Invalid email or password');
  }

  const session = {
    token: generateToken(),
    userId: user.id,
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
  };
  setSession(session);

  return {
    token: session.token,
    user: publicUser(user),
  };
}

/*
 * Register a new customer account.
 * Returns { token, user } and logs the user in.
 */
export async function register(name, email, password) {
  await new Promise((r) => setTimeout(r, 400));

  const all = getAllUsers();
  if (all.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('Email already registered');
  }

  const newUser = {
    id: Math.max(0, ...all.map((u) => u.id)) + 1,
    name,
    email,
    passwordHash: hashPassword(password),
    role: 'customer',
    createdAt: new Date().toISOString(),
  };

  write(USERS_KEY, [...all, newUser]);

  return login(email, password);
}


// Clear the current session.

export async function logout() {
  await new Promise((r) => setTimeout(r, 100));
  clearSession();
}

/*
 * Return the currently authenticated user, or null.
 * Checks token expiry and clears the session if it's stale.
 */
export async function getCurrentUser() {
  const session = getSession();
  if (!session) return null;

  if (session.expiresAt < Date.now()) {
    clearSession();
    return null;
  }

  const user = getAllUsers().find((u) => u.id === session.userId);
  if (!user) {
    clearSession();
    return null;
  }

  return publicUser(user);
}

/*
 * Update the current user's profile fields (name, email, phone).
 * Phone is optional and stored on the user record.
 * Returns the updated public user.
 */
export async function updateProfile(patch) {
  await new Promise((r) => setTimeout(r, 200));

  const session = getSession();
  if (!session || session.expiresAt < Date.now()) {
    throw new Error('Not authenticated');
  }

  const all = getAllUsers();
  const index = all.findIndex((u) => u.id === session.userId);
  if (index === -1) throw new Error('User not found');

  const current = all[index];

  // If email is changing, ensure it's not taken by someone else.
  if (patch.email && patch.email.toLowerCase() !== current.email.toLowerCase()) {
    const taken = all.some(
      (u) => u.id !== current.id && u.email.toLowerCase() === patch.email.toLowerCase()
    );
    if (taken) throw new Error('Email already registered');
  }

  const updated = {
    ...current,
    name: patch.name ?? current.name,
    email: patch.email ?? current.email,
    phone: patch.phone ?? current.phone ?? '',
  };

  const next = [...all];
  next[index] = updated;
  write(USERS_KEY, next);

  return publicUser(updated);
}

/*
 * Return the current token, or null. Used by other API modules to
 * attach an Authorization header when the backend arrives.
 */
export async function getToken() {
  const session = getSession();
  if (!session || session.expiresAt < Date.now()) return null;
  return session.token;
}