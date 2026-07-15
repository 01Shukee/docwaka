// src/components/ui/Card.tsx

import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLElement> {
  padding?: "none" | "sm" | "md" | "lg";
  hover?:   boolean;
  as?:      "div" | "article" | "section" | "li";
}

/**
 * DESIGN.md card token:
 *   backgroundColor: neutral (#FFFFFF)
 *   border: 1px solid tertiary (#E5E7EB)
 *   rounded: md (8px)
 *   padding: 16px
 *
 * Depth: tonal contrast + border only — no dramatic shadows (DESIGN.md §Elevation).
 */
const PADDING: Record<NonNullable<CardProps["padding"]>, string> = {
  none: "p-0",
  sm:   "p-3",
  md:   "p-4",
  lg:   "p-6",
};

export function Card({
  padding   = "md",
  hover     = false,
  as:       Tag = "div",
  children,
  className = "",
  ...rest
}: CardProps) {
  return (
    <Tag
      className={[
        "bg-neutral border border-tertiary rounded-md",
        PADDING[padding],
        hover
          ? "transition-shadow duration-150 hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)] cursor-pointer"
          : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {children}
    </Tag>
  );
}

// ── CardHeader ────────────────────────────────────────────────────────────────

interface CardHeaderProps {
  title:      React.ReactNode;
  subtitle?:  React.ReactNode;
  action?:    React.ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, action, className = "" }: CardHeaderProps) {
  return (
    <div className={`flex items-start justify-between gap-4 mb-4 ${className}`}>
      <div className="min-w-0">
        {typeof title === "string" ? (
          <h2 className="text-[16px] font-semibold leading-5 text-on-surface truncate">
            {title}
          </h2>
        ) : (
          title
        )}
        {subtitle && (
          <p className="mt-0.5 text-[14px] leading-5 text-secondary">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

// ── CardDivider ───────────────────────────────────────────────────────────────

export function CardDivider({ className = "" }: { className?: string }) {
  return <hr className={`border-tertiary my-4 ${className}`} />;
}

// ── CardFooter ────────────────────────────────────────────────────────────────

export function CardFooter({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mt-4 pt-4 border-t border-tertiary ${className}`}>
      {children}
    </div>
  );
}

export default Card;
