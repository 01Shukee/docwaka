// src/components/layout/AppShell.tsx
"use client";

import { useState } from "react";
import { IconMenu2 } from "@tabler/icons-react";
import { DocwakaWordmark } from "./Logo";
import Sidebar from "./Sidebar";
import type { Role } from "@/types/user";

interface AppShellProps {
  children:      React.ReactNode;
  userName:      string;
  userRole:      Role;
  userEmail:     string;
  inboxCount?:   number;
  pageTitle?:    string;
  pageSubtitle?: string;
  pageActions?:  React.ReactNode;
}

export default function AppShell({
  children, userName, userRole, userEmail,
  inboxCount = 0, pageTitle, pageSubtitle, pageActions,
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        userName={userName} userRole={userRole} userEmail={userEmail}
        inboxCount={inboxCount} open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-[240px] min-h-screen flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-neutral/90 backdrop-blur-sm border-b border-tertiary">
          <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3 h-[52px]">
            <div className="flex items-center gap-3 min-w-0">
              {/* Hamburger — mobile only */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-1.5 rounded-md text-secondary hover:text-on-surface hover:bg-surface transition-colors shrink-0"
                aria-label="Open navigation"
              >
                <IconMenu2 size={18} stroke={1.5} />
              </button>

              {pageTitle ? (
                <div className="min-w-0">
                  <h1 className="text-[16px] sm:text-[17px] font-semibold leading-5 text-on-surface tracking-tight truncate">
                    {pageTitle}
                  </h1>
                  {pageSubtitle && (
                    <p className="text-[11px] leading-4 text-secondary mt-0.5 hidden sm:block">{pageSubtitle}</p>
                  )}
                </div>
              ) : (
                /* Mobile: logo wordmark when no page title */
                <div className="lg:hidden">
                  <DocwakaWordmark size={15} logoSize={44} variant="light" />
                </div>
              )}
            </div>

            {pageActions && (
              <div className="flex items-center gap-2 shrink-0">{pageActions}</div>
            )}
          </div>
        </header>

        <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

// ── PageSection ────────────────────────────────────────────────────────────────
interface PageSectionProps {
  title?:     string;
  subtitle?:  string;
  action?:    React.ReactNode;
  children:   React.ReactNode;
  className?: string;
}

export function PageSection({ title, subtitle, action, children, className = "" }: PageSectionProps) {
  return (
    <section className={`mb-8 lg:mb-10 ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div>
            {title && <h2 className="text-[15px] lg:text-[16px] font-semibold leading-5 text-on-surface">{title}</h2>}
            {subtitle && <p className="text-[13px] leading-5 text-secondary mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
