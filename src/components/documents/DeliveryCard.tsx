// src/components/documents/DeliveryCard.tsx

"use client";

import { useState } from "react";
import { IconPackage } from "@tabler/icons-react";
import { Card, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import type { DocumentDetail } from "@/types/document";

interface DeliveryCardProps {
  document:      DocumentDetail;
  currentUserId: string;
  onUpdate:      (updated: DocumentDetail) => void;
}

/**
 * FSD §4.7 — Delivery confirmation:
 *   Shown only when document.status === "ACCEPTED" and current user is recipient.
 *   Single CTA: "Confirm Delivery" → POST /api/documents/[id]/action { action: "DELIVER" }
 *   Transitions document to DELIVERED status.
 */
export default function DeliveryCard({
  document: doc,
  currentUserId,
  onUpdate,
}: DeliveryCardProps) {
  const { success, error: toastError } = useToast();
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  // Only render for the recipient when status is ACCEPTED
  if (doc.status !== "ACCEPTED" || doc.recipient.id !== currentUserId) {
    return null;
  }

  const handleDeliver = async () => {
    if (!confirmed) {
      setConfirmed(true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/documents/${doc.id}/action`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ action: "DELIVER" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to confirm delivery.");
      onUpdate(json.document as DocumentDetail);
      success("Delivery confirmed. Document is now marked as delivered.");
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Failed to confirm delivery.");
      setConfirmed(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-tertiary">
      <CardHeader
        title="Confirm Delivery"
        subtitle="Confirm that you have physically received this document."
      />

      {/* Confirmation prompt */}
      {confirmed && (
        <div className="mb-4 p-3 bg-surface rounded-md border border-tertiary">
          <p className="text-[13px] text-on-surface font-medium">
            Are you sure you want to confirm delivery?
          </p>
          <p className="text-[12px] text-secondary mt-0.5">
            This action cannot be undone.
          </p>
        </div>
      )}

      <div className="flex gap-2">
        {confirmed && (
          <Button
            variant="secondary"
            size="md"
            fullWidth
            onClick={() => setConfirmed(false)}
            disabled={loading}
          >
            Cancel
          </Button>
        )}
        <Button
          variant="primary"
          size="md"
          fullWidth
          loading={loading}
          leftIcon={<IconPackage stroke={1.5} size={14} />}
          onClick={handleDeliver}
        >
          {confirmed ? "Yes, Confirm Delivery" : "Confirm Delivery"}
        </Button>
      </div>
    </Card>
  );
}
