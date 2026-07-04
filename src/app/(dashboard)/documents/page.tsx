// src/app/(dashboard)/documents/page.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { FilePlus2 } from "lucide-react";
import DocumentList from "@/components/documents/DocumentList";
import { FullPageSpinner } from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import type { Document } from "@/types/document";

type Tab = "inbox" | "outbox";

/**
 * FSD §4.3 — Documents list page with Inbox / Outbox tabs.
 * Tab state is URL-driven (?tab=inbox | ?tab=outbox) so it
 * survives refresh and is shareable.
 *
 * DESIGN.md: minimal tab strip — pill-style active indicator,
 * secondary text for inactive. No boxed tab chrome.
 */
export default function DocumentsPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const tab          = (searchParams.get("tab") as Tab) ?? "inbox";

  const [documents,    setDocuments]    = useState<Document[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading,      setLoading]      = useState(true);

  const fetchDocuments = useCallback(async (currentTab: Tab) => {
    setLoading(true);
    try {
      const endpoint =
        currentTab === "inbox"
          ? "/api/documents/inbox"
          : "/api/documents/outbox";

      const res  = await fetch(endpoint);
      const data = await res.json();

      setDocuments(data.documents ?? []);
      if (currentTab === "inbox") setPendingCount(data.pendingCount ?? 0);
    } catch {
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments(tab);
  }, [tab, fetchDocuments]);

  const setTab = (t: Tab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", t);
    router.push(`/documents?${params.toString()}`);
  };

  return (
    <div>
      {/* ── Page header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[26px] font-normal leading-[31px] text-on-surface">
            Documents
          </h1>
          <p className="mt-1 text-[14px] leading-5 text-secondary">
            Manage your incoming and outgoing documents.
          </p>
        </div>
        <Link href="/documents/new">
          <Button variant="primary" size="md" leftIcon={<FilePlus2 size={14} />}>
            New Document
          </Button>
        </Link>
      </div>

      {/* ── Tab strip ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 mb-6 p-1 bg-surface rounded-full w-fit border border-tertiary">
        <TabButton
          label="Inbox"
          badge={pendingCount}
          active={tab === "inbox"}
          onClick={() => setTab("inbox")}
        />
        <TabButton
          label="Outbox"
          active={tab === "outbox"}
          onClick={() => setTab("outbox")}
        />
      </div>

      {/* ── Content ──────────────────────────────────────────────────── */}
      {loading ? (
        <FullPageSpinner label={`Loading ${tab}…`} />
      ) : (
        <DocumentList
          documents={documents}
          perspective={tab}
          onNewDocument={() => router.push("/documents/new")}
        />
      )}
    </div>
  );
}

function TabButton({
  label,
  badge,
  active,
  onClick,
}: {
  label:   string;
  badge?:  number;
  active:  boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "flex items-center gap-2 px-4 py-1.5 rounded-full text-[14px] font-medium transition-colors duration-100",
        active
          ? "bg-neutral border border-tertiary text-on-surface shadow-sm"
          : "text-secondary hover:text-on-surface",
      ].join(" ")}
    >
      {label}
      {badge != null && badge > 0 && (
        <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-neutral text-[11px] font-semibold leading-none">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </button>
  );
}
