// src/app/(dashboard)/profile/page.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import { Eye, EyeOff, Save, Lock } from "lucide-react";
import { Card, CardHeader, CardDivider } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input, { FormField } from "@/components/ui/Input";
import { AccountStatusBadge } from "@/components/ui/StatusBadge";
import { FullPageSpinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { ROLE_LABELS } from "@/types/user";
import type { UserProfile } from "@/types/user";

/**
 * FSD §4.11 — Profile page.
 *
 * Sections:
 *   1. Profile overview — avatar, name, role, dept, status, doc stats
 *   2. Update display name
 *   3. Change password (requires current password — FSD §4.11)
 *
 * DESIGN.md: max-w-2xl card stack, spacious sections, pill inputs,
 * primary pill CTAs, secondary text for labels.
 */
export default function ProfilePage() {
  const { success, error: toastError } = useToast();

  const [profile,  setProfile]  = useState<UserProfile | null>(null);
  const [loading,  setLoading]  = useState(true);

  // ── Name form state ───────────────────────────────────────────────────────
  const [name,        setName]        = useState("");
  const [nameLoading, setNameLoading] = useState(false);

  // ── Password form state ───────────────────────────────────────────────────
  const [currentPw,  setCurrentPw]  = useState("");
  const [newPw,      setNewPw]      = useState("");
  const [showCurrPw, setShowCurrPw] = useState(false);
  const [showNewPw,  setShowNewPw]  = useState(false);
  const [pwLoading,  setPwLoading]  = useState(false);
  const [pwErrors,   setPwErrors]   = useState<Record<string, string>>({});

  // ── Fetch profile ─────────────────────────────────────────────────────────
  const fetchProfile = useCallback(async () => {
    try {
      const res  = await fetch("/api/profile");
      const data = await res.json();
      if (res.ok) {
        setProfile(data.profile);
        setName(data.profile.name);
      }
    } catch {
      toastError("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  // ── Update name ───────────────────────────────────────────────────────────
  const handleNameSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name.trim() === profile?.name) return;
    setNameLoading(true);
    try {
      const res  = await fetch("/api/profile", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ type: "name", name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update name.");
      setProfile((prev) => prev ? { ...prev, name: data.user.name } : prev);
      success("Name updated successfully.");
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Failed to update name.");
    } finally {
      setNameLoading(false);
    }
  };

  // ── Change password ───────────────────────────────────────────────────────
  const validatePassword = () => {
    const errs: Record<string, string> = {};
    if (!currentPw)
      errs.currentPw = "Current password is required.";
    if (newPw.length < 8)
      errs.newPw = "New password must be at least 8 characters.";
    else if (!/[A-Z]/.test(newPw))
      errs.newPw = "Must contain at least one uppercase letter.";
    else if (!/[0-9]/.test(newPw))
      errs.newPw = "Must contain at least one number.";
    else if (!/[^A-Za-z0-9]/.test(newPw))
      errs.newPw = "Must contain at least one special character.";
    if (newPw && newPw === currentPw)
      errs.newPw = "New password must differ from your current password.";
    return errs;
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validatePassword();
    if (Object.keys(errs).length > 0) { setPwErrors(errs); return; }
    setPwErrors({});
    setPwLoading(true);
    try {
      const res  = await fetch("/api/profile", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          type:            "password",
          currentPassword: currentPw,
          newPassword:     newPw,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to change password.");
      setCurrentPw("");
      setNewPw("");
      success("Password changed successfully.");
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Failed to change password.");
    } finally {
      setPwLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) return <FullPageSpinner label="Loading profile…" />;
  if (!profile) return (
    <div className="py-16 text-center text-[14px] text-secondary">
      Profile not found.
    </div>
  );

  const initials = profile.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const memberSince = new Date(profile.createdAt).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="max-w-2xl flex flex-col gap-6">

      {/* ── 1. Overview card ─────────────────────────────────────────── */}
      <Card padding="lg">
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-full bg-primary text-neutral flex items-center justify-center shrink-0 select-none">
            <span className="text-[18px] font-semibold leading-none">
              {initials}
            </span>
          </div>

          {/* Name + email + status */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h1 className="text-[20px] font-semibold leading-7 text-on-surface">
                  {profile.name}
                </h1>
                <p className="text-[14px] leading-5 text-secondary mt-0.5">
                  {profile.email}
                </p>
              </div>
              <AccountStatusBadge status={profile.status} />
            </div>

            {/* Meta grid */}
            <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3">
              <MetaItem label="Role"         value={ROLE_LABELS[profile.role]} />
              <MetaItem label="Department"   value={profile.department.name}   />
              <MetaItem label="Member since" value={memberSince}               />
              {profile.approvedBy && (
                <MetaItem label="Approved by" value={profile.approvedBy.name} />
              )}
            </dl>
          </div>
        </div>

        <CardDivider />

        {/* Document stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center py-3 px-4 bg-surface rounded-md border border-tertiary">
            <p className="text-[26px] font-normal leading-8 text-on-surface">
              {profile._count.sentDocuments}
            </p>
            <p className="text-[12px] text-secondary mt-0.5">Documents sent</p>
          </div>
          <div className="text-center py-3 px-4 bg-surface rounded-md border border-tertiary">
            <p className="text-[26px] font-normal leading-8 text-on-surface">
              {profile._count.receivedDocuments}
            </p>
            <p className="text-[12px] text-secondary mt-0.5">Documents received</p>
          </div>
        </div>
      </Card>

      {/* ── 2. Update name ───────────────────────────────────────────── */}
      <Card padding="lg">
        <CardHeader
          title="Display name"
          subtitle="Update the name shown throughout DocWaka."
        />
        <form onSubmit={handleNameSave} noValidate>
          <FormField label="Full name" htmlFor="fullName" required>
            <Input
              id="fullName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              disabled={nameLoading}
              autoComplete="name"
            />
          </FormField>
          <div className="mt-4 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={nameLoading}
              disabled={!name.trim() || name.trim() === profile.name}
              leftIcon={<Save size={14} />}
            >
              Save name
            </Button>
          </div>
        </form>
      </Card>

      {/* ── 3. Change password ───────────────────────────────────────── */}
      <Card padding="lg">
        <CardHeader
          title="Change password"
          subtitle="You must enter your current password to set a new one."
        />
        <form onSubmit={handlePasswordSave} noValidate className="flex flex-col gap-4">

          {/* Current password */}
          <FormField
            label="Current password"
            htmlFor="currentPw"
            required
            error={pwErrors.currentPw}
          >
            <div className="relative">
              <Input
                id="currentPw"
                type={showCurrPw ? "text" : "password"}
                placeholder="Enter your current password"
                value={currentPw}
                onChange={(e) => {
                  setCurrentPw(e.target.value);
                  setPwErrors((p) => ({ ...p, currentPw: "" }));
                }}
                disabled={pwLoading}
                error={!!pwErrors.currentPw}
                autoComplete="current-password"
                className="pr-11"
              />
              <button
                type="button"
                onClick={() => setShowCurrPw((v) => !v)}
                aria-label={showCurrPw ? "Hide password" : "Show password"}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface transition-colors"
              >
                {showCurrPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </FormField>

          {/* New password */}
          <FormField
            label="New password"
            htmlFor="newPw"
            required
            error={pwErrors.newPw}
            hint={
              !pwErrors.newPw
                ? "Min. 8 chars · one uppercase · one number · one special character."
                : undefined
            }
          >
            <div className="relative">
              <Input
                id="newPw"
                type={showNewPw ? "text" : "password"}
                placeholder="Create a new strong password"
                value={newPw}
                onChange={(e) => {
                  setNewPw(e.target.value);
                  setPwErrors((p) => ({ ...p, newPw: "" }));
                }}
                disabled={pwLoading}
                error={!!pwErrors.newPw}
                autoComplete="new-password"
                className="pr-11"
              />
              <button
                type="button"
                onClick={() => setShowNewPw((v) => !v)}
                aria-label={showNewPw ? "Hide password" : "Show password"}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface transition-colors"
              >
                {showNewPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </FormField>

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={pwLoading}
              disabled={!currentPw || !newPw}
              leftIcon={<Lock size={14} />}
            >
              Change password
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

// ── MetaItem ──────────────────────────────────────────────────────────────────

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] text-secondary font-medium uppercase tracking-[0.04em]">
        {label}
      </dt>
      <dd className="text-[13px] font-medium text-on-surface mt-0.5 truncate">
        {value}
      </dd>
    </div>
  );
}
