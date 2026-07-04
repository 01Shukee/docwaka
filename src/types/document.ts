// src/types/document.ts

import type { UserSummary } from "./user";

export type DocumentStatus =
  | "DRAFT"
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "DELIVERED";

export type AuditAction =
  | "DISPATCHED"
  | "SIGNED"
  | "ACCEPTED"
  | "REJECTED"
  | "DELIVERED";

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
  id:          string;
  reason:      string;
  createdAt:   string;
  rejectedBy:  { id: string; name: string };
}

export interface DocumentDetail extends Document {
  signatures:    Signature[];
  rejectionLogs: RejectionLog[];
  auditLogs:     AuditLog[];
}

export interface Signature {
  id:        string;
  data:      string; // base64 PNG data URL
  createdAt: string;
  user:      { id: string; name: string };
}

// ── DESIGN.md-aligned status badge config ────────────────────────────────────
// Colors expressed as Tailwind class strings mapped to each document status.
export const STATUS_BADGE_CONFIG: Record<
  DocumentStatus,
  { dot: string; text: string; bg: string; label: string }
> = {
  DRAFT:     { dot: "bg-[#9CA3AF]",  text: "text-[#6B7280]",  bg: "bg-[#F3F4F6]",            label: "Draft" },
  PENDING:   { dot: "bg-yellow-400", text: "text-yellow-600",  bg: "bg-yellow-50",             label: "Pending" },
  ACCEPTED:  { dot: "bg-emerald-400",text: "text-emerald-600", bg: "bg-emerald-50",            label: "Accepted" },
  REJECTED:  { dot: "bg-red-400",    text: "text-red-600",     bg: "bg-red-50",                label: "Rejected" },
  DELIVERED: { dot: "bg-emerald-500",text: "text-emerald-700", bg: "bg-emerald-50",            label: "Delivered" },
};

// ── Audit action display config ───────────────────────────────────────────────
export const AUDIT_ACTION_CONFIG: Record<
  AuditAction,
  { label: string; color: string }
> = {
  DISPATCHED: { label: "Dispatched", color: "text-[#3B82F6]"   },
  SIGNED:     { label: "Signed",     color: "text-[#8B5CF6]"   },
  ACCEPTED:   { label: "Accepted",   color: "text-emerald-600"  },
  REJECTED:   { label: "Rejected",   color: "text-red-600"      },
  DELIVERED:  { label: "Delivered",  color: "text-emerald-700"  },
};
