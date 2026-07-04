// src/app/page.tsx

import { redirect } from "next/navigation";

/**
 * Root path (/) redirects to /dashboard as specified in FSD §4.1.
 * Middleware will then redirect unauthenticated users from /dashboard to /login.
 */
export default function RootPage() {
  redirect("/dashboard");
}
