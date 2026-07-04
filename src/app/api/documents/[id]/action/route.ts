// src/app/api/documents/[id]/action/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, apiError } from "@/lib/auth-helpers";
import { documentActionSchema } from "@/lib/validations";

/**
 * POST /api/documents/[id]/action
 *
 * State machine actions — all writes sequential (no $transaction)
 * to avoid cloud DB interactive-transaction timeouts (P2028).
 *
 * ACCEPT  (PENDING  → ACCEPTED)  — signature must exist first
 * REJECT  (PENDING  → REJECTED)  — reason required
 * DELIVER (ACCEPTED → DELIVERED) — confirms physical delivery
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const { id } = await params;
    const body   = await req.json();

    const parsed = documentActionSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.errors[0]?.message ?? "Invalid input.", 400);
    }

    const input = parsed.data;

    const document = await prisma.document.findUnique({
      where:  { id },
      select: { id: true, status: true, recipientId: true, senderId: true },
    });

    if (!document)                          return apiError("Document not found.", 404);
    if (document.recipientId !== user.id)   return apiError("Only the recipient can perform this action.", 403);

    // ── ACCEPT ───────────────────────────────────────────────────────────────
    if (input.action === "ACCEPT") {
      if (document.status !== "PENDING") {
        return apiError(`Cannot accept a document with status: ${document.status}.`, 409);
      }

      const signature = await prisma.signature.findFirst({
        where: { documentId: id, userId: user.id },
      });
      if (!signature) {
        return apiError("A signature is required before accepting. Please sign first.", 400);
      }

      await prisma.document.update({
        where: { id },
        data:  { status: "ACCEPTED" },
      });

      try {
        await prisma.auditLog.create({
          data: { documentId: id, userId: user.id, action: "ACCEPTED", details: "Document accepted by recipient." },
        });
      } catch (e) { console.error("Audit log failed:", e); }
    }

    // ── REJECT ───────────────────────────────────────────────────────────────
    else if (input.action === "REJECT") {
      if (document.status !== "PENDING") {
        return apiError(`Cannot reject a document with status: ${document.status}.`, 409);
      }

      await prisma.document.update({
        where: { id },
        data:  { status: "REJECTED" },
      });

      try {
        await prisma.rejectionLog.create({
          data: { documentId: id, rejectedById: user.id, reason: input.reason },
        });
        await prisma.auditLog.create({
          data: { documentId: id, userId: user.id, action: "REJECTED", details: `Reason: ${input.reason}` },
        });
      } catch (e) { console.error("Rejection log failed:", e); }
    }

    // ── DELIVER ──────────────────────────────────────────────────────────────
    else if (input.action === "DELIVER") {
      if (document.status !== "ACCEPTED") {
        return apiError(`Cannot deliver a document with status: ${document.status}. Must be ACCEPTED first.`, 409);
      }

      await prisma.document.update({
        where: { id },
        data:  { status: "DELIVERED" },
      });

      try {
        await prisma.auditLog.create({
          data: { documentId: id, userId: user.id, action: "DELIVERED", details: "Delivery confirmed by recipient." },
        });
      } catch (e) { console.error("Audit log failed:", e); }
    }

    // ── Return updated document ───────────────────────────────────────────────
    const updated = await prisma.document.findUnique({
      where: { id },
      include: {
        sender:        { select: { id: true, name: true, email: true, department: { select: { id: true, name: true } } } },
        recipient:     { select: { id: true, name: true, email: true, department: { select: { id: true, name: true } } } },
        signatures:    { select: { id: true, data: true, createdAt: true, user: { select: { id: true, name: true } } } },
        rejectionLogs: { select: { id: true, reason: true, createdAt: true, rejectedBy: { select: { id: true, name: true } } } },
        auditLogs:     { select: { id: true, action: true, details: true, createdAt: true, user: { select: { id: true, name: true, email: true } } }, orderBy: { createdAt: "asc" } },
      },
    });

    return NextResponse.json({ document: updated });
  } catch (err) {
    console.error("[POST /api/documents/[id]/action]", err);
    return apiError("Failed to perform action.", 500);
  }
}