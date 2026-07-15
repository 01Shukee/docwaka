// src/components/ui/Modal.tsx
"use client";

import { useEffect, useRef } from "react";
import { IconX } from "@tabler/icons-react";
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
  sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg", xl: "max-w-2xl",
};

export default function Modal({ open, onClose, title, children, size = "md", hideClose = false, className = "" }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (open && panelRef.current) panelRef.current.focus();
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div ref={overlayRef} role="dialog" aria-modal="true" aria-labelledby={title ? "modal-title" : undefined}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={e => { if (e.target === overlayRef.current) onClose(); }}>
      <div className="absolute inset-0 bg-primary/40 backdrop-blur-[2px]" aria-hidden="true" />
      <div ref={panelRef} tabIndex={-1}
        className={[
          "relative w-full bg-neutral border border-tertiary outline-none overflow-hidden",
          "rounded-t-xl sm:rounded-xl",
          "animate-[fadeScaleIn_180ms_ease-out]",
          SIZE_MAP[size], className,
        ].filter(Boolean).join(" ")}>
        {(title || !hideClose) && (
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-tertiary">
            {title && <h2 id="modal-title" className="text-[16px] font-semibold leading-5 text-on-surface">{title}</h2>}
            {!hideClose && (
              <button onClick={onClose} aria-label="Close modal"
                className="ml-auto p-1.5 rounded-md text-secondary hover:bg-surface hover:text-on-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                <IconX size={16} stroke={1.5} />
              </button>
            )}
          </div>
        )}
        <div className="px-5 sm:px-6 py-5">{children}</div>
      </div>
    </div>,
    document.body
  );
}

export function ModalFooter({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex items-center justify-end gap-3 px-5 sm:px-6 py-4 border-t border-tertiary ${className}`}>
      {children}
    </div>
  );
}
