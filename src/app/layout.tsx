// src/app/layout.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import SessionWrapper from "@/components/layout/SessionWrapper";
import { GlobalLoadingProvider } from "@/components/ui/GlobalLoadingProvider";

export const metadata: Metadata = {
  title: {
    default:  "docwaka.",
    template: "%s | docwaka.",
  },
  description: "Document Workflow and Tracking System — Federal University of Technology Owerri",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <SessionWrapper>
          <Suspense fallback={null}>
            <GlobalLoadingProvider>{children}</GlobalLoadingProvider>
          </Suspense>
        </SessionWrapper>
      </body>
    </html>
  );
}
