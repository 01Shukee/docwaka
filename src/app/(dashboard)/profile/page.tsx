// src/app/(dashboard)/profile/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { IconEye, IconEyeOff, IconDeviceFloppy, IconLock } from "@tabler/icons-react";
import { Card, CardHeader, CardDivider } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input, { FormField } from "@/components/ui/Input";
import { AccountStatusBadge } from "@/components/ui/StatusBadge";
import { FullPageSpinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { ROLE_LABELS } from "@/types/user";
import type { UserProfile } from "@/types/user";

export default function ProfilePage() {
  const { success, error: toastError } = useToast();
  const [profile,  setProfile]  = useState<UserProfile | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [name,     setName]     = useState("");
  const [nameLoading, setNameLoading] = useState(false);
  const [currentPw,  setCurrentPw]  = useState("");
  const [newPw,      setNewPw]      = useState("");
  const [showCurrPw, setShowCurrPw] = useState(false);
  const [showNewPw,  setShowNewPw]  = useState(false);
  const [pwLoading,  setPwLoading]  = useState(false);
  const [pwErrors,   setPwErrors]   = useState<Record<string, string>>({});

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/profile"); const data = await res.json();
      if (res.ok) { setProfile(data.profile); setName(data.profile.name); }
    } catch { toastError("Failed to load profile."); }
    finally { setLoading(false); }
  }, [toastError]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleNameSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name.trim() === profile?.name) return;
    setNameLoading(true);
    try {
      const res = await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "name", name: name.trim() }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed.");
      setProfile(prev => prev ? { ...prev, name: data.user.name } : prev);
      success("Name updated.");
    } catch (err) { toastError(err instanceof Error ? err.message : "Failed."); }
    finally { setNameLoading(false); }
  };

  const validatePw = () => {
    const errs: Record<string, string> = {};
    if (!currentPw) errs.currentPw = "Current password is required.";
    if (newPw.length < 8) errs.newPw = "At least 8 characters.";
    else if (!/[A-Z]/.test(newPw)) errs.newPw = "Must include an uppercase letter.";
    else if (!/[0-9]/.test(newPw)) errs.newPw = "Must include a number.";
    else if (!/[^A-Za-z0-9]/.test(newPw)) errs.newPw = "Must include a special character.";
    if (newPw && newPw === currentPw) errs.newPw = "New password must differ.";
    return errs;
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validatePw(); if (Object.keys(errs).length > 0) { setPwErrors(errs); return; }
    setPwErrors({}); setPwLoading(true);
    try {
      const res = await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "password", currentPassword: currentPw, newPassword: newPw }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed.");
      setCurrentPw(""); setNewPw(""); success("Password changed.");
    } catch (err) { toastError(err instanceof Error ? err.message : "Failed."); }
    finally { setPwLoading(false); }
  };

  if (loading) return <FullPageSpinner label="Loading profile…" />;
  if (!profile) return <div className="py-16 text-center text-[14px] text-secondary">Profile not found.</div>;

  const initials = profile.name.split(" ").slice(0,2).map(n=>n[0]).join("").toUpperCase();
  const memberSince = new Date(profile.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-4 sm:gap-6">

      {/* Overview */}
      <Card padding="md">
        <div className="flex items-start gap-3 sm:gap-5 flex-wrap sm:flex-nowrap">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary text-neutral flex items-center justify-center shrink-0 text-[16px] sm:text-[18px] font-semibold">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <h1 className="text-[18px] sm:text-[20px] font-semibold leading-tight text-on-surface">{profile.name}</h1>
                <p className="text-[13px] leading-5 text-secondary mt-0.5">{profile.email}</p>
              </div>
              <AccountStatusBadge status={profile.status} />
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-2.5">
              <MetaItem label="Role"         value={ROLE_LABELS[profile.role]} />
              <MetaItem label="Department"   value={profile.department.name}   />
              <MetaItem label="Member since" value={memberSince}               />
              {profile.approvedBy && <MetaItem label="Approved by" value={profile.approvedBy.name} />}
            </dl>
          </div>
        </div>
        <CardDivider />
        <div className="grid grid-cols-2 gap-3">
          {[
            { n: profile._count.sentDocuments,     l: "Documents sent"     },
            { n: profile._count.receivedDocuments,  l: "Documents received" },
          ].map(s => (
            <div key={s.l} className="text-center py-3 px-4 bg-surface rounded-md border border-tertiary">
              <p className="text-[28px] sm:text-[32px] font-normal leading-none tracking-tight text-on-surface">{s.n}</p>
              <p className="text-[11px] sm:text-[12px] text-secondary mt-1">{s.l}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Update name */}
      <Card padding="md">
        <CardHeader title="Display name" subtitle="Update the name shown throughout docwaka." />
        <form onSubmit={handleNameSave} noValidate>
          <FormField label="Full name" htmlFor="fullName" required>
            <Input id="fullName" type="text" value={name}
              onChange={e => setName(e.target.value)} placeholder="Your full name"
              disabled={nameLoading} autoComplete="name" />
          </FormField>
          <div className="mt-4 flex justify-end">
            <Button type="submit" variant="primary" size="md" loading={nameLoading}
              disabled={!name.trim() || name.trim() === profile.name}
              leftIcon={<IconDeviceFloppy stroke={1.5} size={14} />}>
              Save name
            </Button>
          </div>
        </form>
      </Card>

      {/* Change password */}
      <Card padding="md">
        <CardHeader title="Change password" subtitle="You must enter your current password to set a new one." />
        <form onSubmit={handlePasswordSave} noValidate className="flex flex-col gap-3 sm:gap-4">
          <FormField label="Current password" htmlFor="currPw" required error={pwErrors.currentPw}>
            <div className="relative">
              <Input id="currPw" type={showCurrPw ? "text" : "password"} placeholder="Current password"
                value={currentPw} onChange={e => { setCurrentPw(e.target.value); setPwErrors(p => ({ ...p, currentPw: "" })); }}
                disabled={pwLoading} error={!!pwErrors.currentPw} className="pr-11" autoComplete="current-password" />
              <button type="button" onClick={() => setShowCurrPw(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface transition-colors">
                {showCurrPw ? <IconEyeOff stroke={1.5} size={15} /> : <IconEye stroke={1.5} size={15} />}
              </button>
            </div>
          </FormField>
          <FormField label="New password" htmlFor="newPw" required error={pwErrors.newPw}
            hint={!pwErrors.newPw ? "Min. 8 chars · uppercase · number · special character." : undefined}>
            <div className="relative">
              <Input id="newPw" type={showNewPw ? "text" : "password"} placeholder="New password"
                value={newPw} onChange={e => { setNewPw(e.target.value); setPwErrors(p => ({ ...p, newPw: "" })); }}
                disabled={pwLoading} error={!!pwErrors.newPw} className="pr-11" autoComplete="new-password" />
              <button type="button" onClick={() => setShowNewPw(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface transition-colors">
                {showNewPw ? <IconEyeOff stroke={1.5} size={15} /> : <IconEye stroke={1.5} size={15} />}
              </button>
            </div>
          </FormField>
          <div className="flex justify-end">
            <Button type="submit" variant="primary" size="md" loading={pwLoading}
              disabled={!currentPw || !newPw} leftIcon={<IconLock stroke={1.5} size={14} />}>
              Change password
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] text-secondary font-semibold uppercase tracking-[0.06em]">{label}</dt>
      <dd className="text-[12px] sm:text-[13px] font-medium text-on-surface mt-0.5 truncate">{value}</dd>
    </div>
  );
}
