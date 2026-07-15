// src/components/ui/StatusBadge.tsx
import { STATUS_BADGE_CONFIG } from "@/types/document";
import type { DocumentStatus } from "@/types/document";

interface StatusBadgeProps {
  status:     DocumentStatus;
  size?:      "sm" | "md";
  className?: string;
}

export default function StatusBadge({ status, size = "md", className = "" }: StatusBadgeProps) {
  const config = STATUS_BADGE_CONFIG[status];
  return (
    <span className={[
      "inline-flex items-center gap-1.5 font-semibold tracking-[0.03em] rounded-full whitespace-nowrap",
      config.bg, config.text,
      size === "sm" ? "text-[11px] leading-4 px-2 py-0.5" : "text-[12px] leading-4 px-3 py-1",
      className,
    ].filter(Boolean).join(" ")}>
      <span className={[
        "inline-block rounded-full shrink-0",
        size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2",
        config.dot,
        status === "PENDING" ? "animate-pulse" : "",
      ].filter(Boolean).join(" ")} />
      {config.label}
    </span>
  );
}

// ── AccountStatusBadge ────────────────────────────────────────────────────────
type AccountStatus = "PENDING" | "APPROVED" | "REJECTED";

const ACCOUNT_STATUS_CONFIG: Record<AccountStatus, { dot: string; text: string; bg: string; label: string }> = {
  PENDING:  { dot: "bg-[#F59E0B] animate-pulse", text: "text-[#B45309]", bg: "bg-[#FFFBEB]", label: "Pending Approval" },
  APPROVED: { dot: "bg-[#10B981]",               text: "text-[#047857]", bg: "bg-[#ECFDF5]", label: "Approved"         },
  REJECTED: { dot: "bg-red-400",                 text: "text-red-700",   bg: "bg-red-50",    label: "Rejected"         },
};

export function AccountStatusBadge({ status, size = "md", className = "" }: { status: AccountStatus; size?: "sm" | "md"; className?: string }) {
  const config = ACCOUNT_STATUS_CONFIG[status];
  return (
    <span className={[
      "inline-flex items-center gap-1.5 font-semibold tracking-[0.03em] rounded-full whitespace-nowrap",
      config.bg, config.text,
      size === "sm" ? "text-[11px] leading-4 px-2 py-0.5" : "text-[12px] leading-4 px-3 py-1",
      className,
    ].filter(Boolean).join(" ")}>
      <span className={`inline-block rounded-full shrink-0 ${size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2"} ${config.dot}`} />
      {config.label}
    </span>
  );
}
