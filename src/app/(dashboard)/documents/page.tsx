// src/app/(dashboard)/documents/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { IconFilePlus } from "@tabler/icons-react";
import DocumentList from "@/components/documents/DocumentList";
import { FullPageSpinner } from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import type { Document } from "@/types/document";

type Tab = "inbox" | "outbox";

export default function DocumentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = (searchParams.get("tab") as Tab) ?? "inbox";
  const [documents,    setDocuments]    = useState<Document[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading,      setLoading]      = useState(true);

  const fetchDocuments = useCallback(async (t: Tab) => {
    setLoading(true);
    try {
      const res  = await fetch(t === "inbox" ? "/api/documents/inbox" : "/api/documents/outbox");
      const data = await res.json();
      setDocuments(data.documents ?? []);
      if (t === "inbox") setPendingCount(data.pendingCount ?? 0);
    } catch { setDocuments([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchDocuments(tab); }, [tab, fetchDocuments]);

  const setTab = (t: Tab) => {
    const p = new URLSearchParams(searchParams.toString());
    p.set("tab", t);
    router.push(`/documents?${p.toString()}`);
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <div>
          <h1 className="text-[22px] sm:text-[26px] font-normal leading-tight text-on-surface">Documents</h1>
          <p className="mt-0.5 text-[13px] sm:text-[14px] text-secondary hidden sm:block">Manage your incoming and outgoing documents.</p>
        </div>
        <Link href="/documents/new">
          <Button variant="primary" size="md" leftIcon={<IconFilePlus stroke={1.5} size={14} />}>
            <span className="hidden sm:inline">New Document</span>
            <span className="sm:hidden">New</span>
          </Button>
        </Link>
      </div>

      {/* Tab strip */}
      <div className="flex items-center gap-1 mb-5 p-1 bg-surface rounded-full w-fit border border-tertiary">
        {(["inbox","outbox"] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} className={[
            "flex items-center gap-2 px-4 py-1.5 rounded-full text-[13px] sm:text-[14px] font-medium capitalize transition-colors",
            tab === t ? "bg-neutral border border-tertiary text-on-surface shadow-sm" : "text-secondary hover:text-on-surface",
          ].join(" ")}>
            {t === "inbox" ? "Inbox" : "Outbox"}
            {t === "inbox" && pendingCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#F59E0B] text-white text-[10px] font-bold leading-none">
                {pendingCount > 99 ? "99+" : pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading
        ? <FullPageSpinner label={`Loading ${tab}…`} />
        : <DocumentList documents={documents} view={tab} onNewDocument={() => router.push("/documents/new")} />
      }
    </div>
  );
}