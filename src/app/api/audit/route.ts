// src/app/api/audit/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, apiError } from "@/lib/auth-helpers";

/**
 * GET /api/audit
 *
 * FSD §4.9 — Returns audit log entries scoped by role:
 *   SYS_ADMIN              → all events system-wide
 *   DEPT_ADMIN / HOD / DEAN → events within their department
 *   STAFF                  → only events on their own documents
 *
 * Query params:
 *   ?search=<string>  — filter by document title, user name, or action
 *   ?page=<number>    — 1-based page number (default: 1)
 *   ?limit=<number>   — records per page (default: 50, max: 100)
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const { searchParams } = req.nextUrl;
    const search = searchParams.get("search")?.trim() ?? "";
    const page   = Math.max(1, parseInt(searchParams.get("page")  ?? "1",  10));
    const limit  = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "50", 10)));
    const skip   = (page - 1) * limit;

    // Fetch the admin user record to get departmentId for scoping
    const fullUser = await prisma.user.findUnique({
      where:  { id: user.id },
      select: { departmentId: true },
    });
    if (!fullUser) return apiError("User not found.", 404);

    // ── Build role-scoped where clause (FSD §4.9) ─────────────────────────────
    let documentFilter: object = {};

    if (user.role === "SYS_ADMIN") {
      // Sees everything — no filter
      documentFilter = {};
    } else if (["HOD", "DEAN", "DEPT_ADMIN"].includes(user.role)) {
      // Scoped to their department's documents
      documentFilter = {
        document: {
          OR: [
            { sender:    { departmentId: fullUser.departmentId } },
            { recipient: { departmentId: fullUser.departmentId } },
          ],
        },
      };
    } else {
      // STAFF — only their own documents
      documentFilter = {
        document: {
          OR: [{ senderId: user.id }, { recipientId: user.id }],
        },
      };
    }

    // ── Search filter ─────────────────────────────────────────────────────────
    const searchFilter = search
      ? {
          OR: [
            { document: { title: { contains: search, mode: "insensitive" as const } } },
            { user:     { name:  { contains: search, mode: "insensitive" as const } } },
            { action:   { equals: search.toUpperCase() as any } },
          ],
        }
      : {};

    const where = { AND: [documentFilter, searchFilter] };

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          document: { select: { id: true, title: true } },
          user:     { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("[GET /api/audit]", err);
    return apiError("Failed to fetch audit logs.", 500);
  }
}
