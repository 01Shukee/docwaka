// src/app/page.tsx
import LandingPage from "@/components/landing/LandingPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DocWaka — Document Workflow & Tracking System",
  description: "FUTO's official document routing and tracking platform. Dispatch, sign, approve, and confirm delivery.",
};

export default function RootPage() {
  return <LandingPage />;
}