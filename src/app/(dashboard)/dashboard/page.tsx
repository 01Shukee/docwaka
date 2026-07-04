// src/app/(dashboard)/dashboard/page.tsx

import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";
import { PageSection } from "@/components/layout/AppShell";
import { ROLE_LABELS } from "@/types/user";
import {
  Inbox,
  Send,
  CheckCircle2,
  Clock,
  FilePlus2,
  ArrowRight,
  FileText,
} from "lucide-react";
import type { Metadata } from "next";
import type { DocumentStatus } from "@/types/document";

export const metadata: Metadata = { title: "Dashboard" };

/**
 * FSD §4.3 — Dashboard overview.
 * Server component — fetches all stats in one pass, no client waterfalls.
 *
 * DESIGN.md: bento-style stat cards (card token), spacious layout,
 * generous vertical gaps, content-first — minimal chrome.
 */
export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  // ── Parallel data fetch ───────────────────────────────────────────────────
  const [
    inboxPending,
    inboxTotal,
    outboxTotal,
    outboxDelivered,
    recentInbox,
    recentOutbox,
  ] = await Promise.all([
    prisma.document.count({ where: { recipientId: userId, status: "PENDING" } }),
    prisma.document.count({ where: { recipientId: userId } }),
    prisma.document.count({ where: { senderId: userId } }),
    prisma.document.count({ where: { senderId: userId, status: "DELIVERED" } }),
    prisma.document.findMany({
      where:   { recipientId: userId },
      include: {
        sender: { select: { name: true, department: { select: { name: true } } } },
      },
      orderBy: { updatedAt: "desc" },
      take:    5,
    }),
    prisma.document.findMany({
      where:   { senderId: userId },
      include: {
        recipient: { select: { name: true, department: { select: { name: true } } } },
      },
      orderBy: { updatedAt: "desc" },
      take:    5,
    }),
  ]);

  const greeting = getGreeting();
  const firstName = session.user.name.split(" ")[0];

  return (
    <div>
      {/* ── Welcome band ───────────────────────────────────────────────── */}
      <div className="mb-10">
        <h1 className="text-[33px] font-normal leading-10 text-on-surface tracking-tight">
          {greeting}, {firstName}
        </h1>
        <p className="mt-1 text-[16px] leading-6 text-secondary">
          {ROLE_LABELS[session.user.role]} ·{" "}
          {new Date().toLocaleDateString("en-GB", {
            weekday: "long",
            day:     "numeric",
            month:   "long",
            year:    "numeric",
          })}
        </p>
      </div>

      {/* ── Stat cards ─────────────────────────────────────────────────── */}
      <PageSection>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            label="Pending in Inbox"
            value={inboxPending}
            icon={<Clock size={16} className="text-yellow-500" />}
            href="/documents?tab=inbox"
            urgent={inboxPending > 0}
          />
          <StatCard
            label="Total Received"
            value={inboxTotal}
            icon={<Inbox size={16} className="text-secondary" />}
            href="/documents?tab=inbox"
          />
          <StatCard
            label="Documents Sent"
            value={outboxTotal}
            icon={<Send size={16} className="text-secondary" />}
            href="/documents?tab=outbox"
          />
          <StatCard
            label="Delivered"
            value={outboxDelivered}
            icon={<CheckCircle2 size={16} className="text-emerald-500" />}
            href="/documents?tab=outbox"
          />
        </div>
      </PageSection>

      {/* ── Quick action ───────────────────────────────────────────────── */}
      <PageSection>
        <Link
          href="/documents/new"
          className={[
            "flex items-center justify-between gap-4",
            "p-5 bg-primary text-neutral rounded-md",
            "hover:opacity-90 transition-opacity group",
          ].join(" ")}
        >
          <div className="flex items-center gap-3">
            <FilePlus2 size={18} strokeWidth={1.75} />
            <div>
              <p className="text-[15px] font-semibold leading-5">
                Send a new document
              </p>
              <p className="text-[13px] leading-5 text-neutral/70 mt-0.5">
                Dispatch to any approved colleague
              </p>
            </div>
          </div>
          <ArrowRight
            size={16}
            className="shrink-0 opacity-60 group-hover:translate-x-1 transition-transform"
          />
        </Link>
      </PageSection>

      {/* ── Recent activity ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent inbox */}
        <PageSection title="Recent Inbox" subtitle="Latest documents received">
          {recentInbox.length === 0 ? (
            <EmptyListHint text="No documents received yet." />
          ) : (
            <div className="flex flex-col gap-2">
              {recentInbox.map((doc) => (
                <MiniDocRow
                  key={doc.id}
                  id={doc.id}
                  title={doc.title}
                  meta={`From ${doc.sender.name}`}
                  status={doc.status as DocumentStatus}
                  date={doc.updatedAt}
                />
              ))}
              <Link
                href="/documents?tab=inbox"
                className="mt-1 text-[13px] text-secondary hover:text-on-surface transition-colors flex items-center gap-1"
              >
                View all <ArrowRight size={12} />
              </Link>
            </div>
          )}
        </PageSection>

        {/* Recent outbox */}
        <PageSection title="Recent Outbox" subtitle="Latest documents you sent">
          {recentOutbox.length === 0 ? (
            <EmptyListHint text="No documents sent yet." />
          ) : (
            <div className="flex flex-col gap-2">
              {recentOutbox.map((doc) => (
                <MiniDocRow
                  key={doc.id}
                  id={doc.id}
                  title={doc.title}
                  meta={`To ${doc.recipient.name}`}
                  status={doc.status as DocumentStatus}
                  date={doc.updatedAt}
                />
              ))}
              <Link
                href="/documents?tab=outbox"
                className="mt-1 text-[13px] text-secondary hover:text-on-surface transition-colors flex items-center gap-1"
              >
                View all <ArrowRight size={12} />
              </Link>
            </div>
          )}
        </PageSection>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
  href,
  urgent = false,
}: {
  label:   string;
  value:   number;
  icon:    React.ReactNode;
  href:    string;
  urgent?: boolean;
}) {
  return (
    <Link href={href} className="block group">
      <Card
        hover
        className={urgent ? "border-yellow-200 bg-yellow-50/40" : ""}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-[12px] font-medium tracking-[0.04em] text-secondary uppercase">
            {label}
          </span>
          {icon}
        </div>
        <p
          className={[
            "text-[33px] font-normal leading-10 tracking-tight",
            urgent ? "text-yellow-700" : "text-on-surface",
          ].join(" ")}
        >
          {value}
        </p>
      </Card>
    </Link>
  );
}

function MiniDocRow({
  id,
  title,
  meta,
  status,
  date,
}: {
  id:     string;
  title:  string;
  meta:   string;
  status: DocumentStatus;
  date:   Date;
}) {
  const dateLabel = new Date(date).toLocaleDateString("en-GB", {
    day: "numeric", month: "short",
  });

  return (
    <Link
      href={`/documents/${id}`}
      className={[
        "flex items-center gap-3 px-3 py-2.5 rounded-md",
        "hover:bg-surface transition-colors group",
      ].join(" ")}
    >
      <div className="w-7 h-7 rounded-md bg-surface border border-tertiary flex items-center justify-center shrink-0">
        <FileText size={13} className="text-secondary" strokeWidth={1.5} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-on-surface truncate leading-5">
          {title}
        </p>
        <p className="text-[12px] text-secondary truncate leading-4">{meta}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <StatusBadge status={status} size="sm" />
        <span className="text-[11px] text-secondary hidden sm:block">{dateLabel}</span>
      </div>
    </Link>
  );
}

function EmptyListHint({ text }: { text: string }) {
  return (
    <div className="py-8 text-center">
      <p className="text-[13px] text-secondary">{text}</p>
    </div>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}
