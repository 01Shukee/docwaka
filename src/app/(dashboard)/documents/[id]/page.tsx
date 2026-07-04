// src/app/(dashboard)/documents/[id]/page.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Calendar, User2, Building2, FileText } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import { FullPageSpinner } from "@/components/ui/Spinner";
import ActionCard from "@/components/documents/ActionCard";
import DeliveryCard from "@/components/documents/DeliveryCard";
import RejectionCard from "@/components/documents/RejectionCard";
import AuditTrail from "@/components/documents/AuditTrail";
import FilePreview from "@/components/documents/FilePreview";
import { Card } from "@/components/ui/Card";
import type { DocumentDetail } from "@/types/document";

/**
 * FSD §4.4 / §5.3 — Document detail page.
 *
 * Renders all document information plus role-appropriate action panels:
 *   - ActionCard   → shown to recipient when status is PENDING
 *   - DeliveryCard → shown to recipient when status is ACCEPTED
 *   - RejectionCard→ shown when status is REJECTED
 *   - FilePreview  → shown when document has a fileUrl
 *   - AuditTrail   → always shown
 *
 * DESIGN.md: two-column layout on large screens.
 * Left column: document metadata + file preview.
 * Right column: action panels + audit trail.
 */
export default function DocumentDetailPage() {
  const { id }              = useParams<{ id: string }>();
  const router              = useRouter();
  const { data: session }   = useSession();

  const [document, setDocument] = useState<DocumentDetail | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");

  const fetchDocument = useCallback(async () => {
    try {
      const res  = await fetch(`/api/documents/${id}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to load document.");
        return;
      }
      setDocument(data.document);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDocument();
  }, [fetchDocument]);

  if (loading) return <FullPageSpinner label="Loading document…" />;

  if (error || !document) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[320px] gap-3">
        <p className="text-[16px] text-on-surface font-medium">
          {error || "Document not found."}
        </p>
        <button
          onClick={() => router.back()}
          className="text-[14px] text-secondary hover:text-on-surface underline underline-offset-2"
        >
          Go back
        </button>
      </div>
    );
  }

  const currentUserId   = session?.user?.id ?? "";
  const currentUserName = session?.user?.name ?? "";
  const isRecipient     = document.recipient.id === currentUserId;
  const isSender        = document.sender.id    === currentUserId;

  const sentDate     = new Date(document.createdAt).toLocaleString("en-GB", {
    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
  const updatedDate  = new Date(document.updatedAt).toLocaleString("en-GB", {
    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

  return (
    <div>
      {/* ── Back + breadcrumb ─────────────────────────────────────────── */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 mb-6 text-[14px] text-secondary hover:text-on-surface transition-colors"
      >
        <ArrowLeft size={14} />
        Back to documents
      </button>

      {/* ── Title row ─────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div className="min-w-0">
          <h1 className="text-[26px] font-normal leading-[31px] text-on-surface break-words">
            {document.title}
          </h1>
          {document.description && (
            <p className="mt-2 text-[15px] leading-6 text-secondary max-w-2xl">
              {document.description}
            </p>
          )}
        </div>
        <div className="shrink-0 mt-1">
          <StatusBadge status={document.status} size="md" />
        </div>
      </div>

      {/* ── Two-column layout ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">

        {/* ── Left column ──────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">

          {/* Meta card */}
          <Card padding="lg">
            <h2 className="text-[13px] font-semibold text-secondary uppercase tracking-[0.04em] mb-4">
              Details
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              <MetaField
                icon={<User2 size={13} className="text-secondary" />}
                label="From"
                value={document.sender.name}
                sub={document.sender.department.name}
              />
              <MetaField
                icon={<User2 size={13} className="text-secondary" />}
                label="To"
                value={document.recipient.name}
                sub={document.recipient.department.name}
              />
              <MetaField
                icon={<Calendar size={13} className="text-secondary" />}
                label="Dispatched"
                value={sentDate}
              />
              <MetaField
                icon={<Calendar size={13} className="text-secondary" />}
                label="Last updated"
                value={updatedDate}
              />
              {isSender && (
                <MetaField
                  icon={<Building2 size={13} className="text-secondary" />}
                  label="Recipient dept."
                  value={document.recipient.department.name}
                />
              )}
              {isRecipient && (
                <MetaField
                  icon={<Building2 size={13} className="text-secondary" />}
                  label="Sender dept."
                  value={document.sender.department.name}
                />
              )}
            </dl>
          </Card>

          {/* File preview */}
          {document.fileUrl && (
            <FilePreview fileUrl={document.fileUrl} />
          )}

          {/* No file indicator */}
          {!document.fileUrl && (
            <div className="flex items-center gap-2 px-4 py-3 bg-surface border border-tertiary rounded-md">
              <FileText size={14} className="text-secondary" strokeWidth={1.5} />
              <span className="text-[13px] text-secondary">
                No file attached to this document.
              </span>
            </div>
          )}
        </div>

        {/* ── Right column ─────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">

          {/* Rejection reason */}
          {document.status === "REJECTED" && (
            <RejectionCard rejectionLogs={document.rejectionLogs} />
          )}

          {/* Action panel — PENDING recipient */}
          {isRecipient && document.status === "PENDING" && (
            <ActionCard
              document={document}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              onUpdate={(updated) => setDocument(updated)}
            />
          )}

          {/* Delivery panel — ACCEPTED recipient */}
          {isRecipient && document.status === "ACCEPTED" && (
            <DeliveryCard
              document={document}
              currentUserId={currentUserId}
              onUpdate={(updated) => setDocument(updated)}
            />
          )}

          {/* Audit trail */}
          <AuditTrail logs={document.auditLogs} />
        </div>
      </div>
    </div>
  );
}

// ── MetaField ─────────────────────────────────────────────────────────────────

function MetaField({
  icon,
  label,
  value,
  sub,
}: {
  icon?:  React.ReactNode;
  label:  string;
  value:  string;
  sub?:   string;
}) {
  return (
    <div>
      <dt className="flex items-center gap-1 text-[12px] text-secondary mb-0.5">
        {icon}
        {label}
      </dt>
      <dd>
        <span className="text-[14px] font-medium text-on-surface">{value}</span>
        {sub && (
          <span className="block text-[12px] text-secondary mt-0.5 truncate">
            {sub}
          </span>
        )}
      </dd>
    </div>
  );
}
