// src/components/ui/Button.tsx

"use client";

import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "link" | "danger";
type Size    = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  Variant;
  size?:     Size;
  loading?:  boolean;
  fullWidth?: boolean;
  leftIcon?:  React.ReactNode;
  rightIcon?: React.ReactNode;
}

/**
 * DESIGN.md — Button component family.
 *
 * primary  → filled #141414 pill, white label-lg text
 * secondary→ white pill, #141414 text, tertiary border
 * ghost    → surface fill, on-surface text (for subtle actions)
 * link     → transparent, secondary text, no border
 * danger   → filled error (#D92D20) pill, white text
 */
const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-primary text-neutral border-transparent hover:opacity-85 active:scale-[0.98]",
  secondary:
    "bg-neutral text-primary border-tertiary hover:bg-surface active:scale-[0.98]",
  ghost:
    "bg-surface text-on-surface border-tertiary hover:bg-tertiary active:scale-[0.98]",
  link:
    "bg-transparent text-secondary border-transparent hover:text-primary underline-offset-4 hover:underline",
  danger:
    "bg-error text-neutral border-transparent hover:opacity-85 active:scale-[0.98]",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "h-8  px-3 text-[12px] leading-4 font-medium  tracking-[0.04em] rounded-full gap-1.5",
  md: "h-[40px] px-4 text-[16px] leading-5 font-semibold rounded-full gap-2",
  lg: "h-[44px] px-5 text-[16px] leading-5 font-semibold rounded-full gap-2",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant   = "primary",
      size      = "lg",
      loading   = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      className = "",
      ...rest
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={[
          // Base
          "inline-flex items-center justify-center",
          "border transition-all duration-150 select-none whitespace-nowrap",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
          // Variant
          VARIANT_CLASSES[variant],
          // Size
          SIZE_CLASSES[size],
          // Width
          fullWidth ? "w-full" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...rest}
      >
        {loading ? (
          <Loader2 className="animate-spin shrink-0" size={16} />
        ) : leftIcon ? (
          <span className="shrink-0">{leftIcon}</span>
        ) : null}

        {children && <span>{children}</span>}

        {!loading && rightIcon && (
          <span className="shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
