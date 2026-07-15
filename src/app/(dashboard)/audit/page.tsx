// src/app/(dashboard)/audit/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { IconSearch, IconChevronLeft, IconChevronRight, IconClipboardList } from "@tabler/icons-react";
import Input from "@/components/ui/Input";
import { FullPageSpinner } from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import { AUDIT_ACTION_CONFIG } from "@/types/document";
import type { AuditLog } from "@/types/document";

export default function AuditPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [logs,            setLogs]            = useState<AuditLog[]>([]);
  const [loading,         setLoading]         = useState(true);
  const [search,          setSearch]          = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page,            setPage]            = useState(1);
  const [totalPages,      setTotalPages]      = useState(1);
  const [total,           setTotal]           = useState(0);

  useEffect(() => {
    if (session && !["SYS_ADMIN","HOD","DEAN","DEPT_ADMIN"].includes(session.user.role)) {
      router.replace("/dashboard");
    }
  }, [session, router]);

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "50", ...(debouncedSearch ? { search: debouncedSearch } : {}) });
      const res  = await fetch(`/api/audit?${params}`);
      const data = await res.json();
      setLogs(data.logs ?? []);
      setTotalPages(data.pagination?.totalPages ?? 1);
      setTotal(data.pagination?.total ?? 0);
    } catch { setLogs([]); }
    finally { setLoading(false); }
  }, [page, debouncedSearch]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-[22px] sm:text-[26px] font-normal leading-tight text-on-surface">Audit Log</h1>
        <p className="mt-1 text-[13px] sm:text-[14px] text-secondary hidden sm:block">Immutable record of all document events within your scope.</p>
      </div>

      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="w-full max-w-xs">
          <Input type="text" placeholder="Search by document, user, action…" value={search}
            onChange={e => setSearch(e.target.value)} leftSlot={<IconSearch size={14} stroke={1.5} />} />
        </div>
        {!loading && <p className="text-[12px] text-secondary shrink-0">{total} event{total !== 1 ? "s" : ""}</p>}
      </div>

      {loading ? (
        <FullPageSpinner label="Loading audit log…" />
      ) : logs.length === 0 ? (
        <EmptyState icon={IconClipboardList} title="No audit events found"
          description={debouncedSearch ? "Try a different search term." : "Events will appear here as documents are processed."} />
      ) : (
        <>
          {/* Mobile: card list. Desktop: table */}
          <div className="sm:hidden flex flex-col gap-2">
            {logs.map(log => {
              const config    = AUDIT_ACTION_CONFIG[log.action];
              const dateLabel = new Date(log.createdAt).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
              return (
                <div key={log.id} className="bg-neutral border border-tertiary rounded-md p-3">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${config?.color ?? "text-secondary"} ${config?.bg ?? "bg-surface"}`}>
                      {config?.label ?? log.action}
                    </span>
                    <span className="text-[11px] text-secondary">{dateLabel}</span>
                  </div>
                  <a href={`/documents/${log.document.id}`} className="text-[13px] font-medium text-on-surface hover:underline block truncate mb-0.5">{log.document.title}</a>
                  <p className="text-[11px] text-secondary">By {log.user.name}</p>
                </div>
              );
            })}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block border border-tertiary rounded-md overflow-hidden">
            <table className="w-full text-[13px] leading-5">
              <thead>
                <tr className="bg-surface border-b border-tertiary">
                  {["Action","Document","By","Details","Time"].map((h, i) => (
                    <th key={h} className={`px-4 py-3 text-left font-semibold text-secondary text-[10px] uppercase tracking-[0.06em] ${i === 3 ? "hidden lg:table-cell" : ""} ${i === 4 ? "text-right" : ""}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-tertiary">
                {logs.map(log => {
                  const config    = AUDIT_ACTION_CONFIG[log.action];
                  const dateLabel = new Date(log.createdAt).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
                  return (
                    <tr key={log.id} className="hover:bg-surface/50 transition-colors">
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${config?.color ?? "text-secondary"} ${config?.bg ?? "bg-surface"}`}>
                          {config?.label ?? log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 max-w-[200px]">
                        <a href={`/documents/${log.document.id}`} className="font-medium text-on-surface hover:underline underline-offset-2 truncate block">{log.document.title}</a>
                      </td>
                      <td className="px-4 py-3 text-secondary">{log.user.name}</td>
                      <td className="px-4 py-3 text-secondary hidden lg:table-cell max-w-[220px] truncate">{log.details ?? "—"}</td>
                      <td className="px-4 py-3 text-secondary text-right whitespace-nowrap">{dateLabel}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="inline-flex items-center gap-1.5 text-[13px] text-secondary hover:text-on-surface disabled:opacity-40 disabled:pointer-events-none">
                <IconChevronLeft size={14} stroke={1.5} /> Previous
              </button>
              <span className="text-[12px] text-secondary">Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="inline-flex items-center gap-1.5 text-[13px] text-secondary hover:text-on-surface disabled:opacity-40 disabled:pointer-events-none">
                Next <IconChevronRight size={14} stroke={1.5} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
