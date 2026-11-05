// src/app/api/upload/route.ts

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, apiError } from "@/lib/auth-helpers";
import { sniffMime } from "@/lib/files";

/**
 * POST /api/upload
 *
 * Simple file upload endpoint — accepts multipart/form-data, returns a
 * base64 data URL stored directly in the Document.fileUrl field.
 * Works without any third-party storage credentials.
 *
 * Limits: PDF ≤ 16 MB, images ≤ 4 MB.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { error } = await requireAuth();
    if (error) return error;

    const formData = await req.formData();
    const file     = formData.get("file") as File | null;

    if (!file) return apiError("No file provided.", 400);

    // Size first (cheap) using the largest allowed limit, then verify the REAL
    // type from the file's bytes rather than the client-supplied file.type.
    if (file.size > 16 * 1024 * 1024) return apiError("File is too large.", 400);

    const bytes = new Uint8Array(await file.arrayBuffer());
    const mime  = sniffMime(bytes);
    if (!mime) {
      return apiError("Only PDF and image files (PNG, JPG, WebP) are accepted.", 400);
    }
    if (mime !== "application/pdf" && bytes.length > 4 * 1024 * 1024) {
      return apiError("Image must be under 4 MB.", 400);
    }

    const fileUrl = `data:${mime};base64,${Buffer.from(bytes).toString("base64")}`;

    return NextResponse.json({ fileUrl, fileName: file.name.slice(0, 200) }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/upload]", err);
    return apiError("Upload failed.", 500);
  }
}
