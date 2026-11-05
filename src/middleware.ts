// src/middleware.ts  (must live in src/ because the app uses the src directory)

import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

const PUBLIC_PATHS    = ["/", "/login", "/register"];
const AUTH_ONLY_PATHS = ["/login", "/register", "/"];

// Reachable without a session. /api/upload is NOT here: it requires auth.
const PUBLIC_API_PREFIXES = ["/api/auth", "/api/uploadthing", "/api/public"];

export default auth((req) => {
  const { pathname, search } = req.nextUrl;
  const isAuthenticated = !!req.auth?.user?.id;

  if (PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  if (isAuthenticated && AUTH_ONLY_PATHS.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (!isAuthenticated && !PUBLIC_PATHS.includes(pathname)) {
    // API callers get JSON, not an HTML redirect they can't parse.
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorised. Please log in." }, { status: 401 });
    }
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?|ttf|otf|eot|ico|css|js)$).*)",
  ],
};
