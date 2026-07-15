// src/app/(auth)/login/page.tsx
"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { IconEye, IconEyeOff, IconLogin } from "@tabler/icons-react";
import Button from "@/components/ui/Button";
import Input, { FormField } from "@/components/ui/Input";

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS:     "Incorrect email or password.",
  ACCOUNT_PENDING:         "Your account is awaiting approval.",
  ACCOUNT_REJECTED:        "Your account was not approved. Contact your administrator.",
  EMAIL_PASSWORD_REQUIRED: "Please enter your email and password.",
  CredentialsSignin:       "Incorrect email or password.",
};

function LoginContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl  = searchParams.get("callbackUrl") ?? "/dashboard";
  const urlError     = searchParams.get("error");

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(
    urlError ? (ERROR_MESSAGES[urlError] ?? "Sign in failed.") : ""
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) { setError("Please enter your email and password."); return; }
    setLoading(true);
    const result = await signIn("credentials", { email: email.toLowerCase().trim(), password, redirect: false });
    setLoading(false);
    if (!result?.ok) {
      setError(ERROR_MESSAGES[result?.error ?? ""] ?? "Sign in failed.");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <div className="w-full max-w-[400px] px-2 sm:px-0">
      {/* Heading */}
      <div className="mb-7 text-center">
        <h1 className="text-[24px] sm:text-[26px] font-normal leading-tight text-on-surface">
          Sign in to docwaka.
        </h1>
        <p className="mt-2 text-[13px] sm:text-[14px] leading-5 text-secondary">
          Federal University of Technology Owerri
        </p>
      </div>

      {/* Card */}
      <div className="bg-neutral border border-tertiary rounded-xl p-6 sm:p-8">
        {error && (
          <div role="alert" className="mb-5 px-4 py-3 rounded-md bg-red-50 border border-red-200 text-[13px] leading-5 text-red-700">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <FormField label="Email address" htmlFor="email" required>
            <Input id="email" type="email" autoComplete="email" placeholder="you@futo.edu.ng"
              value={email} onChange={e => setEmail(e.target.value)} disabled={loading} />
          </FormField>
          <FormField label="Password" htmlFor="password" required>
            <div className="relative">
              <Input id="password" type={showPw ? "text" : "password"} autoComplete="current-password"
                placeholder="Enter your password" value={password}
                onChange={e => setPassword(e.target.value)} disabled={loading} className="pr-11" />
              <button type="button" onClick={() => setShowPw(v => !v)} aria-label={showPw ? "Hide" : "Show"}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface transition-colors">
                {showPw ? <IconEyeOff stroke={1.5} size={15} /> : <IconEye stroke={1.5} size={15} />}
              </button>
            </div>
          </FormField>
          <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}
            leftIcon={<IconLogin stroke={1.5} size={15} />} className="mt-1">
            Sign in
          </Button>
        </form>
      </div>

      <p className="mt-5 text-center text-[13px] sm:text-[14px] text-secondary">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-on-surface hover:underline underline-offset-2">Register</Link>
      </p>
    </div>
  );
}


export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-8">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}