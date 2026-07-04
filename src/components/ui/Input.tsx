// src/components/ui/Input.tsx

"use client";

import { forwardRef } from "react";
import type {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  SelectHTMLAttributes,
} from "react";

// ── Label ────────────────────────────────────────────────────────────────────

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function Label({ children, required, className = "", ...rest }: LabelProps) {
  return (
    <label
      className={`block text-[14px] font-medium leading-5 text-on-surface mb-1.5 ${className}`}
      {...rest}
    >
      {children}
      {required && (
        <span className="text-error ml-0.5" aria-hidden="true">*</span>
      )}
    </label>
  );
}

// ── FieldError ────────────────────────────────────────────────────────────────

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1 text-[12px] leading-4 text-error font-medium" role="alert">
      {message}
    </p>
  );
}

// ── FieldHint ─────────────────────────────────────────────────────────────────

export function FieldHint({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1 text-[12px] leading-4 text-secondary">
      {message}
    </p>
  );
}

// ── Input ─────────────────────────────────────────────────────────────────────

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  leftSlot?: React.ReactNode;
}

/**
 * DESIGN.md input token:
 *   backgroundColor: surface (#F7F7F7)
 *   textColor: on-surface (#141414)
 *   rounded: full (9999px)
 *   height: 40px
 *   padding: 0 16px
 *   border: 1px solid tertiary (#E5E7EB)
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error = false, leftSlot, className = "", ...rest }, ref) => {
    return (
      <div className="relative flex items-center">
        {leftSlot && (
          <span className="absolute left-4 text-secondary pointer-events-none">
            {leftSlot}
          </span>
        )}
        <input
          ref={ref}
          className={[
            "w-full h-[40px] px-4 bg-surface text-on-surface",
            "border rounded-full text-[16px] leading-6 font-normal",
            "placeholder:text-secondary",
            "outline-none transition-all duration-150",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error
              ? "border-error focus:border-error focus:ring-2 focus:ring-error/20"
              : "border-tertiary focus:border-primary focus:ring-2 focus:ring-primary/10",
            leftSlot ? "pl-10" : "",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          {...rest}
        />
      </div>
    );
  }
);

Input.displayName = "Input";

// ── Textarea ──────────────────────────────────────────────────────────────────

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  rows?: number;
}

/**
 * DESIGN.md textarea variant — rounded-md (8px) instead of full,
 * resizable vertically.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error = false, rows = 4, className = "", ...rest }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={[
          "w-full px-4 py-3 bg-surface text-on-surface",
          "border rounded-md text-[16px] leading-6 font-normal",
          "placeholder:text-secondary resize-y",
          "outline-none transition-all duration-150",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          error
            ? "border-error focus:border-error focus:ring-2 focus:ring-error/20"
            : "border-tertiary focus:border-primary focus:ring-2 focus:ring-primary/10",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...rest}
      />
    );
  }
);

Textarea.displayName = "Textarea";

// ── Select ────────────────────────────────────────────────────────────────────

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ error = false, className = "", children, ...rest }, ref) => {
    return (
      <select
        ref={ref}
        className={[
          "w-full h-[40px] px-4 bg-surface text-on-surface",
          "border rounded-full text-[16px] leading-6 font-normal",
          "outline-none transition-all duration-150 appearance-none cursor-pointer",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          error
            ? "border-error focus:border-error focus:ring-2 focus:ring-error/20"
            : "border-tertiary focus:border-primary focus:ring-2 focus:ring-primary/10",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...rest}
      >
        {children}
      </select>
    );
  }
);

Select.displayName = "Select";

// ── FormField ─────────────────────────────────────────────────────────────────

/**
 * Composes Label + field slot + FieldError + FieldHint into one unit.
 * Keeps form markup clean and consistent.
 */
interface FormFieldProps {
  label:     string;
  htmlFor?:  string;
  required?: boolean;
  error?:    string;
  hint?:     string;
  children:  React.ReactNode;
  className?: string;
}

export function FormField({
  label,
  htmlFor,
  required,
  error,
  hint,
  children,
  className = "",
}: FormFieldProps) {
  return (
    <div className={`flex flex-col ${className}`}>
      <Label htmlFor={htmlFor} required={required}>
        {label}
      </Label>
      {children}
      <FieldError message={error} />
      <FieldHint  message={hint}  />
    </div>
  );
}

export default Input;
