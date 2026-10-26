import * as React from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({
  className,
  ref,
  ...props
}: TextareaProps & { ref?: React.Ref<HTMLTextAreaElement> }) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex w-full min-h-[80px] rounded-xl border border-border-strong bg-card px-4 py-2.5 text-base text-heading placeholder:text-muted-foreground transition-all duration-150 outline-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20",
        "aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 aria-invalid:focus-visible:border-destructive",
        className
      )}
      ref={ref}
      {...props}
    />
  );
}
