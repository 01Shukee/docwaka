// src/app/(dashboard)/documents/[id]/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  IconArrowLeft, IconCalendar, IconUser,
  IconBuilding, IconFileText,
} from "@tabler/icons-react";
import StatusBadge from "@/components/ui/StatusBadge";
import { FullPageSpinner } from "@/components/ui/Spinner";
import ActionCard from "@/components/documents/ActionCard";
import DeliveryCard from "@/components/documents/DeliveryCard";
import RejectionCard from "@/components/documents/RejectionCard";
import AuditTrail from "@/components/documents/AuditTrail";
import FilePreview from "@/components/documents/FilePreview";
import { Card } from "@/components/ui/Card";
import type { DocumentDetail } from "@/types/document";

export default function DocumentDetailPage() {
  const { id }            = useParams<{ id: string }>();
  const router            = useRouter();
  const { data: session } = useSession();

  const [document, setDocument] = useState<DocumentDetail | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");

  const fetchDocument = useCallback(async () => {
    try {
      const res  = await fetch(`/api/documents/${id}`);
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to load document."); return; }
      setDocument(data.document);
    } catch { setError("Network error. Please try again."); }
    finally   { setLoading(false); }
  }, [id]);

  useEffect(() => { fetchDocument(); }, [fetchDocument]);

  if (loading) return <FullPageSpinner label="Loading document…" />;

  if (error || !document) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[320px] gap-3 px-4">
        <p className="text-[15px] text-on-surface font-medium text-center">{error || "Document not found."}</p>
        <button onClick={() => router.back()} className="text-[14px] text-secondary hover:text-on-surface underline underline-offset-2">
          Go back
        </button>
      </div>
    );
  }

  const currentUserId   = session?.user?.id ?? "";
  const currentUserName = session?.user?.name ?? "";
  const isRecipient     = document.recipient.id === currentUserId;
  const isSender        = document.sender.id    === currentUserId;

  const sentDate    = new Date(document.createdAt).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const updatedDate = new Date(document.updatedAt).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div>
      <button onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 mb-5 text-[13px] sm:text-[14px] text-secondary hover:text-on-surface transition-colors">
        <IconArrowLeft stroke={1.5} size={14} />
        Back
      </button>

      <div className="flex items-start justify-between gap-3 mb-6 flex-wrap">
        <div className="min-w-0 flex-1">
          <h1 className="text-[20px] sm:text-[26px] font-normal leading-tight text-on-surface break-words">
            {document.title}
          </h1>
          {document.description && (
            <p className="mt-2 text-[13px] sm:text-[15px] leading-6 text-secondary">{document.description}</p>
          )}
        </div>
        <div className="shrink-0">
          <StatusBadge status={document.status} size="md" />
        </div>
      </div>

      {/* Two-column on lg, single on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 lg:gap-6">

        {/* Left */}
        <div className="flex flex-col gap-4 order-2 lg:order-1">
          <Card padding="md">
            <h2 className="text-[11px] font-semibold text-secondary uppercase tracking-[0.06em] mb-3">Details</h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
              <MetaField icon={<IconUser stroke={1.5} size={12} />}     label="From"       value={document.sender.name}    sub={document.sender.department.name} />
              <MetaField icon={<IconUser stroke={1.5} size={12} />}     label="To"         value={document.recipient.name} sub={document.recipient.department.name} />
              <MetaField icon={<IconCalendar stroke={1.5} size={12} />} label="Dispatched" value={sentDate} />
              <MetaField icon={<IconCalendar stroke={1.5} size={12} />} label="Updated"    value={updatedDate} />
              {isSender    && <MetaField icon={<IconBuilding stroke={1.5} size={12} />} label="Recipient dept." value={document.recipient.department.name} />}
              {isRecipient && <MetaField icon={<IconBuilding stroke={1.5} size={12} />} label="Sender dept."    value={document.sender.department.name} />}
            </dl>
          </Card>

          {document.fileUrl  && <FilePreview fileUrl={document.fileUrl} />}
          {!document.fileUrl && (
            <div className="flex items-center gap-2 px-4 py-3 bg-surface border border-tertiary rounded-md">
              <IconFileText stroke={1.5} size={14} className="text-secondary shrink-0" />
              <span className="text-[13px] text-secondary">No file attached.</span>
            </div>
          )}
        </div>

        {/* Right — action panels first on mobile */}
        <div className="flex flex-col gap-4 order-1 lg:order-2">
          {document.status === "REJECTED" && <RejectionCard rejectionLogs={document.rejectionLogs} />}
          {isRecipient && document.status === "PENDING"  && (
            <ActionCard document={document} currentUserId={currentUserId} currentUserName={currentUserName} onUpdate={setDocument} />
          )}
          {isRecipient && document.status === "ACCEPTED" && (
            <DeliveryCard document={document} currentUserId={currentUserId} onUpdate={setDocument} />
          )}
          <AuditTrail logs={document.auditLogs} />
        </div>
      </div>
    </div>
  );
}

function MetaField({ icon, label, value, sub }: { icon?: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div>
      <dt className="flex items-center gap-1 text-[11px] text-secondary mb-0.5">{icon}{label}</dt>
      <dd>
        <span className="text-[13px] font-medium text-on-surface">{value}</span>
        {sub && <span className="block text-[11px] text-secondary mt-0.5 truncate">{sub}</span>}
      </dd>
    </div>
  );
}