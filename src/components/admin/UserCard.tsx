// src/components/admin/UserCard.tsx
"use client";

import { useState } from "react";
import {
  IconChevronDown, IconChevronUp, IconCircleCheck,
  IconCircleX, IconRefresh, IconUser,
} from "@tabler/icons-react";
import { AccountStatusBadge } from "@/components/ui/StatusBadge";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { ROLE_LABELS } from "@/types/user";
import type { UserSummary } from "@/types/user";

interface UserCardProps {
  user:      UserSummary;
  onUpdated: (updated: UserSummary) => void;
}

export default function UserCard({ user, onUpdated }: UserCardProps) {
  const { success, error: toastError } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [loading,  setLoading]  = useState<"APPROVE"|"REJECT"|"REVOKE"|null>(null);

  const initials = user.name.split(" ").slice(0,2).map(n=>n[0]).join("").toUpperCase();

  const handleAction = async (action: "APPROVE"|"REJECT"|"REVOKE") => {
    setLoading(action);
    try {
      const res  = await fetch("/api/admin/users", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ userId: user.id, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed.");
      onUpdated(data.user);
      success(`${user.name} ${action === "APPROVE" ? "approved" : action === "REJECT" ? "rejected" : "revoked"}.`);
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Action failed.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="bg-neutral border border-tertiary rounded-md overflow-hidden">
      {/* Header row */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface transition-colors text-left"
      >
        <div className="w-8 h-8 rounded-full bg-[#EFF6FF] text-[#1D4ED8] flex items-center justify-center shrink-0 text-[11px] font-bold">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-on-surface truncate">{user.name}</p>
          <p className="text-[11px] text-secondary truncate">{user.email}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <AccountStatusBadge status={user.status} size="sm" />
          {expanded
            ? <IconChevronUp stroke={1.5} size={14} className="text-secondary" />
            : <IconChevronDown stroke={1.5} size={14} className="text-secondary" />
          }
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-tertiary px-4 py-3 bg-surface/30">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
            <MetaRow label="Role"       value={ROLE_LABELS[user.role]} />
            <MetaRow label="Department" value={user.department.name}   />
            <MetaRow label="Joined"     value={new Date(user.createdAt).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" })} />
            {user.approvedBy && <MetaRow label="Approved by" value={user.approvedBy.name} />}
          </dl>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            {user.status === "PENDING" && (
              <>
                <Button variant="primary" size="sm" loading={loading === "APPROVE"}
                  leftIcon={<IconCircleCheck stroke={1.5} size={13} />}
                  onClick={() => handleAction("APPROVE")}>
                  Approve
                </Button>
                <Button variant="danger" size="sm" loading={loading === "REJECT"}
                  leftIcon={<IconCircleX stroke={1.5} size={13} />}
                  onClick={() => handleAction("REJECT")}>
                  Reject
                </Button>
              </>
            )}
            {user.status === "APPROVED" && (
              <Button variant="ghost" size="sm" loading={loading === "REVOKE"}
                leftIcon={<IconRefresh stroke={1.5} size={13} />}
                onClick={() => handleAction("REVOKE")}>
                Revoke access
              </Button>
            )}
            {user.status === "REJECTED" && (
              <Button variant="secondary" size="sm" loading={loading === "APPROVE"}
                leftIcon={<IconCircleCheck stroke={1.5} size={13} />}
                onClick={() => handleAction("APPROVE")}>
                Approve anyway
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold text-secondary uppercase tracking-[0.06em]">{label}</dt>
      <dd className="text-[12px] font-medium text-on-surface mt-0.5 truncate">{value}</dd>
    </div>
  );
}