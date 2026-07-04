// src/app/api/auth/[...nextauth]/route.ts

import { handlers } from "@/lib/auth";

/**
 * NextAuth v5 — exports GET and POST handlers for all /api/auth/* routes:
 *   GET  /api/auth/session
 *   GET  /api/auth/providers
 *   GET  /api/auth/csrf
 *   POST /api/auth/callback/credentials
 *   POST /api/auth/signout
 *   etc.
 */
export const { GET, POST } = handlers;
