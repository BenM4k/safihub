"use client";

import * as React from "react";
import { Input as UiInput } from "@ui-sdk/react/input";
import { cn } from "@/lib/utils";

export type InputProps = Omit<
  React.ComponentProps<typeof UiInput>,
  "value" | "defaultValue"
> & {
  value?: string | number | readonly string[];
  defaultValue?: string | number | readonly string[];
};

export function Input({
  className,
  type,
  value,
  defaultValue,
  ...props
}: InputProps) {
  return (
    <UiInput
      type={type}
      value={value !== undefined ? String(value) : undefined}
      defaultValue={
        defaultValue !== undefined ? String(defaultValue) : undefined
      }
      className={cn(
        "flex w-full min-h-12 rounded-xl border border-border-strong bg-card px-4 py-2.5 text-base text-heading placeholder:text-muted-foreground transition-all duration-150 outline-none file:border-0 file:bg-transparent file:text-base file:font-medium disabled:cursor-not-allowed disabled:opacity-50 data-disabled:cursor-not-allowed data-disabled:opacity-50",
        "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20",
        "aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 aria-invalid:focus-visible:border-destructive",
        className
      )}
      {...props}
    />
  );
}
