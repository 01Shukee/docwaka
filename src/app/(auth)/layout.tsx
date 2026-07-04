// src/app/(auth)/layout.tsx

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | DocWaka",
    default:  "Sign in",
  },
};

/**
 * DESIGN.md auth layout:
 *   - Full-height centered canvas
 *   - White background (#FFFFFF)
 *   - Single card-like panel on white
 *   - No sidebar chrome
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top branding strip */}
      <div className="flex items-center px-8 py-5 border-b border-tertiary">
        <div className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="DocWaka logo" width={28} height={28} />
          <span className="text-[16px] font-semibold text-on-surface tracking-tight">
            DocWaka
          </span>
        </div>
      </div>

      {/* Centered content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="px-8 py-4 border-t border-tertiary">
        <p className="text-[12px] text-secondary text-center">
          © {new Date().getFullYear()} Federal University of Technology Owerri — DocWaka Document Tracking System
        </p>
      </footer>
    </div>
  );
}
