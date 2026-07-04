// src/app/api/documents/[id]/sign/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, apiError } from "@/lib/auth-helpers";
import { createAuditLog } from "@/lib/audit";
import { signatureSchema } from "@/lib/validations";

/**
 * POST /api/documents/[id]/sign
 *
 * FSD §4.5 — Signature submission:
 *   - Only the recipient may sign
 *   - Document must be in PENDING status
 *   - Signature stored as base64 PNG data URL in the Signature table
 *   - SIGNED AuditLog entry created
 *
 * The client calls this endpoint first, then calls /action with { action: "ACCEPT" }.
 * The /action handler verifies the signature exists before allowing acceptance.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const { id } = await params;
    const body = await req.json();

    const parsed = signatureSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.errors[0]?.message ?? "Invalid signature.", 400);
    }

    const { data: signatureData } = parsed.data;

    // ── Verify document exists and is accessible ──────────────────────────────
    const document = await prisma.document.findUnique({
      where: { id },
      select: { id: true, status: true, recipientId: true },
    });

    if (!document) {
      return apiError("Document not found.", 404);
    }

    if (document.recipientId !== user.id) {
      return apiError("Only the document recipient can sign this document.", 403);
    }

    if (document.status !== "PENDING") {
      return apiError(
        `Cannot sign a document with status: ${document.status}.`,
        409
      );
    }

    // ── Upsert signature — one signature per user per document ───────────────
    // If the user re-draws, we replace the previous signature rather than
    // accumulating duplicates.
    const existing = await prisma.signature.findFirst({
      where: { documentId: id, userId: user.id },
    });

    let signature;
    if (existing) {
      signature = await prisma.signature.update({
        where: { id: existing.id },
        data:  { data: signatureData },
        select: { id: true, createdAt: true, user: { select: { id: true, name: true } } },
      });
    } else {
      signature = await prisma.signature.create({
        data: {
          documentId: id,
          userId:     user.id,
          data:       signatureData,
        },
        select: { id: true, createdAt: true, user: { select: { id: true, name: true } } },
      });

      // Only log SIGNED the first time (not on re-draws)
      await createAuditLog({
        documentId: id,
        userId:     user.id,
        action:     "SIGNED",
        details:    "Recipient provided signature.",
      });
    }

    return NextResponse.json({ signature }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/documents/[id]/sign]", err);
    return apiError("Failed to save signature.", 500);
  }
}
