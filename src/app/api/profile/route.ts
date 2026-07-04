// src/app/api/profile/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, apiError } from "@/lib/auth-helpers";
import { verifyPassword, hashPassword } from "@/lib/bcrypt";
import { updateNameSchema, changePasswordSchema } from "@/lib/validations";

/**
 * GET /api/profile
 *
 * FSD §4.11 — Returns the current user's full profile:
 *   name, email, role, department, status, member since,
 *   approved by, document counts (sent + received).
 */
export async function GET(): Promise<NextResponse> {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id:         true,
        name:       true,
        email:      true,
        role:       true,
        status:     true,
        createdAt:  true,
        department: { select: { id: true, name: true } },
        approvedBy: { select: { id: true, name: true } },
        _count: {
          select: {
            sentDocuments:     true,
            receivedDocuments: true,
          },
        },
      },
    });

    if (!profile) return apiError("Profile not found.", 404);

    return NextResponse.json({ profile });
  } catch (err) {
    console.error("[GET /api/profile]", err);
    return apiError("Failed to fetch profile.", 500);
  }
}

/**
 * PATCH /api/profile
 *
 * FSD §4.11 — Two operations determined by the `type` field in the body:
 *
 *   type: "name"     → updates display name
 *   type: "password" → verifies current password then sets new password
 */
export async function PATCH(req: NextRequest): Promise<NextResponse> {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const body = await req.json();
    const { type } = body;

    if (type === "name") {
      const parsed = updateNameSchema.safeParse(body);
      if (!parsed.success) {
        return apiError(parsed.error.errors[0]?.message ?? "Invalid name.", 400);
      }

      const updated = await prisma.user.update({
        where: { id: user.id },
        data:  { name: parsed.data.name.trim() },
        select: { id: true, name: true, email: true, role: true },
      });

      return NextResponse.json({ user: updated });
    }

    if (type === "password") {
      const parsed = changePasswordSchema.safeParse(body);
      if (!parsed.success) {
        return apiError(parsed.error.errors[0]?.message ?? "Invalid input.", 400);
      }

      // Fetch the stored hash
      const dbUser = await prisma.user.findUnique({
        where:  { id: user.id },
        select: { password: true },
      });
      if (!dbUser) return apiError("User not found.", 404);

      // Verify current password before allowing the change (FSD §4.11)
      const valid = await verifyPassword(parsed.data.currentPassword, dbUser.password);
      if (!valid) {
        return apiError("Current password is incorrect.", 400);
      }

      const newHash = await hashPassword(parsed.data.newPassword);
      await prisma.user.update({
        where: { id: user.id },
        data:  { password: newHash },
      });

      return NextResponse.json({ message: "Password updated successfully." });
    }

    return apiError("Invalid update type. Must be 'name' or 'password'.", 400);
  } catch (err) {
    console.error("[PATCH /api/profile]", err);
    return apiError("Failed to update profile.", 500);
  }
}
