// src/app/(auth)/login/page.tsx

"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, LogIn } from "lucide-react";
import Button from "@/components/ui/Button";
import Input, { FormField } from "@/components/ui/Input";

/**
 * FSD §4.1 / §5.5 — Login page.
 *
 * DESIGN.md:
 *   - Centered card on white background (#FFFFFF)
 *   - headline-sm title (26px / 31px)
 *   - input token: surface fill, rounded-full, 40px height
 *   - button-primary pill CTA
 *   - body-sm link text in secondary (#707070)
 */

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: "Incorrect email or password. Please try again.",
  ACCOUNT_PENDING:
    "Your account is awaiting approval. You will be notified once approved.",
  ACCOUNT_REJECTED:
    "Your account registration was not approved. Please contact your administrator.",
  EMAIL_PASSWORD_REQUIRED: "Please enter your email and password.",
  CredentialsSignin: "Incorrect email or password. Please try again.",
};

export default function LoginPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl  = searchParams.get("callbackUrl") ?? "/dashboard";

  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [showPw,      setShowPw]      = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");

  // Surface any error that NextAuth encoded in the URL (e.g. after redirect)
  const urlError = searchParams.get("error");
  const initError = urlError ? (ERROR_MESSAGES[urlError] ?? "Sign in failed. Please try again.") : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    const result = await signIn("credentials", {
      email:    email.toLowerCase().trim(),
      password,
      redirect: false,
    });

    setLoading(false);

    if (!result?.ok) {
      const errCode = result?.error ?? "INVALID_CREDENTIALS";
      setError(ERROR_MESSAGES[errCode] ?? "Sign in failed. Please try again.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  };

  const displayError = error || initError;

  return (
    <div className="w-full max-w-[400px]">
      {/* Heading */}
      <div className="mb-8 text-center">
        <h1 className="text-[26px] font-normal leading-[31px] text-on-surface">
          Sign in to DocWaka
        </h1>
        <p className="mt-2 text-[14px] leading-5 text-secondary">
          Federal University of Technology Owerri
        </p>
      </div>

      {/* Card */}
      <div className="bg-neutral border border-tertiary rounded-xl p-8">
        {/* Error banner */}
        {displayError && (
          <div
            role="alert"
            className="mb-5 px-4 py-3 rounded-md bg-red-50 border border-red-200 text-[13px] leading-5 text-red-700"
          >
            {displayError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          {/* Email */}
          <FormField label="Email address" htmlFor="email" required>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@futo.edu.ng"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </FormField>

          {/* Password */}
          <FormField label="Password" htmlFor="password" required>
            <div className="relative">
              <Input
                id="password"
                type={showPw ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                className="pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? "Hide password" : "Show password"}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface transition-colors"
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </FormField>

          {/* Submit */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            leftIcon={<LogIn size={15} />}
            className="mt-2"
          >
            Sign in
          </Button>
        </form>
      </div>

      {/* Register link */}
      <p className="mt-6 text-center text-[14px] leading-5 text-secondary">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-on-surface hover:underline underline-offset-2 transition-colors"
        >
          Register
        </Link>
      </p>
    </div>
  );
}
