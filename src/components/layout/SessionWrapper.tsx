// src/components/layout/SessionWrapper.tsx

"use client";

import { SessionProvider } from "next-auth/react";

/**
 * Thin client wrapper that provides the NextAuth session context
 * to all client components that call useSession().
 *
 * Kept as a separate file so the root layout (a Server Component)
 * can import it without becoming a client component itself.
 */
export default function SessionWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}
