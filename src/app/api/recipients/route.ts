// src/app/api/recipients/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, apiError } from "@/lib/auth-helpers";

/**
 * GET /api/recipients
 *
 * FSD §4.2 — Recipient dropdown shows only APPROVED users, excluding the sender.
 * Returns a minimal list: id, name, email, department — enough for a searchable
 * dropdown without exposing sensitive fields.
 */
export async function GET(): Promise<NextResponse> {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const recipients = await prisma.user.findMany({
      where: {
        status: "APPROVED",
        id:     { not: user.id }, // Exclude the current user (sender)
      },
      select: {
        id:         true,
        name:       true,
        email:      true,
        role:       true,
        department: { select: { id: true, name: true } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ recipients });
  } catch (err) {
    console.error("[GET /api/recipients]", err);
    return apiError("Failed to fetch recipients.", 500);
  }
}
