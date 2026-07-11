// src/app/(auth)/layout.tsx
import type { Metadata } from "next";
import { DocwakaWordmark } from "@/components/layout/Logo";

export const metadata: Metadata = {
  title: { template: "%s | docwaka.", default: "Sign in" },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex items-center px-6 sm:px-8 py-5 border-b border-tertiary">
        <a href="/">
          <DocwakaWordmark size={16} logoSize={36} variant="light" />
        </a>
      </div>

      <main className="flex-1 flex items-center justify-center px-4 py-10 sm:py-14">
        {children}
      </main>

      <footer className="px-8 py-4 border-t border-tertiary">
        <p className="text-[12px] text-secondary text-center">
          © {new Date().getFullYear()} Federal University of Technology Owerri — Document Workflow &amp; Tracking System
        </p>
      </footer>
    </div>
  );
}