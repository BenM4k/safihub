import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

export function Textarea({
  className,
  hasError,
  ref,
  ...props
}: TextareaProps & { ref?: React.Ref<HTMLTextAreaElement> }) {
  return (
    <textarea
      className={cn(
        "flex w-full min-h-[80px] rounded-xl border border-border-strong bg-white px-4 py-2.5 text-base sm:text-sm text-heading placeholder:text-muted-foreground transition-all duration-150 outline-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20",
        hasError &&
          "border-red-400 focus-visible:border-red-500 focus-visible:ring-red-100",
        className
      )}
      aria-invalid={hasError ? "true" : undefined}
      ref={ref}
      {...props}
    />
  );
}
