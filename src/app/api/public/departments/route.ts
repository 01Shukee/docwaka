// src/app/api/public/departments/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/public/departments
 *
 * Public endpoint — no auth required.
 * Returns id + name only, used exclusively by the registration form
 * so new users can select their department before they have an account.
 */
export async function GET(): Promise<NextResponse> {
  try {
    const departments = await prisma.department.findMany({
      select:  { id: true, name: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ departments });
  } catch (err) {
    console.error("[GET /api/public/departments]", err);
    return NextResponse.json({ departments: [] }, { status: 500 });
  }
}