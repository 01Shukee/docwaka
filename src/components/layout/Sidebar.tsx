// src/components/layout/Sidebar.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  IconLayoutDashboard, IconInbox, IconFilePlus,
  IconClipboardList, IconShieldCheck, IconUser,
  IconLogout, IconX,
} from "@tabler/icons-react";
import SidebarLink from "./SidebarLink";
import { ROLE_LABELS } from "@/types/user";
import type { Role } from "@/types/user";

interface SidebarProps {
  userName:    string;
  userRole:    Role;
  userEmail:   string;
  inboxCount?: number;
  open:        boolean;
  onClose:     () => void;
}

const ADMIN_ROLES: Role[] = ["SYS_ADMIN", "HOD", "DEAN", "DEPT_ADMIN"];
const AUDIT_ROLES: Role[] = ["SYS_ADMIN", "HOD", "DEAN", "DEPT_ADMIN"];

const ROLE_ACCENTS: Record<Role, string> = {
  SYS_ADMIN:  "bg-[#EEF2FF] text-[#4338CA]",
  HOD:        "bg-[#EFF6FF] text-[#1D4ED8]",
  DEAN:       "bg-[#EFF6FF] text-[#1D4ED8]",
  DEPT_ADMIN: "bg-[#ECFDF5] text-[#047857]",
  STAFF:      "bg-[#F7F7F7] text-[#141414]",
};

export default function Sidebar({
  userName, userRole, inboxCount = 0, open, onClose,
}: SidebarProps) {
  const showAdmin = ADMIN_ROLES.includes(userRole);
  const showAudit = AUDIT_ROLES.includes(userRole);
  const initials  = userName.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
  const accent    = ROLE_ACCENTS[userRole];

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-primary/30 backdrop-blur-[2px] lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={[
        "fixed inset-y-0 left-0 z-40 flex flex-col",
        "w-[240px] bg-neutral border-r border-tertiary overflow-y-auto",
        "transition-transform duration-200 ease-in-out",
        open ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0",
      ].join(" ")}>

        {/* ── Logo ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-tertiary shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2.5" onClick={onClose}>
            {/* Stickman logo */}
            <div className="w-8 h-8 rounded-md overflow-hidden shrink-0 flex items-center justify-center bg-white border border-tertiary">
              <Image
                src="/logo.jpg"
                alt="docwaka logo"
                width={28}
                height={28}
                className="object-contain"
                priority
              />
            </div>
            {/* Wordmark */}
            <span className="text-[17px] font-black leading-none text-on-surface tracking-tight" style={{ letterSpacing: "-0.5px" }}>
              docwaka<span className="text-[#3B82F6]">.</span>
            </span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-secondary hover:text-on-surface rounded-md hover:bg-surface transition-colors"
            aria-label="Close navigation"
          >
            <IconX size={16} stroke={1.5} />
          </button>
        </div>

        {/* ── Nav ──────────────────────────────────────────────────── */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5" aria-label="Main navigation">
          <SidebarLink href="/dashboard"     label="Dashboard"    icon={IconLayoutDashboard} exact onClick={onClose} />
          <SidebarLink href="/documents"     label="Documents"    icon={IconInbox}           badge={inboxCount} onClick={onClose} />
          <SidebarLink href="/documents/new" label="New Document" icon={IconFilePlus}        exact onClick={onClose} />

          {(showAudit || showAdmin) && <div className="my-2 border-t border-tertiary" />}

          {showAudit && (
            <SidebarLink href="/audit" label="Audit Log" icon={IconClipboardList}
              onClick={onClose} accentClass="hover:text-[#4338CA]" />
          )}
          {showAdmin && (
            <SidebarLink href="/admin" label="Admin" icon={IconShieldCheck}
              onClick={onClose} accentClass="hover:text-[#047857]" />
          )}
        </nav>

        {/* ── User footer ───────────────────────────────────────────── */}
        <div className="shrink-0 border-t border-tertiary px-3 py-3">
          <Link href="/profile" onClick={onClose}
            className="flex items-center gap-2.5 px-2 py-2 rounded-md hover:bg-surface transition-colors group">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold ${accent}`}>
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium leading-4 text-on-surface truncate">{userName}</p>
              <p className="text-[11px] leading-4 text-secondary truncate">{ROLE_LABELS[userRole]}</p>
            </div>
            <IconUser size={14} stroke={1.5} className="shrink-0 text-secondary group-hover:text-on-surface" />
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-2.5 px-2 py-2 mt-0.5 rounded-md text-[13px] font-medium text-secondary hover:bg-surface hover:text-on-surface transition-colors focus-visible:outline-none"
          >
            <IconLogout size={14} stroke={1.5} className="shrink-0" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}