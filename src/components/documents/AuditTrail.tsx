// src/components/documents/AuditTrail.tsx
import { Card, CardHeader } from "@/components/ui/Card";
import { AUDIT_ACTION_CONFIG } from "@/types/document";
import type { AuditLog } from "@/types/document";

interface AuditTrailProps { logs?: AuditLog[]; className?: string; }

export default function AuditTrail({ logs = [], className = "" }: AuditTrailProps) {
  return (
    <Card className={className}>
      <CardHeader
        title="Audit Trail"
        subtitle={`${logs.length} event${logs.length !== 1 ? "s" : ""}`}
      />
      {logs.length === 0 ? (
        <p className="text-[13px] text-secondary text-center py-6">No events recorded yet.</p>
      ) : (
        <ol className="relative">
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-tertiary" aria-hidden="true" />
          {logs.map((log, index) => {
            const config    = AUDIT_ACTION_CONFIG[log.action];
            const dateLabel = new Date(log.createdAt).toLocaleString("en-GB", {
              day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
            });
            return (
              <li key={log.id} className={["relative flex gap-4 pl-6", index < logs.length - 1 ? "pb-5" : ""].join(" ")}>
                <span className="absolute left-0 top-1 w-[15px] h-[15px] rounded-full border-2 border-neutral flex items-center justify-center shrink-0"
                  style={{ background: "var(--color-tertiary)" }} aria-hidden="true">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                </span>
                <div className="flex-1 min-w-0 -mt-0.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${config?.color ?? "text-secondary"} ${config?.bg ?? "bg-surface"}`}>
                      {config?.label ?? log.action}
                    </span>
                    <span className="text-[11px] text-secondary shrink-0">{dateLabel}</span>
                  </div>
                  <p className="text-[12px] text-secondary leading-4 mt-1">
                    <span className="font-medium text-on-surface">{log.user?.name ?? "Unknown"}</span>
                    {log.details ? ` — ${log.details}` : ""}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
}
