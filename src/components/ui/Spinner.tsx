// src/components/ui/Spinner.tsx
import { IconLoader2 } from "@tabler/icons-react";

interface SpinnerProps { size?: "sm" | "md" | "lg"; className?: string; label?: string; }

const SIZE = { sm: 16, md: 24, lg: 32 };

export default function Spinner({ size = "md", className = "", label = "Loading…" }: SpinnerProps) {
  return (
    <span role="status" aria-label={label} className={`inline-block ${className}`}>
      <IconLoader2 size={SIZE[size]} stroke={1.5} className="animate-spin text-primary" />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function FullPageSpinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[320px] gap-3">
      <IconLoader2 size={28} stroke={1.5} className="animate-spin text-[#3B82F6]" />
      <p className="text-[14px] text-secondary">{label}</p>
    </div>
  );
}

export function InlineSpinner({ className = "" }: { className?: string }) {
  return <IconLoader2 size={16} stroke={1.5} className={`animate-spin text-current ${className}`} />;
}
