// src/app/api/documents/inbox/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, apiError } from "@/lib/auth-helpers";

/**
 * GET /api/documents/inbox
 *
 * FSD §4.3 — Returns all documents where the current user is the recipient,
 * ordered newest first. Also returns a pendingCount for the badge on the
 * Inbox tab.
 */
export async function GET(): Promise<NextResponse> {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const [documents, pendingCount] = await Promise.all([
      prisma.document.findMany({
        where:   { recipientId: user.id },
        include: {
          sender:    { select: { id: true, name: true, email: true, department: { select: { id: true, name: true } } } },
          recipient: { select: { id: true, name: true, email: true, department: { select: { id: true, name: true } } } },
        },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.document.count({
        where: { recipientId: user.id, status: "PENDING" },
      }),
    ]);

    return NextResponse.json({ documents, pendingCount });
  } catch (err) {
    console.error("[GET /api/documents/inbox]", err);
    return apiError("Failed to fetch inbox.", 500);
  }
}
