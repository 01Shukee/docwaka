// src/components/documents/RejectionCard.tsx

import { XCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { RejectionLog } from "@/types/document";

interface RejectionCardProps {
  rejectionLogs: RejectionLog[];
}

/**
 * FSD §4.6 — Displays rejection reason(s) on a REJECTED document.
 * DESIGN.md: error (#D92D20) used sparingly — only the icon uses it.
 * The card itself stays calm: white surface, tertiary border, body-sm text.
 */
export default function RejectionCard({ rejectionLogs }: RejectionCardProps) {
  if (!rejectionLogs || rejectionLogs.length === 0) return null;

  // Most recent rejection first
  const latest = rejectionLogs[0];

  const dateLabel = new Date(latest.createdAt).toLocaleString("en-GB", {
    day:    "numeric",
    month:  "short",
    year:   "numeric",
    hour:   "2-digit",
    minute: "2-digit",
  });

  return (
    <Card className="border-red-200 bg-red-50">
      <div className="flex items-start gap-3">
        <XCircle
          size={18}
          className="text-error shrink-0 mt-0.5"
          strokeWidth={1.75}
        />
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-error leading-5">
            Document Rejected
          </p>
          <p className="mt-1 text-[13px] leading-5 text-on-surface">
            {latest.reason}
          </p>
          <p className="mt-2 text-[12px] text-secondary">
            Rejected by{" "}
            <span className="font-medium text-on-surface">
              {latest.rejectedBy.name}
            </span>{" "}
            · {dateLabel}
          </p>
        </div>
      </div>
    </Card>
  );
}
