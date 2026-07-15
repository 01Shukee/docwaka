// src/components/documents/DocumentCard.tsx
"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { IconArrowUpRight, IconFileText } from "@tabler/icons-react";
import StatusBadge from "@/components/ui/StatusBadge";
import type { Document } from "@/types/document";

interface DocumentCardProps {
  doc:  Document;
  view: "inbox" | "outbox";
}

export default function DocumentCard({ doc, view }: DocumentCardProps) {
  const counterpart = view === "inbox" ? doc.sender : doc.recipient;
  const timeAgo     = formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true });

  return (
    <Link
      href={`/documents/${doc.id}`}
      className="block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md"
    >
      <article className="bg-neutral border border-tertiary rounded-md p-3 sm:p-4 transition-shadow duration-150 group-hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)] group-hover:border-[#D1D5DB]">
        <div className="flex items-start gap-2 sm:gap-3">
          <div className="mt-0.5 w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center shrink-0">
            <IconFileText stroke={1.5} size={13} className="text-[#3B82F6]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-[13px] sm:text-[14px] font-semibold leading-5 text-on-surface truncate pr-1">
                {doc.title}
              </h3>
              <div className="flex items-center gap-1.5 shrink-0">
                <StatusBadge status={doc.status} size="sm" />
                <IconArrowUpRight stroke={1.5} size={13} className="text-tertiary group-hover:text-secondary transition-colors hidden sm:block" />
              </div>
            </div>
            {doc.description && (
              <p className="mt-0.5 text-[12px] leading-5 text-secondary line-clamp-1 hidden sm:block">
                {doc.description}
              </p>
            )}
            <div className="mt-1.5 flex items-center gap-2 flex-wrap">
              <span className="text-[11px] sm:text-[12px] text-secondary">
                {view === "inbox" ? "From" : "To"}{" "}
                <span className="font-medium text-on-surface">{counterpart.name}</span>
              </span>
              <span className="text-tertiary text-[9px] hidden sm:inline">•</span>
              <span className="text-[11px] text-secondary hidden sm:inline truncate max-w-[160px]">
                {counterpart.department.name}
              </span>
              <span className="text-tertiary text-[9px]">•</span>
              <time dateTime={doc.updatedAt} className="text-[11px] sm:text-[12px] text-secondary ml-auto">
                {timeAgo}
              </time>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}