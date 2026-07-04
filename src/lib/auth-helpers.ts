// src/lib/auth-helpers.ts

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { Role } from "@/types/user";

/**
 * Shape of a resolved, authenticated session user.
 * Every API route that calls requireAuth() receives this.
 */
export interface SessionUser {
  id:    string;
  name:  string;
  email: string;
  role:  Role;
}

/**
 * Retrieves and validates the current session from an API route or
 * Server Component.  Returns the session user, or throws a 401 NextResponse
 * that the calling route handler can return directly.
 *
 * Usage in API routes:
 *   const { user, error } = await requireAuth();
 *   if (error) return error;
 */
export async function requireAuth(): Promise<
  | { user: SessionUser; error: null }
  | { user: null; error: NextResponse }
> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      user: null,
      error: NextResponse.json(
        { error: "Unauthorised. Please log in." },
        { status: 401 }
      ),
    };
  }

  return {
    user: {
      id:    session.user.id,
      name:  session.user.name,
      email: session.user.email,
      role:  session.user.role,
    },
    error: null,
  };
}

/**
 * Retrieves the session AND asserts the user has one of the allowed roles.
 * Returns a 403 if the role check fails.
 *
 * Usage:
 *   const { user, error } = await requireRole(["SYS_ADMIN", "HOD"]);
 *   if (error) return error;
 */
export async function requireRole(
  allowedRoles: Role[]
): Promise<
  | { user: SessionUser; error: null }
  | { user: null; error: NextResponse }
> {
  const result = await requireAuth();
  if (result.error) return result;

  const { user } = result;

  if (!allowedRoles.includes(user.role)) {
    return {
      user: null,
      error: NextResponse.json(
        { error: "Forbidden. You do not have permission to perform this action." },
        { status: 403 }
      ),
    };
  }

  return { user, error: null };
}

/**
 * Returns true if the given role has access to the Admin panel.
 * FSD §6.3 — Admin link visible to DEPT_ADMIN, HOD, DEAN, SYS_ADMIN.
 */
export function canAccessAdmin(role: Role): boolean {
  return ["DEPT_ADMIN", "HOD", "DEAN", "SYS_ADMIN"].includes(role);
}

/**
 * Returns the roles that a given approver role is allowed to approve.
 * FSD §3.1 — five-tier role hierarchy.
 */
export function getApprovableRoles(approverRole: Role): Role[] {
  switch (approverRole) {
    case "SYS_ADMIN":
      return ["HOD", "DEAN"];
    case "HOD":
    case "DEAN":
      return ["DEPT_ADMIN"];
    case "DEPT_ADMIN":
      return ["STAFF"];
    default:
      return [];
  }
}

/**
 * Utility: build a standardised JSON error response.
 */
export function apiError(
  message: string,
  status: 400 | 401 | 403 | 404 | 409 | 500
): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Utility: build a standardised JSON success response.
 */
export function apiSuccess<T>(data: T, status: 200 | 201 = 200): NextResponse {
  return NextResponse.json(data, { status });
}
