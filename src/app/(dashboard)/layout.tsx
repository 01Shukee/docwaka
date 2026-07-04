// src/app/(dashboard)/layout.tsx

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AppShell from "@/components/layout/AppShell";
import { ToastProvider } from "@/components/ui/Toast";
import type { Role } from "@/types/user";

/**
 * Protected layout for all (dashboard) routes.
 *
 * Runs on the server — fetches the session and the pending inbox count
 * in a single render so the sidebar badge is always fresh without a
 * client-side fetch waterfall.
 *
 * Unauthenticated users are redirected by middleware.ts before this
 * layout is even evaluated, but we double-check here as a safety net.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch pending inbox count for the sidebar badge
  let inboxCount = 0;
  try {
    inboxCount = await prisma.document.count({
      where: {
        recipientId: session.user.id,
        status:      "PENDING",
      },
    });
  } catch {
    // Non-critical — sidebar still renders without the badge
  }

  return (
    <ToastProvider>
      <AppShell
        userName={session.user.name}
        userRole={session.user.role as Role}
        userEmail={session.user.email}
        inboxCount={inboxCount}
      >
        {children}
      </AppShell>
    </ToastProvider>
  );
}
