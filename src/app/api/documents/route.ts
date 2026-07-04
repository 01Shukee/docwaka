// src/app/api/documents/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, apiError } from "@/lib/auth-helpers";
import { createDocumentSchema } from "@/lib/validations";

/**
 * POST /api/documents — create and dispatch a document.
 * Writes are done sequentially (no transaction) to avoid the 5 s
 * interactive-transaction timeout on cloud/serverless databases.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const body   = await req.json();
    const parsed = createDocumentSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.errors[0]?.message ?? "Invalid input.", 400);
    }

    const { title, description, recipientId, fileUrl } = parsed.data;

    if (recipientId === user.id) {
      return apiError("You cannot send a document to yourself.", 400);
    }

    // Verify recipient exists and is approved
    const recipient = await prisma.user.findUnique({
      where:  { id: recipientId, status: "APPROVED" },
      select: { id: true, name: true },
    });
    if (!recipient) {
      return apiError("Recipient not found or not an approved user.", 404);
    }

    // ── Write 1: create the document ────────────────────────────────────────
    const doc = await prisma.document.create({
      data: {
        title:       title.trim(),
        description: description?.trim() ?? null,
        fileUrl:     fileUrl ?? null,
        status:      "PENDING",
        senderId:    user.id,
        recipientId,
      },
      include: {
        sender: {
          select: {
            id: true, name: true, email: true,
            department: { select: { id: true, name: true } },
          },
        },
        recipient: {
          select: {
            id: true, name: true, email: true,
            department: { select: { id: true, name: true } },
          },
        },
      },
    });

    // ── Write 2: create audit log (non-blocking — failure won't 500) ────────
    try {
      await prisma.auditLog.create({
        data: {
          documentId: doc.id,
          userId:     user.id,
          action:     "DISPATCHED",
          details:    `Document dispatched to ${recipient.name}.`,
        },
      });
    } catch (auditErr) {
      console.error("[POST /api/documents] Audit log write failed:", auditErr);
    }

    return NextResponse.json({ document: doc }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/documents]", err);
    return apiError("Failed to create document.", 500);
  }
}

/**
 * GET /api/documents — all documents where current user is sender OR recipient.
 */
export async function GET(): Promise<NextResponse> {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const documents = await prisma.document.findMany({
      where: {
        OR: [{ senderId: user.id }, { recipientId: user.id }],
      },
      include: {
        sender: {
          select: {
            id: true, name: true, email: true,
            department: { select: { id: true, name: true } },
          },
        },
        recipient: {
          select: {
            id: true, name: true, email: true,
            department: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ documents });
  } catch (err) {
    console.error("[GET /api/documents]", err);
    return apiError("Failed to fetch documents.", 500);
  }
}