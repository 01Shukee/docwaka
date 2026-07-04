// src/app/api/admin/departments/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, apiError } from "@/lib/auth-helpers";
import { createDepartmentSchema } from "@/lib/validations";

/**
 * GET /api/admin/departments
 *
 * FSD §4.10 — Returns all departments with user count.
 * Accessible to all admin roles so they can see department context.
 */
export async function GET(): Promise<NextResponse> {
  try {
    const { error } = await requireRole(["DEPT_ADMIN", "HOD", "DEAN", "SYS_ADMIN"]);
    if (error) return error;

    const departments = await prisma.department.findMany({
      include: {
        _count: { select: { users: true } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ departments });
  } catch (err) {
    console.error("[GET /api/admin/departments]", err);
    return apiError("Failed to fetch departments.", 500);
  }
}

/**
 * POST /api/admin/departments
 *
 * FSD §4.10 — SYS_ADMIN only. Creates a new department.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { error } = await requireRole(["SYS_ADMIN"]);
    if (error) return error;

    const body = await req.json();
    const parsed = createDepartmentSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.errors[0]?.message ?? "Invalid input.", 400);
    }

    const { name } = parsed.data;

    const existing = await prisma.department.findUnique({ where: { name } });
    if (existing) {
      return apiError("A department with this name already exists.", 409);
    }

    const department = await prisma.department.create({
      data: { name: name.trim() },
      include: { _count: { select: { users: true } } },
    });

    return NextResponse.json({ department }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/admin/departments]", err);
    return apiError("Failed to create department.", 500);
  }
}

/**
 * DELETE /api/admin/departments?id=<departmentId>
 *
 * FSD §4.10 — SYS_ADMIN only. Delete department only if no users assigned.
 */
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    const { error } = await requireRole(["SYS_ADMIN"]);
    if (error) return error;

    const id = req.nextUrl.searchParams.get("id");
    if (!id) return apiError("Department ID is required.", 400);

    const department = await prisma.department.findUnique({
      where:   { id },
      include: { _count: { select: { users: true } } },
    });

    if (!department) return apiError("Department not found.", 404);

    if (department._count.users > 0) {
      return apiError(
        "Cannot delete a department that has users assigned to it. Reassign or remove users first.",
        409
      );
    }

    await prisma.department.delete({ where: { id } });

    return NextResponse.json({ message: "Department deleted." });
  } catch (err) {
    console.error("[DELETE /api/admin/departments]", err);
    return apiError("Failed to delete department.", 500);
  }
}
