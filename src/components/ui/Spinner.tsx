// src/components/ui/Spinner.tsx

interface SpinnerProps {
  size?:      "sm" | "md" | "lg";
  className?: string;
  label?:     string;
}

const SIZE_MAP = {
  sm: "w-4 h-4 border-[1.5px]",
  md: "w-6 h-6 border-2",
  lg: "w-8 h-8 border-2",
};

/**
 * Minimal spinner using a CSS border animation.
 * Uses primary (#141414) colour so it sits on white surfaces (DESIGN.md).
 */
export default function Spinner({
  size      = "md",
  className = "",
  label     = "Loading…",
}: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={`inline-block ${className}`}
    >
      <span
        className={[
          "block rounded-full border-primary/20 border-t-primary animate-spin",
          SIZE_MAP[size],
        ].join(" ")}
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}

// ── FullPageSpinner ───────────────────────────────────────────────────────────

export function FullPageSpinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[320px] gap-3">
      <Spinner size="lg" label={label} />
      <p className="text-[14px] text-secondary">{label}</p>
    </div>
  );
}

// ── InlineSpinner — for button loading states ─────────────────────────────────

export function InlineSpinner({ className = "" }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block w-4 h-4 rounded-full border-[1.5px] border-current/30 border-t-current animate-spin ${className}`}
    />
  );
}
