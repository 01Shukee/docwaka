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
  IconInbox, IconSend, IconCircleCheck, IconClock,
  IconFilePlus, IconArrowRight, IconFileText,
} from "@tabler/icons-react";
import type { Metadata } from "next";
import type { DocumentStatus } from "@/types/document";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const [
    inboxPending, inboxTotal, outboxTotal, outboxDelivered,
    recentInbox,  recentOutbox,
  ] = await Promise.all([
    prisma.document.count({ where: { recipientId: userId, status: "PENDING"   } }),
    prisma.document.count({ where: { recipientId: userId                       } }),
    prisma.document.count({ where: { senderId:    userId                       } }),
    prisma.document.count({ where: { senderId:    userId, status: "DELIVERED"  } }),
    prisma.document.findMany({
      where: { recipientId: userId },
      include: { sender: { select: { name: true, department: { select: { name: true } } } } },
      orderBy: { updatedAt: "desc" }, take: 5,
    }),
    prisma.document.findMany({
      where: { senderId: userId },
      include: { recipient: { select: { name: true, department: { select: { name: true } } } } },
      orderBy: { updatedAt: "desc" }, take: 5,
    }),
  ]);

  const firstName = session.user.name.split(" ")[0];

  return (
    <div>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-[24px] sm:text-[30px] font-normal leading-tight text-on-surface tracking-tight">
          {getGreeting()}, {firstName}
        </h1>
        <p className="mt-1 text-[13px] sm:text-[14px] text-secondary">
          {ROLE_LABELS[session.user.role]} ·{" "}
          {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Stat cards — 2×2 on mobile, 4×1 on lg — each with a complementary accent tint */}
      <PageSection>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          {/* Pending — amber */}
          <Link href="/documents?tab=inbox" className="block group">
            <div className={`rounded-md border p-3 sm:p-4 transition-shadow duration-150 group-hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)] ${inboxPending > 0 ? "bg-[#FFFBEB] border-[#FEF3C7]" : "bg-neutral border-tertiary"}`}>
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <span className="text-[10px] sm:text-[11px] font-semibold tracking-[0.06em] text-secondary uppercase truncate pr-1">Pending</span>
                <IconClock size={14} stroke={1.5} className={inboxPending > 0 ? "text-[#F59E0B]" : "text-secondary"} />
              </div>
              <p className={`text-[28px] sm:text-[32px] font-normal leading-none tracking-tight ${inboxPending > 0 ? "text-[#B45309]" : "text-on-surface"}`}>{inboxPending}</p>
            </div>
          </Link>

          {/* Received — blue */}
          <Link href="/documents?tab=inbox" className="block group">
            <div className="bg-[#EFF6FF] border border-[#DBEAFE] rounded-md p-3 sm:p-4 transition-shadow duration-150 group-hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <span className="text-[10px] sm:text-[11px] font-semibold tracking-[0.06em] text-secondary uppercase truncate pr-1">Received</span>
                <IconInbox size={14} stroke={1.5} className="text-[#3B82F6]" />
              </div>
              <p className="text-[28px] sm:text-[32px] font-normal leading-none tracking-tight text-[#1D4ED8]">{inboxTotal}</p>
            </div>
          </Link>

          {/* Sent — neutral */}
          <Link href="/documents?tab=outbox" className="block group">
            <div className="bg-neutral border border-tertiary rounded-md p-3 sm:p-4 transition-shadow duration-150 group-hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <span className="text-[10px] sm:text-[11px] font-semibold tracking-[0.06em] text-secondary uppercase truncate pr-1">Sent</span>
                <IconSend size={14} stroke={1.5} className="text-secondary" />
              </div>
              <p className="text-[28px] sm:text-[32px] font-normal leading-none tracking-tight text-on-surface">{outboxTotal}</p>
            </div>
          </Link>

          {/* Delivered — emerald */}
          <Link href="/documents?tab=outbox" className="block group">
            <div className="bg-[#ECFDF5] border border-[#D1FAE5] rounded-md p-3 sm:p-4 transition-shadow duration-150 group-hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <span className="text-[10px] sm:text-[11px] font-semibold tracking-[0.06em] text-secondary uppercase truncate pr-1">Delivered</span>
                <IconCircleCheck size={14} stroke={1.5} className="text-[#10B981]" />
              </div>
              <p className="text-[28px] sm:text-[32px] font-normal leading-none tracking-tight text-[#047857]">{outboxDelivered}</p>
            </div>
          </Link>
        </div>
      </PageSection>

      {/* Quick action */}
      <PageSection>
        <Link href="/documents/new" className="flex items-center justify-between gap-4 p-4 sm:p-5 bg-primary text-neutral rounded-md hover:opacity-90 transition-opacity group">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-white/10 flex items-center justify-center shrink-0">
              <IconFilePlus size={16} stroke={1.5} />
            </div>
            <div>
              <p className="text-[14px] sm:text-[15px] font-semibold leading-5">Send a new document</p>
              <p className="text-[12px] leading-4 text-neutral/60 mt-0.5 hidden sm:block">Dispatch to any approved colleague</p>
            </div>
          </div>
          <IconArrowRight size={16} stroke={1.5} className="shrink-0 opacity-50 group-hover:translate-x-1 transition-transform" />
        </Link>
      </PageSection>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PageSection title="Recent Inbox" subtitle="Latest documents received">
          {recentInbox.length === 0
            ? <EmptyHint text="No documents received yet." />
            : <div className="flex flex-col gap-0.5">
                {recentInbox.map(doc => (
                  <MiniDocRow key={doc.id} id={doc.id} title={doc.title}
                    meta={`From ${doc.sender.name}`} status={doc.status as DocumentStatus} date={doc.updatedAt} />
                ))}
                <Link href="/documents?tab=inbox"
                  className="mt-2 text-[12px] text-[#3B82F6] hover:text-[#2563EB] transition-colors flex items-center gap-1 font-medium">
                  View all <IconArrowRight size={11} stroke={1.5} />
                </Link>
              </div>
          }
        </PageSection>
        <PageSection title="Recent Outbox" subtitle="Latest documents you sent">
          {recentOutbox.length === 0
            ? <EmptyHint text="No documents sent yet." />
            : <div className="flex flex-col gap-0.5">
                {recentOutbox.map(doc => (
                  <MiniDocRow key={doc.id} id={doc.id} title={doc.title}
                    meta={`To ${doc.recipient.name}`} status={doc.status as DocumentStatus} date={doc.updatedAt} />
                ))}
                <Link href="/documents?tab=outbox"
                  className="mt-2 text-[12px] text-[#3B82F6] hover:text-[#2563EB] transition-colors flex items-center gap-1 font-medium">
                  View all <IconArrowRight size={11} stroke={1.5} />
                </Link>
              </div>
          }
        </PageSection>
      </div>
    </div>
  );
}

function MiniDocRow({ id, title, meta, status, date }: { id: string; title: string; meta: string; status: DocumentStatus; date: Date }) {
  const dateLabel = new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  return (
    <Link href={`/documents/${id}`}
      className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2.5 rounded-md hover:bg-surface transition-colors">
      <div className="w-7 h-7 rounded-md bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center shrink-0">
        <IconFileText size={13} stroke={1.5} className="text-[#3B82F6]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-on-surface truncate leading-5">{title}</p>
        <p className="text-[11px] text-secondary truncate leading-4">{meta}</p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <StatusBadge status={status} size="sm" />
        <span className="text-[10px] text-secondary hidden sm:block">{dateLabel}</span>
      </div>
    </Link>
  );
}

function EmptyHint({ text }: { text: string }) {
  return <div className="py-6 text-center"><p className="text-[13px] text-secondary">{text}</p></div>;
}

function getGreeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}
