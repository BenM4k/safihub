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
        "flex w-full min-h-12 rounded-xl border border-border-strong bg-white px-4 py-2.5 text-base sm:text-sm text-heading placeholder:text-muted-foreground transition-all duration-150 outline-none file:border-0 file:bg-transparent file:text-base sm:file:text-sm file:font-medium disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20",
        hasError &&
          "border-red-400 focus-visible:border-red-500 focus-visible:ring-red-100",
        className,
      )}
      aria-invalid={hasError ? "true" : undefined}
      ref={ref}
      {...props}
    />
  );
}
