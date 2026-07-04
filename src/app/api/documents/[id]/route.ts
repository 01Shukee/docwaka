// src/app/api/documents/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, apiError } from "@/lib/auth-helpers";

/**
 * GET /api/documents/[id]
 *
 * FSD §4.4 / §5.3 — Returns full document detail including:
 *   - Metadata (title, description, sender, recipient, status, dates)
 *   - Signatures
 *   - Rejection logs
 *   - Audit trail (chronological)
 *
 * Access: restricted to the document's sender OR recipient (FSD §6.6).
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const { id } = await params;

    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        sender: {
          select: { id: true, name: true, email: true, department: { select: { id: true, name: true } } },
        },
        recipient: {
          select: { id: true, name: true, email: true, department: { select: { id: true, name: true } } },
        },
        signatures: {
          select: { id: true, data: true, createdAt: true, user: { select: { id: true, name: true } } },
          orderBy: { createdAt: "asc" },
        },
        rejectionLogs: {
          select: {
            id: true, reason: true, createdAt: true,
            rejectedBy: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        auditLogs: {
          select: {
            id: true, action: true, details: true, createdAt: true,
            user: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!document) {
      return apiError("Document not found.", 404);
    }

    // Access control — only sender or recipient may view this document
    const isParticipant =
      document.senderId === user.id || document.recipientId === user.id;

    // SYS_ADMIN and higher roles may view any document for oversight
    const isAdminRole = ["SYS_ADMIN", "HOD", "DEAN", "DEPT_ADMIN"].includes(user.role);

    if (!isParticipant && !isAdminRole) {
      return apiError("You do not have permission to view this document.", 403);
    }

    return NextResponse.json({ document });
  } catch (err) {
    console.error("[GET /api/documents/[id]]", err);
    return apiError("Failed to fetch document.", 500);
  }
}
