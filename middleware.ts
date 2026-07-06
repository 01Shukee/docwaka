// middleware.ts

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const PUBLIC_PATHS     = ["/", "/login", "/register"];
const AUTH_ONLY_PATHS  = ["/login", "/register", "/"];

// API routes that must be accessible without a session
const PUBLIC_API_PREFIXES = [
  "/api/auth",
  "/api/uploadthing",
  "/api/public",       // ← covers /api/public/departments and any future public routes
    "/api/upload",
];

export default auth((req) => {
  const { pathname }    = req.nextUrl;
  const isAuthenticated = !!req.auth?.user?.id;

  // ── Always pass through: Next.js internals, static assets, public APIs ──
  if (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/fonts") ||
    pathname.startsWith("/logo") ||
    PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p))
  ) {
    return NextResponse.next();
  }

  // ── Signed-in user hitting /login or /register → go to dashboard ────────
  if (isAuthenticated && AUTH_ONLY_PATHS.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // ── Unauthenticated user hitting a protected route → go to /login ───────
  if (!isAuthenticated && !PUBLIC_PATHS.includes(pathname)) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?|ttf|otf|eot|ico|css|js)$).*)",
  ],
};