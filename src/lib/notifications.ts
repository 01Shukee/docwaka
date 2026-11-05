// src/lib/notifications.ts — maps app events to emails.
// Call inside `after(() => …)` so mail never delays or breaks the API response.

import { sendEmail } from "@/lib/email";
import { documentReceivedEmail, documentStatusEmail, accountDecisionEmail } from "@/lib/email-templates";

interface Party { name: string; email: string; department?: { name: string } }

export async function notifyDocumentDispatched(doc: {
  id: string; title: string; description: string | null; sender: Party; recipient: Party;
}) {
  const m = documentReceivedEmail({
    recipientName: doc.recipient.name,
    senderName:    doc.sender.name,
    senderDept:    doc.sender.department?.name ?? "",
    title:         doc.title,
    description:   doc.description,
    documentId:    doc.id,
  });
  await sendEmail({ to: doc.recipient.email, ...m });
}

export async function notifyDocumentAction(
  kind: "ACCEPTED" | "REJECTED" | "DELIVERED",
  doc: { id: string; title: string; sender: Party; recipient: Party },
  reason?: string
) {
  const m = documentStatusEmail({
    kind, reason,
    senderName:    doc.sender.name,
    recipientName: doc.recipient.name,
    title:         doc.title,
    documentId:    doc.id,
  });
  await sendEmail({ to: doc.sender.email, ...m });
}

export async function notifyAccountDecision(user: { name: string; email: string }, approved: boolean) {
  await sendEmail({ to: user.email, ...accountDecisionEmail({ name: user.name, approved }) });
}
