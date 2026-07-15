// src/components/ui/Toast.tsx
"use client";

import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { IconCircleCheck, IconCircleX, IconAlertTriangle, IconInfoCircle, IconX } from "@tabler/icons-react";
import { createPortal } from "react-dom";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast { id: string; type: ToastType; message: string; duration: number; }

interface ToastContextValue {
  toast:   (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string) => void;
  error:   (message: string) => void;
  warning: (message: string) => void;
  info:    (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_CONFIG: Record<ToastType, { icon: React.ElementType; iconClass: string; borderClass: string }> = {
  success: { icon: IconCircleCheck,   iconClass: "text-[#10B981]", borderClass: "border-l-[#10B981]" },
  error:   { icon: IconCircleX,       iconClass: "text-[#D92D20]", borderClass: "border-l-[#D92D20]" },
  warning: { icon: IconAlertTriangle, iconClass: "text-[#F59E0B]", borderClass: "border-l-[#F59E0B]" },
  info:    { icon: IconInfoCircle,    iconClass: "text-[#3B82F6]", borderClass: "border-l-[#3B82F6]" },
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const { icon: Icon, iconClass, borderClass } = TOAST_CONFIG[toast.type];
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => onRemove(toast.id), toast.duration);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [toast.id, toast.duration, onRemove]);

  return (
    <div role="status" aria-live="polite" className={`flex items-start gap-3 w-full max-w-sm px-4 py-3 rounded-md border border-tertiary border-l-4 bg-neutral shadow-md ${borderClass}`}>
      <Icon size={18} stroke={1.5} className={`shrink-0 mt-0.5 ${iconClass}`} />
      <p className="flex-1 text-[14px] leading-5 font-medium text-on-surface">{toast.message}</p>
      <button onClick={() => onRemove(toast.id)} aria-label="Dismiss" className="shrink-0 text-secondary hover:text-on-surface transition-colors">
        <IconX size={14} stroke={1.5} />
      </button>
    </div>
  );
}

function ToastPortal({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return createPortal(
    <div aria-label="Notifications" className="fixed bottom-6 right-4 sm:right-6 z-[100] flex flex-col gap-2 items-end pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto w-full sm:w-auto">
          <ToastItem toast={t} onRemove={onRemove} />
        </div>
      ))}
    </div>,
    document.body
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const remove = useCallback((id: string) => setToasts(prev => prev.filter(t => t.id !== id)), []);
  const add    = useCallback((message: string, type: ToastType = "info", duration = 4000) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev.slice(-4), { id, type, message, duration }]);
  }, []);

  const ctx: ToastContextValue = {
    toast:   add,
    success: m => add(m, "success"),
    error:   m => add(m, "error"),
    warning: m => add(m, "warning"),
    info:    m => add(m, "info"),
  };

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      <ToastPortal toasts={toasts} onRemove={remove} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}
