// src/components/documents/ActionCard.tsx

"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Pen, AlertTriangle } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { FieldError } from "@/components/ui/Input";
import SignaturePad from "./SignaturePad";
import { useToast } from "@/components/ui/Toast";
import type { DocumentDetail } from "@/types/document";

interface ActionCardProps {
  document:    DocumentDetail;
  currentUserId: string;
  currentUserName: string;
  onUpdate:    (updated: DocumentDetail) => void;
}

/**
 * FSD §4.5 — Recipient action panel:
 *   1. Sign → opens SignaturePad, POSTs to /sign
 *   2. Accept (only enabled after signature) → POSTs { action: "ACCEPT" }
 *   3. Reject → expands reason textarea, POSTs { action: "REJECT", reason }
 *
 * DESIGN.md: card token, white surface, pill buttons,
 * destructive actions use error (#D92D20) — remain rare.
 */
export default function ActionCard({
  document: doc,
  currentUserId,
  currentUserName,
  onUpdate,
}: ActionCardProps) {
  const { success, error: toastError } = useToast();

  const [sigPadOpen, setSigPadOpen]   = useState(false);
  const [sigLoading, setSigLoading]   = useState(false);
  const [hasSigned, setHasSigned]     = useState(
    doc.signatures.some((s) => s.user.id === currentUserId)
  );

  const [rejectOpen, setRejectOpen]   = useState(false);
  const [reason, setReason]           = useState("");
  const [reasonError, setReasonError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // ── Signature submission ──────────────────────────────────────────────────

  const handleSign = async (dataUrl: string) => {
    setSigLoading(true);
    try {
      const res = await fetch(`/api/documents/${doc.id}/sign`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ data: dataUrl }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to save signature.");
      setHasSigned(true);
      setSigPadOpen(false);
      success("Signature saved. You can now accept the document.");
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Failed to save signature.");
    } finally {
      setSigLoading(false);
    }
  };

  // ── Document action (accept / reject) ─────────────────────────────────────

  const handleAction = async (action: "ACCEPT" | "REJECT") => {
    if (action === "REJECT") {
      if (reason.trim().length < 10) {
        setReasonError("Please provide a reason of at least 10 characters.");
        return;
      }
      setReasonError("");
    }

    setActionLoading(true);
    try {
      const body =
        action === "REJECT"
          ? { action, reason: reason.trim() }
          : { action };

      const res = await fetch(`/api/documents/${doc.id}/action`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Action failed.");

      onUpdate(json.document as DocumentDetail);
      success(action === "ACCEPT" ? "Document accepted." : "Document rejected.");
      setRejectOpen(false);
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Action failed.");
    } finally {
      setActionLoading(false);
    }
  };

  if (doc.status !== "PENDING") return null;

  return (
    <>
      <Card className="border-tertiary">
        <CardHeader
          title="Action Required"
          subtitle="Review this document and sign before accepting or rejecting."
        />

        {/* Signature status */}
        <div className="flex items-center gap-2 mb-4 text-[13px]">
          {hasSigned ? (
            <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
              <CheckCircle2 size={14} />
              Signature captured
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-secondary">
              <AlertTriangle size={14} className="text-yellow-500" />
              Signature required before accepting
            </span>
          )}
        </div>

        {/* Sign button */}
        {!hasSigned && (
          <Button
            variant="secondary"
            size="md"
            fullWidth
            leftIcon={<Pen size={14} />}
            onClick={() => setSigPadOpen(true)}
            className="mb-3"
          >
            {hasSigned ? "Re-sign" : "Sign Document"}
          </Button>
        )}

        {hasSigned && (
          <button
            onClick={() => setSigPadOpen(true)}
            className="text-[12px] text-secondary hover:text-on-surface underline underline-offset-2 mb-3 block"
          >
            Re-sign
          </button>
        )}

        {/* Accept / Reject actions */}
        <div className="flex gap-2">
          <Button
            variant="primary"
            size="md"
            fullWidth
            disabled={!hasSigned || actionLoading}
            loading={actionLoading && !rejectOpen}
            leftIcon={<CheckCircle2 size={14} />}
            onClick={() => handleAction("ACCEPT")}
          >
            Accept
          </Button>

          <Button
            variant="danger"
            size="md"
            fullWidth
            disabled={actionLoading}
            leftIcon={<XCircle size={14} />}
            onClick={() => setRejectOpen((v) => !v)}
          >
            Reject
          </Button>
        </div>

        {/* Rejection reason panel — expands inline */}
        {rejectOpen && (
          <div className="mt-4 pt-4 border-t border-tertiary">
            <p className="text-[13px] font-medium text-on-surface mb-2">
              Reason for rejection
            </p>
            <Textarea
              placeholder="Describe why this document is being rejected…"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (reasonError) setReasonError("");
              }}
              rows={3}
              error={!!reasonError}
            />
            <FieldError message={reasonError} />
            <div className="mt-3 flex justify-end gap-2">
              <Button
                variant="secondary"
                size="md"
                onClick={() => { setRejectOpen(false); setReason(""); setReasonError(""); }}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="md"
                loading={actionLoading && rejectOpen}
                onClick={() => handleAction("REJECT")}
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Signature pad modal */}
      <SignaturePad
        open={sigPadOpen}
        onClose={() => setSigPadOpen(false)}
        onConfirm={handleSign}
        signerName={currentUserName}
        loading={sigLoading}
      />
    </>
  );
}
