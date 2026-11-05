// src/app/api/documents/inbox/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, apiError } from "@/lib/auth-helpers";
import { documentListSelect } from "@/lib/documents";

/** GET /api/documents/inbox — documents addressed to the current user + pending badge count. */
export async function GET(): Promise<NextResponse> {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const documents = await prisma.document.findMany({
      where:   { recipientId: user.id },
      select:  documentListSelect,
      orderBy: { updatedAt: "desc" },
    });

    // The full list is returned, so no second COUNT query is needed.
    const pendingCount = documents.reduce((n, d) => n + (d.status === "PENDING" ? 1 : 0), 0);

    return NextResponse.json({ documents, pendingCount });
  } catch (err) {
    console.error("[GET /api/documents/inbox]", err);
    return apiError("Failed to fetch inbox.", 500);
  }
}
