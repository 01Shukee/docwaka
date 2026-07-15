// src/components/ui/EmptyState.tsx
import type { Icon } from "@tabler/icons-react";
import Button from "./Button";

interface EmptyStateProps {
  icon?:        Icon;
  title:        string;
  description?: string;
  action?:      { label: string; onClick: () => void; icon?: React.ReactNode };
  className?:   string;
}

export default function EmptyState({ icon: Icon, title, description, action, className = "" }: EmptyStateProps) {
  return (
    <div className={["flex flex-col items-center justify-center text-center py-16 px-6 min-h-[280px]", className].join(" ")}>
      {Icon && (
        <div className="mb-4 w-12 h-12 rounded-full bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center">
          <Icon size={20} stroke={1.5} className="text-[#3B82F6]" />
        </div>
      )}
      <h3 className="text-[16px] font-semibold leading-5 text-on-surface mb-1">{title}</h3>
      {description && <p className="text-[14px] leading-5 text-secondary max-w-xs mt-1">{description}</p>}
      {action && (
        <div className="mt-5">
          <Button variant="primary" size="md" onClick={action.onClick} leftIcon={action.icon}>
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
}
