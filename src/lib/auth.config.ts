// src/lib/auth.config.ts
// Edge-safe NextAuth config: NO prisma / bcrypt imports here, so middleware can use it.

import type { NextAuthConfig } from "next-auth";
import type { Role } from "@/types/user";

export const authConfig = {
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login", error: "/login" },
  providers: [], // real providers are added in auth.ts
  callbacks: {
    async session({ session, token }) {
      if (token?.id) {
        session.user.id           = token.id as string;
        session.user.role         = token.role as Role;
        session.user.name         = token.name as string;
        session.user.email        = token.email as string;
        session.user.departmentId = token.departmentId as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
