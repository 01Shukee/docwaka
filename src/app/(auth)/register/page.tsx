// src/app/(auth)/register/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IconEye, IconEyeOff, IconUserPlus, IconCircleCheck } from "@tabler/icons-react";
import Button from "@/components/ui/Button";
import Input, { FormField, Select } from "@/components/ui/Input";
import { ROLE_LABELS, REGISTERABLE_ROLES } from "@/types/user";
import type { Department } from "@/types/user";

export default function RegisterPage() {
  const router = useRouter();
  const [departments,  setDepartments]  = useState<Department[]>([]);
  const [deptsLoading, setDeptsLoading] = useState(true);
  const [form,    setForm]    = useState({ name: "", email: "", password: "", role: "", departmentId: "" });
  const [showPw,  setShowPw]  = useState(false);
  const [errors,  setErrors]  = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError,setApiError]= useState("");

  useEffect(() => {
    fetch("/api/public/departments").then(r => r.json())
      .then(d => setDepartments(d.departments ?? []))
      .catch(() => {}).finally(() => setDeptsLoading(false));
  }, []);

  const update = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: "" }));
    setApiError("");
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (form.name.trim().length < 2)           errs.name         = "At least 2 characters.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email.";
    if (form.password.length < 8)              errs.password     = "At least 8 characters.";
    else if (!/[A-Z]/.test(form.password))     errs.password     = "Must include uppercase.";
    else if (!/[0-9]/.test(form.password))     errs.password     = "Must include a number.";
    else if (!/[^A-Za-z0-9]/.test(form.password)) errs.password  = "Must include a special character.";
    if (!form.role)         errs.role         = "Select a role.";
    if (!form.departmentId) errs.departmentId = "Select a department.";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    try {
      const res  = await fetch("/api/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) { setApiError(data.error ?? "Registration failed."); return; }
      setSuccess(true);
      setTimeout(() => router.push("/login"), 4000);
    } catch { setApiError("Network error. Please try again."); }
    finally { setLoading(false); }
  };

  if (success) {
    return (
      <div className="w-full max-w-[400px] px-2 sm:px-0">
        <div className="bg-neutral border border-tertiary rounded-xl p-6 sm:p-8 text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
            <IconCircleCheck stroke={1.5} size={22} className="text-emerald-600" />
          </div>
          <h2 className="text-[18px] sm:text-[20px] font-semibold text-on-surface mb-2">Registration submitted</h2>
          <p className="text-[13px] text-secondary mb-4">Your account is awaiting approval. Redirecting to sign in…</p>
          <Link href="/login" className="text-[13px] font-medium text-on-surface hover:underline underline-offset-2">Go to sign in →</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[440px] px-2 sm:px-0">
      <div className="mb-7 text-center">
        <h1 className="text-[24px] sm:text-[26px] font-normal leading-tight text-on-surface">Create your account</h1>
        <p className="mt-2 text-[13px] text-secondary">Your account will be reviewed before activation.</p>
      </div>

      <div className="bg-neutral border border-tertiary rounded-xl p-5 sm:p-8">
        {apiError && (
          <div role="alert" className="mb-4 px-4 py-3 rounded-md bg-red-50 border border-red-200 text-[13px] text-red-700">{apiError}</div>
        )}
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3 sm:gap-4">
          <FormField label="Full name" htmlFor="name" required error={errors.name}>
            <Input id="name" type="text" autoComplete="name" placeholder="Dr. Chukwuemeka Obi"
              value={form.name} onChange={e => update("name", e.target.value)} disabled={loading} error={!!errors.name} />
          </FormField>
          <FormField label="Email address" htmlFor="email" required error={errors.email}>
            <Input id="email" type="email" autoComplete="email" placeholder="you@futo.edu.ng"
              value={form.email} onChange={e => update("email", e.target.value)} disabled={loading} error={!!errors.email} />
          </FormField>
          <FormField label="Password" htmlFor="password" required error={errors.password}
            hint={!errors.password ? "Min. 8 chars · uppercase · number · special character." : undefined}>
            <div className="relative">
              <Input id="password" type={showPw ? "text" : "password"} autoComplete="new-password"
                placeholder="Create a strong password" value={form.password}
                onChange={e => update("password", e.target.value)} disabled={loading} error={!!errors.password} className="pr-11" />
              <button type="button" onClick={() => setShowPw(v => !v)} aria-label={showPw ? "Hide" : "Show"}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface transition-colors">
                {showPw ? <IconEyeOff stroke={1.5} size={15} /> : <IconEye stroke={1.5} size={15} />}
              </button>
            </div>
          </FormField>
          {/* Role + Department — side by side on sm+ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Role" htmlFor="role" required error={errors.role}>
              <Select id="role" value={form.role} onChange={e => update("role", e.target.value)} disabled={loading} error={!!errors.role}>
                <option value="">Select role…</option>
                {REGISTERABLE_ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </Select>
            </FormField>
            <FormField label="Department" htmlFor="departmentId" required error={errors.departmentId}>
              <Select id="departmentId" value={form.departmentId} onChange={e => update("departmentId", e.target.value)} disabled={loading || deptsLoading} error={!!errors.departmentId}>
                <option value="">{deptsLoading ? "Loading…" : "Select dept…"}</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </Select>
            </FormField>
          </div>
          <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}
            leftIcon={<IconUserPlus stroke={1.5} size={15} />} className="mt-1">
            Create account
          </Button>
        </form>
      </div>

      <p className="mt-5 text-center text-[13px] sm:text-[14px] text-secondary">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-on-surface hover:underline underline-offset-2">Sign in</Link>
      </p>
    </div>
  );
}
