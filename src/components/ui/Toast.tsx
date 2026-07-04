// src/components/ui/Toast.tsx

"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { CheckCircle2, XCircle, AlertCircle, Info, X } from "lucide-react";
import { createPortal } from "react-dom";

// ── Types ─────────────────────────────────────────────────────────────────────

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id:       string;
  type:     ToastType;
  message:  string;
  duration: number;
}

interface ToastContextValue {
  toast:   (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string) => void;
  error:   (message: string) => void;
  warning: (message: string) => void;
  info:    (message: string) => void;
}

// ── Context ───────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

// ── Config ────────────────────────────────────────────────────────────────────

const TOAST_CONFIG: Record<
  ToastType,
  { icon: React.ElementType; iconColor: string }
> = {
  success: { icon: CheckCircle2, iconColor: "text-emerald-500" },
  error:   { icon: XCircle,      iconColor: "text-error"       },
  warning: { icon: AlertCircle,  iconColor: "text-yellow-500"  },
  info:    { icon: Info,         iconColor: "text-blue-500"    },
};

// ── Single Toast Item ─────────────────────────────────────────────────────────

function ToastItem({
  toast,
  onRemove,
}: {
  toast:    Toast;
  onRemove: (id: string) => void;
}) {
  const { icon: Icon, iconColor } = TOAST_CONFIG[toast.type];
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => onRemove(toast.id), toast.duration);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [toast.id, toast.duration, onRemove]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-start gap-3 w-full max-w-sm px-4 py-3 rounded-md border border-tertiary bg-neutral shadow-md"
    >
      <Icon size={18} className={`shrink-0 mt-0.5 ${iconColor}`} />
      <p className="flex-1 text-[14px] leading-5 font-medium text-on-surface">
        {toast.message}
      </p>
      <button
        onClick={() => onRemove(toast.id)}
        aria-label="Dismiss"
        className="shrink-0 text-secondary hover:text-on-surface transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
}

// ── Portal wrapper — only renders after client mount ─────────────────────────

function ToastPortal({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      aria-label="Notifications"
      className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 items-end pointer-events-none"
    >
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} onRemove={onRemove} />
        </div>
      ))}
    </div>,
    document.body
  );
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const add = useCallback(
    (message: string, type: ToastType = "info", duration = 4000) => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev.slice(-4), { id, type, message, duration }]);
    },
    []
  );

  const ctx: ToastContextValue = {
    toast:   add,
    success: (m) => add(m, "success"),
    error:   (m) => add(m, "error"),
    warning: (m) => add(m, "warning"),
    info:    (m) => add(m, "info"),
  };

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      <ToastPortal toasts={toasts} onRemove={remove} />
    </ToastContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}