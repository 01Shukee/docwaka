// src/app/api/documents/outbox/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, apiError } from "@/lib/auth-helpers";

/**
 * GET /api/documents/outbox
 *
 * FSD §4.3 — Returns all documents where the current user is the sender,
 * ordered newest first. Shows current status of each dispatched document.
 */
export async function GET(): Promise<NextResponse> {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const documents = await prisma.document.findMany({
      where:   { senderId: user.id },
      include: {
        sender:    { select: { id: true, name: true, email: true, department: { select: { id: true, name: true } } } },
        recipient: { select: { id: true, name: true, email: true, department: { select: { id: true, name: true } } } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ documents });
  } catch (err) {
    console.error("[GET /api/documents/outbox]", err);
    return apiError("Failed to fetch outbox.", 500);
  }
}
