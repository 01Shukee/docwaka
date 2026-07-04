// src/lib/auth.ts

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { Role } from "@/types/user";

/**
 * NextAuth v5 configuration.
 *
 * Strategy: JWT (no database adapter) — role and user ID are encoded directly
 * into the token so every API route can read them without an extra DB query.
 *
 * FSD §4.1 / §5.5 — Authentication flow:
 *   1. Credentials provider fetches user by email.
 *   2. AccountStatus checked — PENDING / REJECTED produce specific errors.
 *   3. Password compared with bcrypt.
 *   4. JWT created with id, name, email, role.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge:   30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: "/login",
    error:  "/login",
  },

  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        const email    = credentials?.email    as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!email || !password) {
          throw new Error("EMAIL_PASSWORD_REQUIRED");
        }

        const user = await prisma.user.findUnique({
          where:  { email: email.toLowerCase().trim() },
          select: {
            id:       true,
            name:     true,
            email:    true,
            password: true,
            role:     true,
            status:   true,
          },
        });

        if (!user) {
          // Generic message — don't reveal whether the email exists
          throw new Error("INVALID_CREDENTIALS");
        }

        // FSD §3.3 — Users cannot log in until their account is APPROVED
        if (user.status === "PENDING") {
          throw new Error("ACCOUNT_PENDING");
        }

        if (user.status === "REJECTED") {
          throw new Error("ACCOUNT_REJECTED");
        }

        const passwordMatch = await compare(password, user.password);
        if (!passwordMatch) {
          throw new Error("INVALID_CREDENTIALS");
        }

        return {
          id:    user.id,
          name:  user.name,
          email: user.email,
          role:  user.role as Role,
        };
      },
    }),
  ],

  callbacks: {
    /**
     * Called when a JWT is created (sign in) or read (subsequent requests).
     * We persist role and id into the token so session() can forward them.
     */
    async jwt({ token, user }) {
      if (user) {
        token.id    = user.id;
        token.role  = (user as { role: Role }).role;
        token.name  = user.name!;
        token.email = user.email!;
      }
      return token;
    },

    /**
     * Called whenever a session is checked (useSession, auth(), getServerSession).
     * We expose id and role on the session.user object.
     */
    async session({ session, token }) {
      if (token) {
        session.user.id    = token.id    as string;
        session.user.role  = token.role  as Role;
        session.user.name  = token.name  as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
});
