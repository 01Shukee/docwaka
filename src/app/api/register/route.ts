// src/app/api/register/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/bcrypt";
import { registerSchema } from "@/lib/validations";
import { apiError } from "@/lib/auth-helpers";
import { ZodError } from "zod";

/**
 * POST /api/register
 *
 * FSD §4.1 / §5.1 — Registration flow:
 *   - Validates all fields via Zod schema
 *   - SYS_ADMIN role blocked from public registration
 *   - Duplicate email check
 *   - HOD/Dean uniqueness per department enforced (FSD §3.4)
 *   - DEPT_ADMIN uniqueness per department enforced (FSD §3.4)
 *   - Password hashed with bcryptjs (10 rounds)
 *   - Account created with status: PENDING
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();

    // ── 1. Validate input ────────────────────────────────────────────────────
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0]?.message ?? "Invalid input.";
      return apiError(firstError, 400);
    }

    const { name, email, password, role, departmentId } = parsed.data;

    // ── 2. SYS_ADMIN is seeded only — never via public form ─────────────────
    // (Also enforced at the frontend but double-checked here)
    if ((role as string) === "SYS_ADMIN") {
      return apiError("This role cannot be registered publicly.", 400);
    }

    // ── 3. Verify department exists ──────────────────────────────────────────
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
    });
    if (!department) {
      return apiError("Selected department does not exist.", 400);
    }

    // ── 4. Duplicate email check ─────────────────────────────────────────────
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (existingUser) {
      return apiError("An account with this email already exists.", 409);
    }

    // ── 5. Per-department role uniqueness constraints (FSD §3.4) ─────────────
    if (role === "HOD" || role === "DEAN") {
      const conflict = await prisma.user.findFirst({
        where: { departmentId, role },
      });
      if (conflict) {
        const label = role === "HOD" ? "Head of Department" : "Dean";
        return apiError(
          `This department already has a registered ${label}. Only one is permitted per department.`,
          409
        );
      }
    }

    if (role === "DEPT_ADMIN") {
      const conflict = await prisma.user.findFirst({
        where: { departmentId, role: "DEPT_ADMIN" },
      });
      if (conflict) {
        return apiError(
          "This department already has a registered Department Administrator.",
          409
        );
      }
    }

    // ── 6. Hash password and create user ─────────────────────────────────────
    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name:         name.trim(),
        email:        email.toLowerCase().trim(),
        password:     hashedPassword,
        role,
        status:       "PENDING",
        departmentId,
      },
      select: {
        id:         true,
        name:       true,
        email:      true,
        role:       true,
        status:     true,
        department: { select: { id: true, name: true } },
        createdAt:  true,
      },
    });

    return NextResponse.json(
      {
        message: "Registration successful. Your account is awaiting approval.",
        user,
      },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof ZodError) {
      return apiError(err.errors[0]?.message ?? "Invalid input.", 400);
    }
    console.error("[POST /api/register]", err);
    return apiError("An unexpected error occurred. Please try again.", 500);
  }
}
