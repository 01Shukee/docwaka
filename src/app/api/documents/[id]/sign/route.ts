// src/app/api/documents/[id]/sign/route.ts

import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth, apiError } from "@/lib/auth-helpers";
import { signatureSchema } from "@/lib/validations";

/**
 * POST /api/documents/[id]/sign
 *
 * Recipient-only, PENDING-only. One signature per user per document
 * (DB-enforced); re-drawing replaces it. Both first signing and re-signing are
 * audited, in the same atomic write as the signature itself.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const { id } = await params;
    const body = await req.json().catch(() => null);

    const parsed = signatureSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.errors[0]?.message ?? "Invalid signature.", 400);
    }
    const signatureData = parsed.data.data;

    const where = { documentId_userId: { documentId: id, userId: user.id } };
    const existing = await prisma.signature.findUnique({ where, select: { id: true } });

    try {
      await prisma.document.update({
        where: { id, recipientId: user.id, status: "PENDING" },
        data: {
          signatures: {
            upsert: {
              where,
              create: { userId: user.id, data: signatureData },
              update: { data: signatureData },
            },
          },
          auditLogs: {
            create: {
              userId:  user.id,
              action:  "SIGNED",
              details: existing ? "Recipient replaced their signature." : "Recipient provided signature.",
            },
          },
        },
        select: { id: true },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
        const d = await prisma.document.findUnique({ where: { id }, select: { status: true, recipientId: true } });
        if (!d)                        return apiError("Document not found.", 404);
        if (d.recipientId !== user.id) return apiError("Only the document recipient can sign this document.", 403);
        return apiError(`Cannot sign a document with status: ${d.status}.`, 409);
      }
      throw e;
    }

    const signature = await prisma.signature.findUnique({
      where,
      select: { id: true, createdAt: true, user: { select: { id: true, name: true } } },
    });
    return NextResponse.json({ signature }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/documents/[id]/sign]", err);
    return apiError("Failed to save signature.", 500);
  }
}
