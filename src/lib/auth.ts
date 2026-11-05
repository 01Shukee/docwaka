// src/lib/auth.ts

import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/bcrypt";
import { authConfig } from "@/lib/auth.config";
import type { Role } from "@/types/user";

// Custom error codes surfaced to the client as `result.code` (NextAuth v5).
class InvalidCredentials extends CredentialsSignin { code = "INVALID_CREDENTIALS"; }
class AccountPending     extends CredentialsSignin { code = "ACCOUNT_PENDING"; }
class AccountRejected    extends CredentialsSignin { code = "ACCOUNT_REJECTED"; }
class EmailPasswordRequired extends CredentialsSignin { code = "EMAIL_PASSWORD_REQUIRED"; }

/** How often (ms) an active session is re-validated against the database. */
const RECHECK_MS = 5 * 60 * 1000;

// Compared against when the email is unknown, so response time doesn't reveal
// whether an account exists.
let dummyHash: Promise<string> | null = null;

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email    = typeof credentials?.email    === "string" ? credentials.email    : "";
        const password = typeof credentials?.password === "string" ? credentials.password : "";
        if (!email || !password) throw new EmailPasswordRequired();

        const user = await prisma.user.findUnique({
          where:  { email: email.toLowerCase().trim() },
          select: { id: true, name: true, email: true, password: true, role: true, status: true, departmentId: true },
        });

        if (!user) {
          dummyHash ??= hashPassword("dummy-password-for-timing");
          await verifyPassword(password, await dummyHash);
          throw new InvalidCredentials();
        }

        // Check the password BEFORE revealing account status, otherwise anyone
        // could probe which emails are pending/rejected without a password.
        if (!(await verifyPassword(password, user.password))) throw new InvalidCredentials();
        if (user.status === "PENDING")  throw new AccountPending();
        if (user.status === "REJECTED") throw new AccountRejected();

        return {
          id: user.id, name: user.name, email: user.email,
          role: user.role as Role, departmentId: user.departmentId,
        };
      },
    }),
  ],

  callbacks: {
    ...authConfig.callbacks,

    async jwt({ token, user, trigger }) {
      // Sign-in
      if (user) {
        token.id           = user.id!;
        token.role         = user.role;
        token.name         = user.name!;
        token.email        = user.email!;
        token.departmentId = user.departmentId;
        token.checkedAt    = Date.now();
        return token;
      }

      // Periodically re-validate so revoked / rejected / re-roled users lose
      // access within minutes instead of staying signed in for 30 days.
      const stale = trigger === "update" || Date.now() - (token.checkedAt ?? 0) > RECHECK_MS;
      if (stale) {
        const fresh = await prisma.user.findUnique({
          where:  { id: token.id },
          select: { name: true, email: true, role: true, status: true, departmentId: true },
        });
        if (!fresh || fresh.status !== "APPROVED") return null; // invalidates the session
        token.name         = fresh.name;
        token.email        = fresh.email;
        token.role         = fresh.role as Role;
        token.departmentId = fresh.departmentId;
        token.checkedAt    = Date.now();
      }
      return token;
    },
  },
});
