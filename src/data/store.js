// src/data/store.js
//
// The mock "database" layer. Everything in src/data/ reads and writes
// through here. When the backend arrives, this file is deleted and the
// api/ layer talks to a real server instead.
//
// Keys are namespaced with "app:" so they don't collide with other
// localStorage usage (cart-storage, order-storage, etc. from the old
// Zustand stores — those will be migrated).

const PREFIX = 'app:';

function key(k) {
  return `${PREFIX}${k}`;
}

export function read(k) {
  try {
    const raw = localStorage.getItem(key(k));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function write(k, value) {
  localStorage.setItem(key(k), JSON.stringify(value));
}

export function remove(k) {
  localStorage.removeItem(key(k));
}

/*
 * Reads from localStorage. If the key doesn't exist yet, writes the
 * seed value first, then returns it. This is how the mock database
 * "initializes" — on first access, seeded from src/data/*.js.
 */
export function seedIfEmpty(k, seedValue) {
  const existing = read(k);
  if (existing !== null) return existing;
  write(k, seedValue);
  return seedValue;
}

//Wipes every key managed by the mock database. 

export function resetAll() {
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k?.startsWith(PREFIX)) keysToRemove.push(k);
  }
  keysToRemove.forEach((k) => localStorage.removeItem(k));
}