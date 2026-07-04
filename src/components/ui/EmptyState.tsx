// src/components/ui/EmptyState.tsx

import type { LucideIcon } from "lucide-react";
import Button from "./Button";

interface EmptyStateProps {
  icon?:        LucideIcon;
  title:        string;
  description?: string;
  action?:      {
    label:   string;
    onClick: () => void;
    icon?:   React.ReactNode;
  };
  className?:   string;
}

/**
 * DESIGN.md: content remains the focus.
 * Empty states are calm, minimal — icon in surface container,
 * muted secondary copy, single optional primary CTA.
 */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={[
        "flex flex-col items-center justify-center text-center",
        "py-16 px-6 min-h-[280px]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {Icon && (
        <div className="mb-4 w-12 h-12 rounded-full bg-surface border border-tertiary flex items-center justify-center">
          <Icon size={20} className="text-secondary" strokeWidth={1.5} />
        </div>
      )}

      <h3 className="text-[16px] font-semibold leading-5 text-on-surface mb-1">
        {title}
      </h3>

      {description && (
        <p className="text-[14px] leading-5 text-secondary max-w-xs mt-1">
          {description}
        </p>
      )}

      {action && (
        <div className="mt-5">
          <Button
            variant="primary"
            size="md"
            onClick={action.onClick}
            leftIcon={action.icon}
          >
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
}
