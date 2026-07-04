// src/components/ui/StatusBadge.tsx

import { STATUS_BADGE_CONFIG } from "@/types/document";
import type { DocumentStatus } from "@/types/document";

interface StatusBadgeProps {
  status:     DocumentStatus;
  size?:      "sm" | "md";
  className?: string;
}

/**
 * DESIGN.md chip token:
 *   backgroundColor: surface (#F7F7F7) — overridden per status
 *   textColor: on-surface (#141414) — overridden per status
 *   rounded: full
 *   padding: 0 12px
 *   label-sm typography (12px / 500 / 0.04em tracking)
 *
 * Dot animation: a subtle pulse on PENDING to draw attention.
 */
export default function StatusBadge({
  status,
  size      = "md",
  className = "",
}: StatusBadgeProps) {
  const config = STATUS_BADGE_CONFIG[status];

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 font-medium tracking-[0.04em] rounded-full whitespace-nowrap",
        config.bg,
        config.text,
        size === "sm"
          ? "text-[11px] leading-4 px-2 py-0.5"
          : "text-[12px] leading-4 px-3 py-1",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Status dot */}
      <span className="relative flex items-center justify-center">
        <span
          className={[
            "inline-block rounded-full shrink-0",
            size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2",
            config.dot,
            // Pulse animation only for PENDING (user needs to take action)
            status === "PENDING" ? "animate-pulse" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        />
      </span>
      {config.label}
    </span>
  );
}

// ── AccountStatusBadge ────────────────────────────────────────────────────────

type AccountStatus = "PENDING" | "APPROVED" | "REJECTED";

const ACCOUNT_STATUS_CONFIG: Record<
  AccountStatus,
  { dot: string; text: string; bg: string; label: string }
> = {
  PENDING:  { dot: "bg-yellow-400 animate-pulse", text: "text-yellow-700",  bg: "bg-yellow-50",  label: "Pending Approval" },
  APPROVED: { dot: "bg-emerald-400",               text: "text-emerald-700", bg: "bg-emerald-50", label: "Approved" },
  REJECTED: { dot: "bg-red-400",                   text: "text-red-700",     bg: "bg-red-50",     label: "Rejected" },
};

export function AccountStatusBadge({
  status,
  size      = "md",
  className = "",
}: {
  status:     AccountStatus;
  size?:      "sm" | "md";
  className?: string;
}) {
  const config = ACCOUNT_STATUS_CONFIG[status];

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 font-medium tracking-[0.04em] rounded-full whitespace-nowrap",
        config.bg,
        config.text,
        size === "sm"
          ? "text-[11px] leading-4 px-2 py-0.5"
          : "text-[12px] leading-4 px-3 py-1",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className={`inline-block rounded-full shrink-0 ${size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2"} ${config.dot}`} />
      {config.label}
    </span>
  );
}
