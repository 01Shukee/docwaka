// src/components/admin/UserCard.tsx

"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { AccountStatusBadge } from "@/components/ui/StatusBadge";
import { ROLE_LABELS } from "@/types/user";
import { useToast } from "@/components/ui/Toast";
import type { UserSummary } from "@/types/user";

interface UserCardProps {
  user:       UserSummary;
  onUpdated:  (updated: UserSummary) => void;
}

/**
 * FSD §4.10 — Admin user management card.
 * Shows name, email, role, department, status.
 * Action buttons vary by current status:
 *   PENDING  → Approve | Reject
 *   APPROVED → Revoke
 *   REJECTED → Approve
 *
 * DESIGN.md: card token, white surface, pill buttons.
 * Destructive (Reject/Revoke) uses danger variant — restrained, not dominant.
 */
export default function UserCard({ user, onUpdated }: UserCardProps) {
  const { success, error: toastError } = useToast();
  const [loading, setLoading]           = useState<string | null>(null);
  const [expanded, setExpanded]         = useState(false);

  const handleAction = async (action: "APPROVE" | "REJECT" | "REVOKE") => {
    setLoading(action);
    try {
      const res = await fetch("/api/admin/users", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ userId: user.id, action }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Action failed.");
      onUpdated(json.user as UserSummary);
      success(
        action === "APPROVE"
          ? `${user.name} has been approved.`
          : action === "REJECT"
          ? `${user.name} has been rejected.`
          : `${user.name}'s access has been revoked.`
      );
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Action failed.");
    } finally {
      setLoading(null);
    }
  };

  const joinedDate = new Date(user.createdAt).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });

  // User initials
  const initials = user.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <Card padding="none" className="overflow-hidden">
      {/* Main row */}
      <button
        className="w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-surface/50 transition-colors"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-primary text-neutral flex items-center justify-center shrink-0">
          <span className="text-[11px] font-semibold">{initials}</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[14px] font-semibold text-on-surface truncate">
              {user.name}
            </span>
            <AccountStatusBadge status={user.status} size="sm" />
          </div>
          <p className="text-[12px] text-secondary truncate">
            {user.email} · {ROLE_LABELS[user.role]} · {user.department.name}
          </p>
        </div>

        {/* Expand chevron */}
        <span className="shrink-0 text-secondary">
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </span>
      </button>

      {/* Expanded detail + actions */}
      {expanded && (
        <div className="border-t border-tertiary px-4 py-4">
          {/* Meta */}
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4 text-[12px]">
            <div>
              <dt className="text-secondary">Registered</dt>
              <dd className="text-on-surface font-medium mt-0.5">{joinedDate}</dd>
            </div>
            <div>
              <dt className="text-secondary">Department</dt>
              <dd className="text-on-surface font-medium mt-0.5 truncate">{user.department.name}</dd>
            </div>
            <div>
              <dt className="text-secondary">Role</dt>
              <dd className="text-on-surface font-medium mt-0.5">{ROLE_LABELS[user.role]}</dd>
            </div>
            {user.approvedBy && (
              <div>
                <dt className="text-secondary">Approved by</dt>
                <dd className="text-on-surface font-medium mt-0.5">{user.approvedBy.name}</dd>
              </div>
            )}
          </dl>

          {/* Action buttons */}
          <div className="flex gap-2 flex-wrap">
            {(user.status === "PENDING" || user.status === "REJECTED") && (
              <Button
                variant="primary"
                size="sm"
                loading={loading === "APPROVE"}
                disabled={!!loading}
                leftIcon={<CheckCircle2 size={13} />}
                onClick={() => handleAction("APPROVE")}
              >
                Approve
              </Button>
            )}

            {user.status === "PENDING" && (
              <Button
                variant="danger"
                size="sm"
                loading={loading === "REJECT"}
                disabled={!!loading}
                leftIcon={<XCircle size={13} />}
                onClick={() => handleAction("REJECT")}
              >
                Reject
              </Button>
            )}

            {user.status === "APPROVED" && (
              <Button
                variant="danger"
                size="sm"
                loading={loading === "REVOKE"}
                disabled={!!loading}
                leftIcon={<RotateCcw size={13} />}
                onClick={() => handleAction("REVOKE")}
              >
                Revoke Access
              </Button>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
