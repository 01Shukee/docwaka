// src/app/layout.tsx

import type { Metadata } from "next";
import "./globals.css";
import SessionWrapper from "@/components/layout/SessionWrapper";

export const metadata: Metadata = {
  title: {
    default:  "DocWaka",
    template: "%s | DocWaka",
  },
  description:
    "Document Workflow and Tracking System — Federal University of Technology Owerri",
  robots: {
    index:  false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <SessionWrapper>{children}</SessionWrapper>
      </body>
    </html>
  );
}
