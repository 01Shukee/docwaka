// src/app/(dashboard)/audit/page.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import Input from "@/components/ui/Input";
import { FullPageSpinner } from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import { AUDIT_ACTION_CONFIG } from "@/types/document";
import type { AuditLog } from "@/types/document";
import { ClipboardList } from "lucide-react";

/**
 * FSD §4.9 — Audit log page.
 * Role-scoped on the API side; this page just renders what comes back.
 *
 * DESIGN.md: minimal table — no heavy chrome, tertiary borders,
 * body-sm text, secondary labels. Search pill input at the top.
 */
export default function AuditPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [logs,         setLogs]         = useState<AuditLog[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page,         setPage]         = useState(1);
  const [totalPages,   setTotalPages]   = useState(1);
  const [total,        setTotal]        = useState(0);

  // Redirect non-admin roles
  useEffect(() => {
    if (
      session &&
      !["SYS_ADMIN", "HOD", "DEAN", "DEPT_ADMIN"].includes(session.user.role)
    ) {
      router.replace("/dashboard");
    }
  }, [session, router]);

  // Debounce search input by 400ms
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page:   String(page),
        limit:  "50",
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
      });
      const res  = await fetch(`/api/audit?${params}`);
      const data = await res.json();
      setLogs(data.logs ?? []);
      setTotalPages(data.pagination?.totalPages ?? 1);
      setTotal(data.pagination?.total ?? 0);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div>
      {/* ── Page heading ─────────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-[26px] font-normal leading-[31px] text-on-surface">
          Audit Log
        </h1>
        <p className="mt-1 text-[14px] leading-5 text-secondary">
          Immutable record of all document events within your scope.
        </p>
      </div>

      {/* ── Search + count bar ───────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 mb-5">
        <div className="w-full max-w-xs">
          <Input
            type="text"
            placeholder="Search by document, user, action…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftSlot={<Search size={14} />}
          />
        </div>
        {!loading && (
          <p className="text-[13px] text-secondary shrink-0">
            {total} event{total !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* ── Table ────────────────────────────────────────────────────── */}
      {loading ? (
        <FullPageSpinner label="Loading audit log…" />
      ) : logs.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No audit events found"
          description={
            debouncedSearch
              ? "Try a different search term."
              : "Events will appear here as documents are processed."
          }
        />
      ) : (
        <>
          <div className="border border-tertiary rounded-md overflow-hidden">
            <table className="w-full text-[13px] leading-5">
              <thead>
                <tr className="bg-surface border-b border-tertiary">
                  <th className="px-4 py-3 text-left font-semibold text-secondary text-[11px] uppercase tracking-[0.04em] w-[130px]">
                    Action
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-secondary text-[11px] uppercase tracking-[0.04em]">
                    Document
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-secondary text-[11px] uppercase tracking-[0.04em] hidden md:table-cell">
                    By
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-secondary text-[11px] uppercase tracking-[0.04em] hidden lg:table-cell">
                    Details
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-secondary text-[11px] uppercase tracking-[0.04em] w-[140px]">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-tertiary">
                {logs.map((log) => {
                  const config    = AUDIT_ACTION_CONFIG[log.action];
                  const dateLabel = new Date(log.createdAt).toLocaleString("en-GB", {
                    day: "numeric", month: "short", year: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  });

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-surface/50 transition-colors"
                    >
                      {/* Action */}
                      <td className="px-4 py-3">
                        <span className={`font-semibold ${config.color}`}>
                          {config.label}
                        </span>
                      </td>

                      {/* Document */}
                      <td className="px-4 py-3">
                        <a
                          href={`/documents/${log.document.id}`}
                          className="font-medium text-on-surface hover:underline underline-offset-2 line-clamp-1"
                        >
                          {log.document.title}
                        </a>
                      </td>

                      {/* Actor */}
                      <td className="px-4 py-3 text-secondary hidden md:table-cell">
                        {log.user.name}
                      </td>

                      {/* Details */}
                      <td className="px-4 py-3 text-secondary hidden lg:table-cell max-w-[240px] truncate">
                        {log.details ?? "—"}
                      </td>

                      {/* Time */}
                      <td className="px-4 py-3 text-secondary text-right whitespace-nowrap">
                        {dateLabel}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="inline-flex items-center gap-1.5 text-[13px] text-secondary hover:text-on-surface transition-colors disabled:opacity-40 disabled:pointer-events-none"
              >
                <ChevronLeft size={14} />
                Previous
              </button>
              <span className="text-[13px] text-secondary">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="inline-flex items-center gap-1.5 text-[13px] text-secondary hover:text-on-surface transition-colors disabled:opacity-40 disabled:pointer-events-none"
              >
                Next
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
