import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

/**
 * Clean, accessible Input component styled to match reference auth inputs.
 * Enforces minimum 16px (text-base) font-size on mobile to prevent iOS/browser auto-zooming.
 */
export function Input({
  className,
  type,
  hasError,
  ref,
  ...props
}: InputProps & { ref?: React.Ref<HTMLInputElement> }) {
  return (
    <input
      type={type}
      className={cn(
        "flex w-full min-h-12 rounded-xl border border-border-strong bg-card px-4 py-2.5 text-base text-heading placeholder:text-muted-foreground transition-all duration-150 outline-none file:border-0 file:bg-transparent file:text-base file:font-medium disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20",
        "aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 aria-invalid:focus-visible:border-destructive",
        hasError &&
          "border-destructive ring-2 ring-destructive/20 focus-visible:border-destructive",
        className,
      )}
      aria-invalid={hasError ? "true" : props["aria-invalid"]}
      ref={ref}
      {...props}
    />
  );
}
