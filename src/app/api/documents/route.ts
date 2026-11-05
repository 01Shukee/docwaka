// src/app/api/documents/route.ts

import { NextRequest, NextResponse, after } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, apiError } from "@/lib/auth-helpers";
import { createDocumentSchema } from "@/lib/validations";
import { documentListSelect } from "@/lib/documents";
import { notifyDocumentDispatched } from "@/lib/notifications";

/**
 * POST /api/documents — create and dispatch a document.
 * The document and its DISPATCHED audit entry are one nested write, so they
 * succeed or fail together (single round trip, no interactive transaction).
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const body = await req.json().catch(() => null);
    const parsed = createDocumentSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.errors[0]?.message ?? "Invalid input.", 400);
    }

    const { title, description, recipientId, fileUrl } = parsed.data;

    if (recipientId === user.id) {
      return apiError("You cannot send a document to yourself.", 400);
    }

    const recipient = await prisma.user.findFirst({
      where:  { id: recipientId, status: "APPROVED" },
      select: { id: true, name: true },
    });
    if (!recipient) {
      return apiError("Recipient not found or not an approved user.", 404);
    }

    const doc = await prisma.document.create({
      data: {
        title,
        description: description?.trim() || null,
        fileUrl:     fileUrl ?? null,
        status:      "PENDING",
        senderId:    user.id,
        recipientId,
        auditLogs: {
          create: {
            userId:  user.id,
            action:  "DISPATCHED",
            details: `Document dispatched to ${recipient.name}.`,
          },
        },
      },
      select: documentListSelect,
    });

    // Email the recipient after the response is sent (never blocks/fails dispatch)
    after(() => notifyDocumentDispatched(doc));

    return NextResponse.json({ document: doc }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/documents]", err);
    return apiError("Failed to create document.", 500);
  }
}

/** GET /api/documents — documents where the current user is sender OR recipient. */
export async function GET(): Promise<NextResponse> {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const documents = await prisma.document.findMany({
      where:   { OR: [{ senderId: user.id }, { recipientId: user.id }] },
      select:  documentListSelect,
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ documents });
  } catch (err) {
    console.error("[GET /api/documents]", err);
    return apiError("Failed to fetch documents.", 500);
  }
}
