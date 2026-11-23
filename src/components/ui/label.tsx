"use client";

import * as React from "react";
import { Label as UiLabel } from "@ui-sdk/react/label";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const labelVariants = cva(
  "text-sm font-semibold text-heading leading-none select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);

export function Label({
  className,
  ...props
}: React.ComponentProps<typeof UiLabel> & VariantProps<typeof labelVariants>) {
  return <UiLabel className={cn(labelVariants(), className)} {...props} />;
}
