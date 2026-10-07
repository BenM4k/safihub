import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const labelVariants = cva(
  "text-sm font-semibold text-heading leading-none select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);

/**
 * Standard shadcn Label component with React 19 support.
 */
export function Label({
  className,
  ref,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root> &
  VariantProps<typeof labelVariants> & {
    ref?: React.Ref<HTMLLabelElement>;
  }) {
  return (
    <LabelPrimitive.Root
      className={cn(labelVariants(), className)}
      ref={ref}
      {...props}
    />
  );
}
