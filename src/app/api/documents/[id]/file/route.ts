// src/app/api/documents/[id]/file/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, apiError } from "@/lib/auth-helpers";
import { canViewDocument } from "@/lib/documents";
import { isDataUrl, isAllowedFileUrl } from "@/lib/files";

/**
 * GET /api/documents/[id]/file — streams the attachment with the correct
 * Content-Type, behind the same access rules as the document itself.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse | Response> {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const { id } = await params;
    const doc = await prisma.document.findUnique({
      where:  { id },
      select: {
        fileUrl: true, senderId: true, recipientId: true,
        sender:    { select: { departmentId: true } },
        recipient: { select: { departmentId: true } },
      },
    });
    if (!doc || !doc.fileUrl) return apiError("File not found.", 404);

    if (!canViewDocument(user, {
      senderId: doc.senderId, recipientId: doc.recipientId,
      senderDeptId: doc.sender.departmentId, recipientDeptId: doc.recipient.departmentId,
    })) {
      return apiError("You do not have permission to view this file.", 403);
    }

    // Re-validate at serve time, so legacy rows with unsafe URLs are never served.
    if (!isAllowedFileUrl(doc.fileUrl)) return apiError("File not available.", 404);

    if (!isDataUrl(doc.fileUrl)) return NextResponse.redirect(doc.fileUrl);

    const comma = doc.fileUrl.indexOf(",");
    const mime  = doc.fileUrl.slice(5, doc.fileUrl.indexOf(";"));
    const bytes = Buffer.from(doc.fileUrl.slice(comma + 1), "base64");

    const headers: Record<string, string> = {
      "Content-Type":           mime,
      "Content-Length":         String(bytes.length),
      "Content-Disposition":    "inline",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control":          "private, max-age=3600",
    };
    // (a CSP sandbox would stop Chrome's built-in PDF viewer, so images only)
    if (mime !== "application/pdf") headers["Content-Security-Policy"] = "default-src 'none'; sandbox";

    return new Response(bytes, { headers });
  } catch (err) {
    console.error("[GET /api/documents/[id]/file]", err);
    return apiError("Failed to load file.", 500);
  }
}
