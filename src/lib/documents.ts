// src/lib/documents.ts — shared Prisma selects + access rules for documents

import type { Prisma } from "@prisma/client";
import type { SessionUser } from "@/lib/auth-helpers";
import { isDataUrl, kindFromUrl, type FileKind } from "@/lib/files";

const userBrief = {
  id: true, name: true, email: true,
  department: { select: { id: true, name: true } },
} satisfies Prisma.UserSelect;

/**
 * List view. Deliberately omits fileUrl: attachments are stored as base64 and
 * can be ~20 MB per row — never ship them in list queries.
 */
export const documentListSelect = {
  id: true, title: true, description: true, status: true,
  createdAt: true, updatedAt: true,
  sender:    { select: userBrief },
  recipient: { select: userBrief },
} satisfies Prisma.DocumentSelect;

export const documentDetailSelect = {
  ...documentListSelect,
  signatures: {
    select: { id: true, data: true, createdAt: true, user: { select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" },
  },
  rejectionLogs: {
    select: { id: true, reason: true, createdAt: true, rejectedBy: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  },
  auditLogs: {
    select: { id: true, action: true, details: true, createdAt: true, user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "asc" },
  },
} satisfies Prisma.DocumentSelect;

/**
 * Participants always; SYS_ADMIN everything; HOD/DEAN/DEPT_ADMIN only documents
 * touching their own department (same scope as the audit log).
 */
export function canViewDocument(
  user: SessionUser,
  doc: { senderId: string; recipientId: string; senderDeptId: string; recipientDeptId: string }
): boolean {
  if (doc.senderId === user.id || doc.recipientId === user.id) return true;
  if (user.role === "SYS_ADMIN") return true;
  if (["HOD", "DEAN", "DEPT_ADMIN"].includes(user.role)) {
    return doc.senderDeptId === user.departmentId || doc.recipientDeptId === user.departmentId;
  }
  return false;
}

/**
 * Data-URL attachments are served via an authenticated route (browsers block
 * navigating to data: URLs and it avoids sending MBs of base64 as JSON).
 */
export function presentFile(id: string, fileUrl: string | null): { fileUrl: string | null; fileKind: FileKind | null } {
  if (!fileUrl) return { fileUrl: null, fileKind: null };
  return {
    fileUrl:  isDataUrl(fileUrl) ? `/api/documents/${id}/file` : fileUrl,
    fileKind: kindFromUrl(fileUrl),
  };
}
