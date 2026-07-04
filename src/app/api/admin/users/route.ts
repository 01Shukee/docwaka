// src/app/api/admin/users/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, apiError, getApprovableRoles } from "@/lib/auth-helpers";
import { userActionSchema } from "@/lib/validations";

const ADMIN_ROLES = ["DEPT_ADMIN", "HOD", "DEAN", "SYS_ADMIN"] as const;

/**
 * GET /api/admin/users
 *
 * FSD §4.10 — Returns users the current admin is authorised to manage,
 * grouped into PENDING, APPROVED, and REJECTED sections.
 *
 * Role scoping (FSD §3.1):
 *   SYS_ADMIN  → sees HOD and DEAN users across all departments
 *   HOD / DEAN → sees DEPT_ADMIN users in their own department
 *   DEPT_ADMIN → sees STAFF users in their own department
 */
export async function GET(): Promise<NextResponse> {
  try {
    const { user, error } = await requireRole([...ADMIN_ROLES]);
    if (error) return error;

    const approvableRoles = getApprovableRoles(user.role);

    // Fetch the full admin user record to get their departmentId
    const adminUser = await prisma.user.findUnique({
      where:  { id: user.id },
      select: { departmentId: true },
    });

    if (!adminUser) return apiError("Admin user not found.", 404);

    // SYS_ADMIN sees across all departments; others are scoped to their own
    const departmentFilter =
      user.role === "SYS_ADMIN"
        ? {}
        : { departmentId: adminUser.departmentId };

    const users = await prisma.user.findMany({
      where: {
        role: { in: approvableRoles },
        ...departmentFilter,
      },
      select: {
        id:           true,
        name:         true,
        email:        true,
        role:         true,
        status:       true,
        createdAt:    true,
        department:   { select: { id: true, name: true } },
        approvedBy:   { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Group by status for the three-section admin UI
    const pending  = users.filter((u) => u.status === "PENDING");
    const approved = users.filter((u) => u.status === "APPROVED");
    const rejected = users.filter((u) => u.status === "REJECTED");

    return NextResponse.json({ pending, approved, rejected });
  } catch (err) {
    console.error("[GET /api/admin/users]", err);
    return apiError("Failed to fetch users.", 500);
  }
}

/**
 * PATCH /api/admin/users
 *
 * FSD §4.10 — Approve, Reject, or Revoke a user account.
 *
 * Actions:
 *   APPROVE → status: APPROVED, approvedById set to current user
 *   REJECT  → status: REJECTED
 *   REVOKE  → status: PENDING, approvedById cleared (move back to pending)
 *
 * Role-gating: the approver must be authorised to manage the target user's role.
 */
export async function PATCH(req: NextRequest): Promise<NextResponse> {
  try {
    const { user, error } = await requireRole([...ADMIN_ROLES]);
    if (error) return error;

    const body = await req.json();
    const parsed = userActionSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.errors[0]?.message ?? "Invalid input.", 400);
    }

    const { userId, action } = parsed.data;

    // Fetch the target user
    const targetUser = await prisma.user.findUnique({
      where:  { id: userId },
      select: { id: true, role: true, status: true, departmentId: true, name: true },
    });

    if (!targetUser) return apiError("User not found.", 404);

    // Verify the current admin can manage this role
    const approvableRoles = getApprovableRoles(user.role);
    if (!approvableRoles.includes(targetUser.role)) {
      return apiError(
        "You are not authorised to manage users with this role.",
        403
      );
    }

    // Determine new status
    let newStatus: "PENDING" | "APPROVED" | "REJECTED";
    switch (action) {
      case "APPROVE": newStatus = "APPROVED"; break;
      case "REJECT":  newStatus = "REJECTED"; break;
      case "REVOKE":  newStatus = "PENDING";  break;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        status:      newStatus,
        approvedById: action === "APPROVE" ? user.id : action === "REVOKE" ? null : undefined,
      },
      select: {
        id: true, name: true, email: true, role: true, status: true,
        department: { select: { id: true, name: true } },
        approvedBy: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (err) {
    console.error("[PATCH /api/admin/users]", err);
    return apiError("Failed to update user.", 500);
  }
}
