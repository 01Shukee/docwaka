// src/lib/bcrypt.ts

import bcrypt from "bcryptjs";

/**
 * Number of salt rounds used for hashing.
 * FSD §8 — bcryptjs with 10 salt rounds.
 */
const SALT_ROUNDS = 10;

/**
 * Hashes a plaintext password.
 * Always use this instead of calling bcrypt directly so the salt round
 * constant is managed in one place.
 */
export async function hashPassword(plaintext: string): Promise<string> {
  return bcrypt.hash(plaintext, SALT_ROUNDS);
}

/**
 * Compares a plaintext password against a stored bcrypt hash.
 * Returns true if they match, false otherwise.
 */
export async function verifyPassword(
  plaintext: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plaintext, hash);
}
