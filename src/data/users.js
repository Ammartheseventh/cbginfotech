// src/data/users.js
//
// Seed users for the mock database. In a real backend, this data lives
// in a `users` table with bcrypt-hashed passwords. Here, passwords are
// stored in plaintext with a "mock:" prefix so it's obvious they're not
// real. The api/auth.js layer knows how to verify them.
//
// These credentials are for development only. Log in with:
//   johndoe@example.com / password123   (customer)
//   admin@cbginfotech.com / admin123  (admin)

export const usersSeed = [
  {
    id: 1,
    name: 'John Doe',
    email: 'johndoe@example.com',
    passwordHash: 'mock:password123',
    role: 'customer',
    createdAt: '2026-09-01',
  },
  {
    id: 2,
    name: 'Admin',
    email: 'admin@cbginfotech.com',
    passwordHash: 'mock:admin123',
    role: 'admin',
    createdAt: '2026-09-01',
  },
];