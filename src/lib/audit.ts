// src/lib/audit.ts

import { prisma } from "@/lib/prisma";
import type { AuditAction } from "@prisma/client";

/**
 * Parameters for creating an audit log entry.
 */
export interface CreateAuditLogParams {
  documentId: string;
  userId:     string;
  action:     AuditAction;
  details?:   string;
}

/**
 * Creates a single immutable audit log entry.
 *
 * FSD §4.8 — Audit logs are append-only; no delete or edit API exists.
 * This function is the only write path for the AuditLog table.
 *
 * Failures are caught and logged to stderr rather than thrown, so that
 * a failed audit write never blocks the primary operation (e.g. document
 * status update). In production you would surface this to an error
 * monitoring service (e.g. Sentry).
 */
export async function createAuditLog(
  params: CreateAuditLogParams
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        documentId: params.documentId,
        userId:     params.userId,
        action:     params.action,
        details:    params.details ?? null,
      },
    });
  } catch (err) {
    console.error(
      `[AuditLog] Failed to write log — action: ${params.action}, doc: ${params.documentId}`,
      err
    );
  }
}

/**
 * Creates multiple audit log entries in a single transaction.
 * Used when two events must be recorded atomically (e.g. SIGNED + ACCEPTED).
 */
export async function createAuditLogs(
  entries: CreateAuditLogParams[]
): Promise<void> {
  try {
    await prisma.$transaction(
      entries.map((e) =>
        prisma.auditLog.create({
          data: {
            documentId: e.documentId,
            userId:     e.userId,
            action:     e.action,
            details:    e.details ?? null,
          },
        })
      )
    );
  } catch (err) {
    console.error("[AuditLog] Failed to write batch audit logs", err);
  }
}
