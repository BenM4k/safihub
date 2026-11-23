"use client";

import * as React from "react";
import {
  Checkbox as UiCheckbox,
  CheckboxIndicator,
} from "@ui-sdk/react/checkbox";
import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type CheckboxProps = Omit<
  React.ComponentProps<typeof UiCheckbox>,
  "onCheckedChange"
> & {
  onCheckedChange?: (checked: boolean) => void;
};

function Checkbox({
  className,
  onCheckedChange,
  ...props
}: CheckboxProps) {
  return (
    <UiCheckbox
      onCheckedChange={
        onCheckedChange ? (next) => onCheckedChange(next === true) : undefined
      }
      className={cn(
        "peer size-4 shrink-0 rounded-[4px] border border-input shadow-xs transition-shadow outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-disabled:cursor-not-allowed data-disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground dark:bg-input/30 dark:aria-invalid:ring-destructive/40 dark:data-checked:bg-primary",
        className
      )}
      {...props}
    >
      <CheckboxIndicator className="grid place-content-center text-current transition-none">
        <CheckIcon className="size-3.5" aria-hidden="true" />
      </CheckboxIndicator>
    </UiCheckbox>
  );
}

export { Checkbox };
