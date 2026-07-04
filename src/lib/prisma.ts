// src/lib/prisma.ts

import { PrismaClient } from "@prisma/client";

/**
 * In development, Next.js hot-reload creates a new module instance on every
 * file change, which would instantiate a new PrismaClient and exhaust the
 * PostgreSQL connection pool. We store a single instance on the global object
 * so it survives across reloads.
 *
 * In production there is no hot-reload, so we simply export a new instance.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
