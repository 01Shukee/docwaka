// src/components/documents/DocumentList.tsx

"use client";

import { Inbox, Send } from "lucide-react";
import DocumentCard from "./DocumentCard";
import EmptyState from "@/components/ui/EmptyState";
import type { Document } from "@/types/document";

interface DocumentListProps {
  documents:   Document[];
  perspective: "inbox" | "outbox";
  onNewDocument?: () => void;
}

/**
 * DESIGN.md: list feels curated, not dashboard-like.
 * Staggered entrance via CSS animation-delay on each card.
 * Clean vertical rhythm — gap-2 between cards.
 */
export default function DocumentList({
  documents,
  perspective,
  onNewDocument,
}: DocumentListProps) {
  if (documents.length === 0) {
    return perspective === "inbox" ? (
      <EmptyState
        icon={Inbox}
        title="Your inbox is empty"
        description="Documents sent to you will appear here. Check back later."
      />
    ) : (
      <EmptyState
        icon={Send}
        title="No documents sent yet"
        description="Documents you dispatch will be tracked here."
        action={
          onNewDocument
            ? { label: "Send a document", onClick: onNewDocument }
            : undefined
        }
      />
    );
  }

  return (
    <ol className="flex flex-col gap-2">
      {documents.map((doc, i) => (
        <li
          key={doc.id}
          style={{
            animationDelay: `${i * 40}ms`,
            animationFillMode: "both",
          }}
          className="animate-[slideInUp_200ms_ease-out]"
        >
          <DocumentCard document={doc} perspective={perspective} />
        </li>
      ))}
    </ol>
  );
}
