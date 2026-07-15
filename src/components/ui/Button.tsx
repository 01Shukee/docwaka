// src/components/ui/Button.tsx
"use client";

import { forwardRef } from "react";
import { IconLoader2 } from "@tabler/icons-react";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "link" | "danger" | "blue";
type Size    = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   Variant;
  size?:      Size;
  loading?:   boolean;
  fullWidth?: boolean;
  leftIcon?:  React.ReactNode;
  rightIcon?: React.ReactNode;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:   "bg-primary text-neutral border-transparent hover:opacity-85 active:scale-[0.98]",
  secondary: "bg-neutral text-primary border-tertiary hover:bg-surface active:scale-[0.98]",
  ghost:     "bg-surface text-on-surface border-tertiary hover:bg-tertiary active:scale-[0.98]",
  link:      "bg-transparent text-secondary border-transparent hover:text-primary underline-offset-4 hover:underline",
  danger:    "bg-error text-neutral border-transparent hover:opacity-85 active:scale-[0.98]",
  blue:      "bg-[#3B82F6] text-white border-transparent hover:bg-[#2563EB] active:scale-[0.98]",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "h-8  px-3 text-[12px] font-medium  tracking-[0.04em] rounded-full gap-1.5",
  md: "h-[40px] px-4 text-[14px] font-semibold rounded-full gap-2",
  lg: "h-[44px] px-5 text-[15px] font-semibold rounded-full gap-2",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "lg", loading = false, fullWidth = false, leftIcon, rightIcon, disabled, children, className = "", ...rest }, ref) => {
    const isDisabled = disabled || loading;
    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={[
          "inline-flex items-center justify-center border transition-all duration-150 select-none whitespace-nowrap",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
          VARIANT_CLASSES[variant],
          SIZE_CLASSES[size],
          fullWidth ? "w-full" : "",
          className,
        ].filter(Boolean).join(" ")}
        {...rest}
      >
        {loading
          ? <IconLoader2 size={16} stroke={1.5} className="animate-spin shrink-0" />
          : leftIcon
            ? <span className="shrink-0">{leftIcon}</span>
            : null
        }
        {children && <span>{children}</span>}
        {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
