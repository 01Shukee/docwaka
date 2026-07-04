// src/components/documents/FilePreview.tsx

"use client";

import { useState } from "react";
import { FileText, ImageIcon, ExternalLink, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface FilePreviewProps {
  fileUrl:    string;
  fileName?:  string;
  className?: string;
}

function getFileType(url: string): "pdf" | "image" | "unknown" {
  const lower = url.toLowerCase().split("?")[0];
  if (lower.endsWith(".pdf")) return "pdf";
  if (/\.(png|jpe?g|gif|webp|svg)$/.test(lower)) return "image";
  return "unknown";
}

/**
 * DESIGN.md: content is the focus. Preview fills available width cleanly
 * with rounded-md container and tertiary border. No heavy shadows.
 */
export default function FilePreview({
  fileUrl,
  fileName,
  className = "",
}: FilePreviewProps) {
  const [loadError, setLoadError] = useState(false);
  const fileType = getFileType(fileUrl);

  const displayName =
    fileName ?? fileUrl.split("/").pop()?.split("?")[0] ?? "Attachment";

  return (
    <Card padding="none" className={`overflow-hidden ${className}`}>
      {/* Header bar */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-tertiary">
        <div className="flex items-center gap-2 min-w-0">
          {fileType === "pdf" ? (
            <FileText size={15} className="text-secondary shrink-0" />
          ) : (
            <ImageIcon size={15} className="text-secondary shrink-0" />
          )}
          <span className="text-[13px] font-medium text-on-surface truncate">
            {displayName}
          </span>
        </div>

        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center gap-1 text-[12px] text-secondary hover:text-on-surface transition-colors"
          aria-label="Open file in new tab"
        >
          <ExternalLink size={13} />
          Open
        </a>
      </div>

      {/* Preview body */}
      <div className="bg-surface">
        {loadError ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-secondary">
            <AlertCircle size={24} strokeWidth={1.5} />
            <p className="text-[13px]">Preview unavailable</p>
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] text-primary underline underline-offset-2"
            >
              Open file directly
            </a>
          </div>
        ) : fileType === "pdf" ? (
          <iframe
            src={`${fileUrl}#view=FitH`}
            title={displayName}
            className="w-full"
            style={{ height: "480px", border: "none" }}
            onError={() => setLoadError(true)}
          />
        ) : fileType === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={fileUrl}
            alt={displayName}
            className="w-full object-contain max-h-[480px]"
            onError={() => setLoadError(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-secondary">
            <FileText size={24} strokeWidth={1.5} />
            <p className="text-[13px]">No preview available for this file type.</p>
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] text-primary underline underline-offset-2"
            >
              Download file
            </a>
          </div>
        )}
      </div>
    </Card>
  );
}
