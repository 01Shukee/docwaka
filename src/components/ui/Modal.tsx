// src/components/ui/Modal.tsx

"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

interface ModalProps {
  open:       boolean;
  onClose:    () => void;
  title?:     string;
  children:   React.ReactNode;
  size?:      "sm" | "md" | "lg" | "xl";
  hideClose?: boolean;
  className?: string;
}

const SIZE_MAP: Record<NonNullable<ModalProps["size"]>, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
};

/**
 * Accessible modal dialog.
 *
 * DESIGN.md alignment:
 *   - White surface (#FFFFFF) with border-tertiary (#E5E7EB)
 *   - rounded-xl (24px) for large overlay containers
 *   - Soft backdrop blur instead of dramatic shadow
 *   - Typography follows label-lg / body-md scale
 */
export default function Modal({
  open,
  onClose,
  title,
  children,
  size      = "md",
  hideClose = false,
  className = "",
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef   = useRef<HTMLDivElement>(null);

  // ── ESC key dismiss ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // ── Body scroll lock ─────────────────────────────────────────────────────
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // ── Focus trap — move focus to panel on open ──────────────────────────────
  useEffect(() => {
    if (open && panelRef.current) {
      panelRef.current.focus();
    }
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        // Close when clicking the backdrop, not the panel
        if (e.target === overlayRef.current) onClose();
      }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-primary/40 backdrop-blur-[2px]"
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className={[
          "relative w-full bg-neutral border border-tertiary rounded-xl shadow-lg",
          "outline-none overflow-hidden",
          "animate-[fadeScaleIn_180ms_ease-out]",
          SIZE_MAP[size],
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={{
          // CSS animation defined in globals.css
        }}
      >
        {/* Header */}
        {(title || !hideClose) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-tertiary">
            {title && (
              <h2
                id="modal-title"
                className="text-[16px] font-semibold leading-5 text-on-surface"
              >
                {title}
              </h2>
            )}
            {!hideClose && (
              <button
                onClick={onClose}
                aria-label="Close modal"
                className={[
                  "ml-auto p-1.5 rounded-md text-secondary",
                  "hover:bg-surface hover:text-on-surface",
                  "transition-colors duration-100",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                ].join(" ")}
              >
                <X size={16} />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>,
    document.body
  );
}

// ── ModalFooter ───────────────────────────────────────────────────────────────

export function ModalFooter({
  children,
  className = "",
}: {
  children:   React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-end gap-3 px-6 py-4 border-t border-tertiary ${className}`}
    >
      {children}
    </div>
  );
}
