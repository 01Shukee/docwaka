// src/components/documents/DocumentCard.tsx

"use client";

import Link from "next/link";
import { ArrowUpRight, FileText } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import type { Document } from "@/types/document";

interface DocumentCardProps {
  document:   Document;
  perspective: "inbox" | "outbox";
}

/**
 * DESIGN.md card token:
 *   bg-neutral, border-tertiary, rounded-md, 16px padding.
 *   Hover: subtle shadow (tonal depth — never dramatic).
 *   Content remains the focus — no heavy chrome.
 */
export default function DocumentCard({
  document: doc,
  perspective,
}: DocumentCardProps) {
  const counterparty =
    perspective === "inbox" ? doc.sender : doc.recipient;

  const dateLabel = new Date(doc.updatedAt).toLocaleDateString("en-GB", {
    day:   "numeric",
    month: "short",
    year:  "numeric",
  });

  return (
    <Link
      href={`/documents/${doc.id}`}
      className={[
        "group flex items-start gap-4 p-4",
        "bg-neutral border border-tertiary rounded-md",
        "hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)]",
        "transition-shadow duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
      ].join(" ")}
    >
      {/* File icon */}
      <div className="shrink-0 w-9 h-9 rounded-md bg-surface border border-tertiary flex items-center justify-center mt-0.5">
        <FileText size={16} className="text-secondary" strokeWidth={1.5} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Title row */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[14px] font-semibold leading-5 text-on-surface truncate group-hover:text-primary transition-colors">
            {doc.title}
          </h3>
          <ArrowUpRight
            size={14}
            className="shrink-0 text-secondary opacity-0 group-hover:opacity-100 transition-opacity mt-0.5"
          />
        </div>

        {/* Description */}
        {doc.description && (
          <p className="mt-0.5 text-[13px] leading-5 text-secondary line-clamp-1">
            {doc.description}
          </p>
        )}

        {/* Meta row */}
        <div className="mt-2 flex items-center gap-3 flex-wrap">
          <StatusBadge status={doc.status} size="sm" />

          <span className="text-[12px] text-secondary">
            {perspective === "inbox" ? "From" : "To"}{" "}
            <span className="text-on-surface font-medium">
              {counterparty.name}
            </span>
          </span>

          <span className="text-[12px] text-secondary hidden sm:block">
            {counterparty.department.name}
          </span>

          <span className="text-[12px] text-secondary ml-auto shrink-0">
            {dateLabel}
          </span>
        </div>
      </div>
    </Link>
  );
}
