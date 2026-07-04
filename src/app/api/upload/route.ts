// src/app/api/upload/route.ts

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, apiError } from "@/lib/auth-helpers";

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

    const validTypes = ["application/pdf", "image/png", "image/jpeg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return apiError("Only PDF and image files (PNG, JPG, WebP) are accepted.", 400);
    }

    const maxSize = file.type === "application/pdf"
      ? 16 * 1024 * 1024
      :  4 * 1024 * 1024;

    if (file.size > maxSize) {
      return apiError(
        file.type === "application/pdf"
          ? "PDF must be under 16 MB."
          : "Image must be under 4 MB.",
        400
      );
    }

    const buffer  = await file.arrayBuffer();
    const base64  = Buffer.from(buffer).toString("base64");
    const fileUrl = `data:${file.type};base64,${base64}`;

    return NextResponse.json({ fileUrl, fileName: file.name }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/upload]", err);
    return apiError("Upload failed.", 500);
  }
}