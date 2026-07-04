// src/components/layout/Sidebar.tsx

"use client";

import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Inbox,
  FilePlus2,
  ClipboardList,
  ShieldCheck,
  User,
  LogOut,
} from "lucide-react";
import SidebarLink from "./SidebarLink";
import { ROLE_LABELS } from "@/types/user";
import type { Role } from "@/types/user";

interface SidebarProps {
  userName:     string;
  userRole:     Role;
  userEmail:    string;
  inboxCount?:  number;
}

/**
 * DESIGN.md layout:
 *   - Fixed 240px sidebar, white background, right border tertiary (#E5E7EB)
 *   - Logo at top, nav links in middle, user profile at bottom
 *   - Broad left margin, clean alignment — curated not dashboard-like
 *
 * Role-scoped nav:
 *   All roles        → Dashboard, Documents (Inbox/Outbox), New Document, Profile
 *   DEPT_ADMIN+      → Admin
 *   SYS_ADMIN        → Audit Log (system-wide)
 *   DEPT_ADMIN/HOD/DEAN → Audit Log (dept-scoped)
 */

const ADMIN_ROLES: Role[] = ["SYS_ADMIN", "HOD", "DEAN", "DEPT_ADMIN"];
const AUDIT_ROLES: Role[] = ["SYS_ADMIN", "HOD", "DEAN", "DEPT_ADMIN"];

export default function Sidebar({
  userName,
  userRole,
  userEmail,
  inboxCount = 0,
}: SidebarProps) {
  const showAdmin = ADMIN_ROLES.includes(userRole);
  const showAudit = AUDIT_ROLES.includes(userRole);

  // User initials for avatar
  const initials = userName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <aside
      className={[
        "fixed inset-y-0 left-0 z-40",
        "w-[240px] flex flex-col",
        "bg-neutral border-r border-tertiary",
        "overflow-y-auto",
      ].join(" ")}
    >
      {/* ── Logo ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-tertiary shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <Image
            src="/logo.svg"
            alt="DocWaka"
            width={28}
            height={28}
            priority
          />
          <span className="text-[16px] font-semibold leading-5 text-on-surface tracking-tight">
            DocWaka
          </span>
        </Link>
      </div>

      {/* ── Navigation ───────────────────────────────────────────────────── */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5" aria-label="Main navigation">

        {/* Core */}
        <SidebarLink
          href="/dashboard"
          label="Dashboard"
          icon={LayoutDashboard}
          exact
        />
        <SidebarLink
          href="/documents"
          label="Documents"
          icon={Inbox}
          badge={inboxCount}
        />
        <SidebarLink
          href="/documents/new"
          label="New Document"
          icon={FilePlus2}
          exact
        />

        {/* Section divider */}
        {(showAudit || showAdmin) && (
          <div className="my-2 border-t border-tertiary" />
        )}

        {/* Audit — dept-scoped or system-wide */}
        {showAudit && (
          <SidebarLink
            href="/audit"
            label="Audit Log"
            icon={ClipboardList}
          />
        )}

        {/* Admin panel */}
        {showAdmin && (
          <SidebarLink
            href="/admin"
            label="Admin"
            icon={ShieldCheck}
          />
        )}
      </nav>

      {/* ── User footer ──────────────────────────────────────────────────── */}
      <div className="shrink-0 border-t border-tertiary px-3 py-3">
        {/* Profile link */}
        <Link
          href="/profile"
          className="flex items-center gap-2.5 px-2 py-2 rounded-md hover:bg-surface transition-colors duration-100 group"
        >
          {/* Avatar */}
          <div className="w-7 h-7 rounded-full bg-primary text-neutral flex items-center justify-center shrink-0">
            <span className="text-[11px] font-semibold leading-none">{initials}</span>
          </div>

          {/* Name + role */}
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium leading-4 text-on-surface truncate">
              {userName}
            </p>
            <p className="text-[11px] leading-4 text-secondary truncate">
              {ROLE_LABELS[userRole]}
            </p>
          </div>

          <User size={14} className="shrink-0 text-secondary group-hover:text-on-surface" />
        </Link>

        {/* Sign out */}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className={[
            "w-full flex items-center gap-2.5 px-2 py-2 mt-0.5 rounded-md",
            "text-[13px] font-medium text-secondary",
            "hover:bg-surface hover:text-on-surface transition-colors duration-100",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          ].join(" ")}
        >
          <LogOut size={14} className="shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
