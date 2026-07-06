// src/types/document.ts

import type { UserSummary } from "./user";

export type DocumentStatus = "DRAFT" | "PENDING" | "ACCEPTED" | "REJECTED" | "DELIVERED";
export type AuditAction    = "DISPATCHED" | "SIGNED" | "ACCEPTED" | "REJECTED" | "DELIVERED";

export interface DocumentSender {
  id:         string;
  name:       string;
  email:      string;
  department: { id: string; name: string };
}

export interface Document {
  id:          string;
  title:       string;
  description: string | null;
  fileUrl:     string | null;
  status:      DocumentStatus;
  createdAt:   string;
  updatedAt:   string;
  sender:      DocumentSender;
  recipient:   DocumentSender;
}

export interface AuditLog {
  id:        string;
  action:    AuditAction;
  details:   string | null;
  createdAt: string;
  document:  { id: string; title: string };
  user:      { id: string; name: string; email: string };
}

export interface RejectionLog {
  id:         string;
  reason:     string;
  createdAt:  string;
  rejectedBy: { id: string; name: string };
}

export interface DocumentDetail extends Document {
  signatures:    Signature[];
  rejectionLogs: RejectionLog[];
  auditLogs:     AuditLog[];
}

export interface Signature {
  id:        string;
  data:      string;
  createdAt: string;
  user:      { id: string; name: string };
}

// ── Status badge config — using complementary palette ────────────────────────
export const STATUS_BADGE_CONFIG: Record<
  DocumentStatus,
  { dot: string; text: string; bg: string; label: string }
> = {
  DRAFT:     { dot: "bg-[#9CA3AF]", text: "text-[#6B7280]", bg: "bg-[#F3F4F6]", label: "Draft"     },
  PENDING:   { dot: "bg-[#F59E0B]", text: "text-[#B45309]", bg: "bg-[#FFFBEB]", label: "Pending"   },
  ACCEPTED:  { dot: "bg-[#10B981]", text: "text-[#047857]", bg: "bg-[#ECFDF5]", label: "Accepted"  },
  REJECTED:  { dot: "bg-[#D92D20]", text: "text-[#991B1B]", bg: "bg-[#FEF2F2]", label: "Rejected"  },
  DELIVERED: { dot: "bg-[#3B82F6]", text: "text-[#1D4ED8]", bg: "bg-[#EFF6FF]", label: "Delivered" },
};

// ── Audit action config ───────────────────────────────────────────────────────
export const AUDIT_ACTION_CONFIG: Record<
  AuditAction,
  { label: string; color: string; bg: string }
> = {
  DISPATCHED: { label: "Dispatched", color: "text-[#1D4ED8]", bg: "bg-[#EFF6FF]" },
  SIGNED:     { label: "Signed",     color: "text-[#4338CA]", bg: "bg-[#EEF2FF]" },
  ACCEPTED:   { label: "Accepted",   color: "text-[#047857]", bg: "bg-[#ECFDF5]" },
  REJECTED:   { label: "Rejected",   color: "text-[#991B1B]", bg: "bg-[#FEF2F2]" },
  DELIVERED:  { label: "Delivered",  color: "text-[#1D4ED8]", bg: "bg-[#DBEAFE]" },
};