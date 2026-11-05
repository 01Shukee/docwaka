// src/app/api/documents/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, apiError } from "@/lib/auth-helpers";
import { documentDetailSelect, canViewDocument, presentFile } from "@/lib/documents";

/**
 * GET /api/documents/[id] — full detail (signatures, rejections, audit trail).
 * Access: sender/recipient, SYS_ADMIN, or an admin of the sender's/recipient's department.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const { id } = await params;

    const row = await prisma.document.findUnique({
      where:  { id },
      select: { ...documentDetailSelect, fileUrl: true, senderId: true, recipientId: true },
    });
    if (!row) return apiError("Document not found.", 404);

    const { fileUrl, senderId, recipientId, ...document } = row;

    const allowed = canViewDocument(user, {
      senderId, recipientId,
      senderDeptId:    document.sender.department.id,
      recipientDeptId: document.recipient.department.id,
    });
    if (!allowed) return apiError("You do not have permission to view this document.", 403);

    return NextResponse.json({ document: { ...document, ...presentFile(id, fileUrl) } });
  } catch (err) {
    console.error("[GET /api/documents/[id]]", err);
    return apiError("Failed to fetch document.", 500);
  }
}
