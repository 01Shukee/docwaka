// src/app/(dashboard)/documents/new/page.tsx

"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, Send, Paperclip, X } from "lucide-react";
import Button from "@/components/ui/Button";
import Input, { FormField, Textarea } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { ROLE_LABELS } from "@/types/user";
import type { Metadata } from "next";

/**
 * FSD §4.2 / §5.2 — New document form.
 *
 * Fields:
 *   - Title (required)
 *   - Description (optional)
 *   - Recipient (searchable list of approved users — required)
 *   - File attachment (optional, UploadThing)
 *
 * On submit: POST /api/documents → redirect to /documents/[id]
 *
 * DESIGN.md: card-wrapped form, pill inputs, surface search field,
 * recipient picker in a bordered card, secondary helper text.
 */

interface Recipient {
  id:         string;
  name:       string;
  email:      string;
  role:       string;
  department: { id: string; name: string };
}

export default function NewDocumentPage() {
  const router                        = useRouter();
  const { success, error: toastError } = useToast();

  const [title,       setTitle]       = useState("");
  const [description, setDescription] = useState("");
  const [fileUrl,     setFileUrl]     = useState<string | null>(null);
  const [fileName,    setFileName]    = useState<string | null>(null);
  const [uploading,   setUploading]   = useState(false);

  const [recipients,    setRecipients]    = useState<Recipient[]>([]);
  const [recipientsLoading, setRecipientsLoading] = useState(true);
  const [search,        setSearch]        = useState("");
  const [selected,      setSelected]      = useState<Recipient | null>(null);

  const [errors,  setErrors]  = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // ── Load recipients ───────────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/recipients")
      .then((r) => r.json())
      .then((d) => setRecipients(d.recipients ?? []))
      .catch(() => {})
      .finally(() => setRecipientsLoading(false));
  }, []);

  // ── Filter recipients by search ───────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search.trim()) return recipients;
    const q = search.toLowerCase();
    return recipients.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.department.name.toLowerCase().includes(q)
    );
  }, [recipients, search]);

  // ── File upload (UploadThing — native input fallback for now) ─────────────
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["application/pdf", "image/png", "image/jpeg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toastError("Only PDF and image files (PNG, JPG, WebP) are accepted.");
      return;
    }

    const maxSize = file.type === "application/pdf" ? 16 * 1024 * 1024 : 4 * 1024 * 1024;
    if (file.size > maxSize) {
      toastError(
        file.type === "application/pdf"
          ? "PDF files must be under 16 MB."
          : "Image files must be under 4 MB."
      );
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res  = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Upload failed.");

      setFileUrl(data.fileUrl);
      setFileName(file.name);
      success("File attached successfully.");
    } catch (err) {
      toastError(err instanceof Error ? err.message : "File upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim())  errs.title     = "Document title is required.";
    if (!selected)      errs.recipient = "Please select a recipient.";
    return errs;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/documents", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title:       title.trim(),
          description: description.trim() || undefined,
          recipientId: selected!.id,
          fileUrl:     fileUrl ?? undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to send document.");

      success("Document dispatched successfully.");
      router.push(`/documents/${data.document.id}`);
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Failed to send document.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      {/* ── Page heading ─────────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-[26px] font-normal leading-[31px] text-on-surface">
          Send a document
        </h1>
        <p className="mt-1 text-[14px] leading-5 text-secondary">
          Complete the form below to dispatch a document to a colleague.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">

        {/* ── Document details ───────────────────────────────────────── */}
        <Card padding="lg">
          <h2 className="text-[15px] font-semibold text-on-surface mb-4">
            Document details
          </h2>
          <div className="flex flex-col gap-4">
            <FormField
              label="Title"
              htmlFor="title"
              required
              error={errors.title}
            >
              <Input
                id="title"
                type="text"
                placeholder="e.g. Staff Leave Application — January 2025"
                value={title}
                onChange={(e) => { setTitle(e.target.value); setErrors((p) => ({ ...p, title: "" })); }}
                disabled={loading}
                error={!!errors.title}
              />
            </FormField>

            <FormField
              label="Description"
              htmlFor="description"
              hint="Optional — provide context for the recipient."
            >
              <Textarea
                id="description"
                placeholder="Additional notes or context about this document…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                rows={3}
              />
            </FormField>
          </div>
        </Card>

        {/* ── Attachment ─────────────────────────────────────────────── */}
        <Card padding="lg">
          <h2 className="text-[15px] font-semibold text-on-surface mb-1">
            Attachment
          </h2>
          <p className="text-[13px] text-secondary mb-4">
            Optional — PDF (max 16 MB) or image (max 4 MB).
          </p>

          {fileUrl ? (
            <div className="flex items-center gap-3 px-4 py-3 bg-surface border border-tertiary rounded-md">
              <Paperclip size={14} className="text-secondary shrink-0" />
              <span className="flex-1 text-[13px] text-on-surface truncate">
                {fileName}
              </span>
              <button
                type="button"
                onClick={() => { setFileUrl(null); setFileName(null); }}
                className="text-secondary hover:text-error transition-colors"
                aria-label="Remove attachment"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <label className={[
              "flex items-center justify-center gap-2",
              "h-[40px] px-4 bg-surface border border-tertiary rounded-full",
              "text-[14px] text-secondary cursor-pointer",
              "hover:border-primary hover:text-on-surface transition-colors",
              uploading ? "opacity-50 pointer-events-none" : "",
            ].join(" ")}>
              <Paperclip size={14} />
              {uploading ? "Uploading…" : "Attach file"}
              <input
                type="file"
                accept=".pdf,image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={handleFileChange}
                disabled={uploading || loading}
              />
            </label>
          )}
        </Card>

        {/* ── Recipient ──────────────────────────────────────────────── */}
        <Card padding="lg">
          <h2 className="text-[15px] font-semibold text-on-surface mb-1">
            Recipient
          </h2>
          <p className="text-[13px] text-secondary mb-4">
            Search and select who should receive this document.
          </p>

          {errors.recipient && (
            <p className="mb-3 text-[12px] text-error font-medium">{errors.recipient}</p>
          )}

          {/* Selected recipient badge */}
          {selected && (
            <div className="flex items-center gap-3 px-4 py-3 mb-3 bg-surface border border-primary/20 rounded-md">
              <div className="w-7 h-7 rounded-full bg-primary text-neutral flex items-center justify-center shrink-0">
                <span className="text-[10px] font-semibold">
                  {selected.name.split(" ").slice(0, 2).map((n) => n[0]).join("")}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-on-surface truncate">{selected.name}</p>
                <p className="text-[12px] text-secondary truncate">
                  {ROLE_LABELS[selected.role as keyof typeof ROLE_LABELS]} · {selected.department.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setSelected(null); setSearch(""); }}
                className="text-secondary hover:text-error transition-colors"
                aria-label="Clear recipient"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Search input */}
          {!selected && (
            <>
              <Input
                type="text"
                placeholder="Search by name, email or department…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setErrors((p) => ({ ...p, recipient: "" })); }}
                disabled={loading}
                leftSlot={<Search size={14} />}
              />

              {/* Results */}
              <div className="mt-2 max-h-56 overflow-y-auto border border-tertiary rounded-md divide-y divide-tertiary">
                {recipientsLoading ? (
                  <p className="px-4 py-3 text-[13px] text-secondary">
                    Loading recipients…
                  </p>
                ) : filtered.length === 0 ? (
                  <p className="px-4 py-3 text-[13px] text-secondary">
                    {search ? "No users match your search." : "No approved users found."}
                  </p>
                ) : (
                  filtered.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => { setSelected(r); setSearch(""); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface transition-colors text-left"
                    >
                      <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-semibold">
                          {r.name.split(" ").slice(0, 2).map((n) => n[0]).join("")}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-on-surface truncate">{r.name}</p>
                        <p className="text-[12px] text-secondary truncate">
                          {ROLE_LABELS[r.role as keyof typeof ROLE_LABELS]} · {r.department.name}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </Card>

        {/* ── Actions ────────────────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            leftIcon={<Send size={14} />}
          >
            Send document
          </Button>
        </div>
      </form>
    </div>
  );
}