// src/app/api/admin/users/route.ts

import { NextRequest, NextResponse, after } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, apiError, ADMIN_ROLES, getApprovableRoles } from "@/lib/auth-helpers";
import { userActionSchema } from "@/lib/validations";
import { notifyAccountDecision } from "@/lib/notifications";

/**
 * GET /api/admin/users
 *
 * Returns users the current admin is authorised to manage,
 * grouped into pending / approved / rejected.
 *
 * SYS_ADMIN  → sees all roles across all departments
 * HOD / DEAN → sees DEPT_ADMIN in their own department
 * DEPT_ADMIN → sees STAFF in their own department
 */
export async function GET(): Promise<NextResponse> {
  try {
    const { user, error } = await requireRole(ADMIN_ROLES);
    if (error) return error;

    const approvableRoles = getApprovableRoles(user.role);

    // SYS_ADMIN sees across all departments; others are scoped to their own
    const departmentFilter =
      user.role === "SYS_ADMIN" ? {} : { departmentId: user.departmentId };

    const users = await prisma.user.findMany({
      where: {
        role:  { in: approvableRoles },
        id:    { not: user.id }, // never show the admin themselves
        ...departmentFilter,
      },
      select: {
        id:         true,
        name:       true,
        email:      true,
        role:       true,
        status:     true,
        createdAt:  true,
        department: { select: { id: true, name: true } },
        approvedBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

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
 * Approve, Reject, or Revoke a user account.
 * SYS_ADMIN can action any non-SYS_ADMIN role.
 */
export async function PATCH(req: NextRequest): Promise<NextResponse> {
  try {
    const { user, error } = await requireRole(ADMIN_ROLES);
    if (error) return error;

    const body   = await req.json().catch(() => null);
    const parsed = userActionSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.errors[0]?.message ?? "Invalid input.", 400);
    }

    const { userId, action } = parsed.data;

    const targetUser = await prisma.user.findUnique({
      where:  { id: userId },
      select: { id: true, role: true, status: true, departmentId: true, name: true },
    });
    if (!targetUser) return apiError("User not found.", 404);

    // Prevent any role from approving SYS_ADMIN accounts
    if (targetUser.role === "SYS_ADMIN") {
      return apiError("SYS_ADMIN accounts cannot be managed through this panel.", 403);
    }

    // Non-SYS_ADMIN admins may only manage users in their OWN department
    if (user.role !== "SYS_ADMIN" && targetUser.departmentId !== user.departmentId) {
      return apiError("You are not authorised to manage users in another department.", 403);
    }

    const approvableRoles = getApprovableRoles(user.role);
    if (!approvableRoles.includes(targetUser.role)) {
      return apiError(
        "You are not authorised to manage users with this role.",
        403
      );
    }

    let newStatus: "PENDING" | "APPROVED" | "REJECTED";
    switch (action) {
      case "APPROVE": newStatus = "APPROVED"; break;
      case "REJECT":  newStatus = "REJECTED"; break;
      case "REVOKE":  newStatus = "PENDING";  break;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        status:       newStatus,
        approvedById: action === "APPROVE"
          ? user.id
          : action === "REVOKE"
            ? null
            : undefined,
      },
      select: {
        id: true, name: true, email: true, role: true, status: true,
        department: { select: { id: true, name: true } },
        approvedBy: { select: { id: true, name: true } },
      },
    });

    if (action === "APPROVE" || action === "REJECT") {
      after(() => notifyAccountDecision(updatedUser, action === "APPROVE"));
    }

    return NextResponse.json({ user: updatedUser });
  } catch (err) {
    console.error("[PATCH /api/admin/users]", err);
    return apiError("Failed to update user.", 500);
  }
}
