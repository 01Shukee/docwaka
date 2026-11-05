// src/lib/email-templates.ts — plain, inbox-safe HTML (tables + inline styles)

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const appUrl = () =>
  (process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000").replace(/\/$/, "");

interface Mail { subject: string; html: string; text: string }

function layout(opts: {
  subject: string; heading: string; intro: string;
  rows?: [string, string][]; note?: string; cta?: { label: string; url: string };
}): Mail {
  const rows = (opts.rows ?? [])
    .map(([k, v]) => `<tr><td style="padding:6px 12px 6px 0;color:#6b7280;font-size:13px;vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="padding:6px 0;color:#141414;font-size:14px">${esc(v)}</td></tr>`)
    .join("");

  const html = `<!doctype html><html><body style="margin:0;background:#f4f4f5;padding:24px 12px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="100%" style="max-width:520px;background:#fff;border-radius:12px;border:1px solid #e5e7eb" cellpadding="0" cellspacing="0"><tr><td style="padding:28px">
<p style="margin:0 0 20px;font-size:18px;font-weight:700;color:#141414">docwaka.</p>
<h1 style="margin:0 0 8px;font-size:20px;font-weight:600;color:#141414">${esc(opts.heading)}</h1>
<p style="margin:0 0 18px;font-size:14px;line-height:22px;color:#374151">${opts.intro}</p>
${rows ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 18px">${rows}</table>` : ""}
${opts.note ? `<p style="margin:0 0 18px;padding:12px;background:#f9fafb;border-radius:8px;font-size:13px;line-height:20px;color:#374151">${esc(opts.note)}</p>` : ""}
${opts.cta ? `<a href="${esc(opts.cta.url)}" style="display:inline-block;padding:11px 22px;background:#141414;color:#fff;text-decoration:none;border-radius:999px;font-size:14px;font-weight:600">${esc(opts.cta.label)}</a>` : ""}
<p style="margin:24px 0 0;font-size:12px;color:#9ca3af">Federal University of Technology Owerri · Document Workflow &amp; Tracking<br>You received this because of activity on your docwaka. account.</p>
</td></tr></table></td></tr></table></body></html>`;

  const text = [
    opts.heading, "", opts.intro.replace(/<[^>]+>/g, ""), "",
    ...(opts.rows ?? []).map(([k, v]) => `${k}: ${v}`),
    ...(opts.note ? ["", opts.note] : []),
    ...(opts.cta ? ["", `${opts.cta.label}: ${opts.cta.url}`] : []),
  ].join("\n");

  return { subject: opts.subject, html, text };
}

export function documentReceivedEmail(p: {
  recipientName: string; senderName: string; senderDept: string;
  title: string; description?: string | null; documentId: string;
}): Mail {
  return layout({
    subject: `New document: ${p.title}`,
    heading: "You have a new document",
    intro: `Hello ${esc(p.recipientName)}, <strong>${esc(p.senderName)}</strong> (${esc(p.senderDept)}) has sent you a document that needs your attention.`,
    rows: [["Title", p.title], ["From", `${p.senderName} — ${p.senderDept}`]],
    note: p.description ?? undefined,
    cta: { label: "Review document", url: `${appUrl()}/documents/${p.documentId}` },
  });
}

export function documentStatusEmail(p: {
  kind: "ACCEPTED" | "REJECTED" | "DELIVERED";
  senderName: string; recipientName: string; title: string; documentId: string; reason?: string;
}): Mail {
  const verb = { ACCEPTED: "accepted", REJECTED: "rejected", DELIVERED: "marked as delivered" }[p.kind];
  return layout({
    subject: `Document ${verb}: ${p.title}`,
    heading: `Your document was ${verb}`,
    intro: `Hello ${esc(p.senderName)}, <strong>${esc(p.recipientName)}</strong> has ${verb} your document.`,
    rows: [["Title", p.title], ["Status", p.kind.charAt(0) + p.kind.slice(1).toLowerCase()]],
    note: p.kind === "REJECTED" && p.reason ? `Reason: ${p.reason}` : undefined,
    cta: { label: "View document", url: `${appUrl()}/documents/${p.documentId}` },
  });
}

export function accountDecisionEmail(p: { name: string; approved: boolean }): Mail {
  return p.approved
    ? layout({
        subject: "Your docwaka. account has been approved",
        heading: "Account approved",
        intro: `Hello ${esc(p.name)}, your account has been approved. You can now sign in and start sending and receiving documents.`,
        cta: { label: "Sign in", url: `${appUrl()}/login` },
      })
    : layout({
        subject: "Your docwaka. account was not approved",
        heading: "Account not approved",
        intro: `Hello ${esc(p.name)}, your registration was not approved. Please contact your administrator for details.`,
      });
}
