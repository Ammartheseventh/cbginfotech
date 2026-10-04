// src/data/session.js
//
// The current session: a token, the user it belongs to, and when it
// expires. This is stored the same way it will be when a real backend
// exists. the only difference is that the token is currently fake.
//
// In the real version, the token will be a JWT issued by the server.
// Everything else about this file stays the same.

import { read, write, remove } from './store';

const KEY = 'session';

export function getSession() {
  return read(KEY);
}

export function setSession(session) {
  write(KEY, session);
}

export function clearSession() {
  remove(KEY);
}