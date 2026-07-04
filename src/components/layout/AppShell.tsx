// src/components/layout/AppShell.tsx

"use client";

import Sidebar from "./Sidebar";
import type { Role } from "@/types/user";

interface AppShellProps {
  children:     React.ReactNode;
  userName:     string;
  userRole:     Role;
  userEmail:    string;
  inboxCount?:  number;
  /** Page-level heading shown in the main content top bar */
  pageTitle?:   string;
  /** Optional breadcrumb or subtitle below the heading */
  pageSubtitle?: string;
  /** Optional actions rendered in the top bar (buttons, etc.) */
  pageActions?: React.ReactNode;
}

/**
 * DESIGN.md layout:
 *   - Centered, symmetrical canvas
 *   - Fixed 240px sidebar + main offset
 *   - Spacious, generous margins — "curated not dashboard-like"
 *   - Section spacing: large vertical gaps between major bands
 *   - Background (#FFFFFF), surface (#F7F7F7) for inset areas
 */
export default function AppShell({
  children,
  userName,
  userRole,
  userEmail,
  inboxCount   = 0,
  pageTitle,
  pageSubtitle,
  pageActions,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* ── Fixed sidebar ──────────────────────────────────────────────── */}
      <Sidebar
        userName={userName}
        userRole={userRole}
        userEmail={userEmail}
        inboxCount={inboxCount}
      />

      {/* ── Main content — offset by sidebar width ──────────────────────── */}
      <div className="pl-[240px] min-h-screen flex flex-col">

        {/* Page header bar */}
        {pageTitle && (
          <header className="sticky top-0 z-30 bg-neutral/80 backdrop-blur-sm border-b border-tertiary">
            <div className="max-w-5xl mx-auto px-8 py-4 flex items-center justify-between gap-4">
              <div>
                <h1 className="text-[20px] font-semibold leading-7 text-on-surface tracking-tight">
                  {pageTitle}
                </h1>
                {pageSubtitle && (
                  <p className="text-[14px] leading-5 text-secondary mt-0.5">
                    {pageSubtitle}
                  </p>
                )}
              </div>
              {pageActions && (
                <div className="flex items-center gap-3 shrink-0">
                  {pageActions}
                </div>
              )}
            </div>
          </header>
        )}

        {/* Page body */}
        <main className="flex-1 max-w-5xl mx-auto w-full px-8 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

// ── PageSection ───────────────────────────────────────────────────────────────
// A content section with a title and optional subtitle + action.
// Follows DESIGN.md's "large vertical gaps between major bands" rule.

interface PageSectionProps {
  title?:     string;
  subtitle?:  string;
  action?:    React.ReactNode;
  children:   React.ReactNode;
  className?: string;
}

export function PageSection({
  title,
  subtitle,
  action,
  children,
  className = "",
}: PageSectionProps) {
  return (
    <section className={`mb-10 ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            {title && (
              <h2 className="text-[16px] font-semibold leading-5 text-on-surface">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-[14px] leading-5 text-secondary mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
