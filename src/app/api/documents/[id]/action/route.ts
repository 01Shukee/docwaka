// src/app/api/documents/[id]/action/route.ts

import { NextRequest, NextResponse, after } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth, apiError } from "@/lib/auth-helpers";
import { documentActionSchema } from "@/lib/validations";
import { documentDetailSelect } from "@/lib/documents";
import { notifyDocumentAction } from "@/lib/notifications";

/**
 * POST /api/documents/[id]/action
 *
 *   ACCEPT  (PENDING  → ACCEPTED)  — requires an existing signature
 *   REJECT  (PENDING  → REJECTED)  — reason required
 *   DELIVER (ACCEPTED → DELIVERED)
 *
 * Each action is ONE nested update whose WHERE includes the expected status and
 * recipient. That makes the state transition atomic (double-clicks and
 * ACCEPT-vs-REJECT races can't both win) and writes the status change, the
 * audit entry and the rejection log together or not at all.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const { id } = await params;
    const body   = await req.json().catch(() => null);

    const parsed = documentActionSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.errors[0]?.message ?? "Invalid input.", 400);
    }
    const input = parsed.data;

    const expectedStatus = input.action === "DELIVER" ? "ACCEPTED" : "PENDING";

    /** Works out why an atomic update didn't apply, for a precise error. */
    const diagnose = async (): Promise<NextResponse | null> => {
      const d = await prisma.document.findUnique({
        where: { id }, select: { status: true, recipientId: true },
      });
      if (!d)                        return apiError("Document not found.", 404);
      if (d.recipientId !== user.id) return apiError("Only the recipient can perform this action.", 403);
      if (d.status !== expectedStatus) {
        return apiError(`Cannot ${input.action.toLowerCase()} a document with status: ${d.status}.`, 409);
      }
      return null;
    };

    if (input.action === "ACCEPT") {
      const signature = await prisma.signature.findUnique({
        where:  { documentId_userId: { documentId: id, userId: user.id } },
        select: { id: true },
      });
      if (!signature) {
        return (await diagnose()) ??
          apiError("A signature is required before accepting. Please sign first.", 400);
      }
    }

    const data: Prisma.DocumentUpdateInput =
      input.action === "ACCEPT"
        ? { status: "ACCEPTED",
            auditLogs: { create: { userId: user.id, action: "ACCEPTED", details: "Document accepted by recipient." } } }
      : input.action === "REJECT"
        ? { status: "REJECTED",
            rejectionLogs: { create: { rejectedById: user.id, reason: input.reason } },
            auditLogs:     { create: { userId: user.id, action: "REJECTED", details: `Reason: ${input.reason}` } } }
        : { status: "DELIVERED",
            auditLogs: { create: { userId: user.id, action: "DELIVERED", details: "Delivery confirmed by recipient." } } };

    try {
      const document = await prisma.document.update({
        where:  { id, recipientId: user.id, status: expectedStatus },
        data,
        select: documentDetailSelect, // no fileUrl: the client keeps the one it already has
      });
      // Tell the sender what happened, after the response is sent
      const kind = input.action === "ACCEPT" ? "ACCEPTED" : input.action === "REJECT" ? "REJECTED" : "DELIVERED";
      after(() => notifyDocumentAction(kind, document, input.action === "REJECT" ? input.reason : undefined));

      return NextResponse.json({ document });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
        return (await diagnose()) ?? apiError("Document changed. Please refresh and retry.", 409);
      }
      throw e;
    }
  } catch (err) {
    console.error("[POST /api/documents/[id]/action]", err);
    return apiError("Failed to perform action.", 500);
  }
}
