"use client";

import * as React from "react";
import {
  Toggle as UiToggle,
  ToggleGroup as UiToggleGroup,
} from "@ui-sdk/react/toggle";
import { type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { toggleVariants } from "@/components/ui/toggle";

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants> & {
    spacing?: number;
  }
>({
  size: "default",
  variant: "default",
  spacing: 0,
});

type ToggleGroupProps = Omit<
  React.ComponentProps<typeof UiToggleGroup>,
  "value" | "defaultValue" | "onValueChange" | "children"
> &
  VariantProps<typeof toggleVariants> & {
    spacing?: number;
    type?: "single" | "multiple";
    value?: string | string[];
    defaultValue?: string | string[];
    onValueChange?: (value: string & string[]) => void;
    children?: React.ReactNode;
  };

function toArray(val: string | string[] | undefined): string[] | undefined {
  if (val === undefined) return undefined;
  return Array.isArray(val) ? val : val ? [val] : [];
}

function ToggleGroup({
  className,
  variant,
  size,
  spacing = 0,
  type,
  multiple,
  value,
  defaultValue,
  onValueChange,
  children,
  ...props
}: ToggleGroupProps) {
  const isMultiple = multiple ?? type === "multiple";

  return (
    <UiToggleGroup
      multiple={isMultiple}
      value={toArray(value)}
      defaultValue={toArray(defaultValue)}
      onValueChange={
        onValueChange
          ? (next) => {
              const out = isMultiple ? next : (next[0] ?? "");
              (onValueChange as (v: string | string[]) => void)(out);
            }
          : undefined
      }
      data-variant={variant}
      data-size={size}
      data-spacing={spacing}
      style={{ "--gap": spacing } as React.CSSProperties}
      className={cn(
        "group/toggle-group flex w-fit items-center gap-[--spacing(var(--gap))] rounded-md data-[spacing=default]:data-[variant=outline]:shadow-xs",
        className
      )}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size, spacing }}>
        {children}
      </ToggleGroupContext.Provider>
    </UiToggleGroup>
  );
}

function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof UiToggle> &
  VariantProps<typeof toggleVariants>) {
  const context = React.useContext(ToggleGroupContext);

  return (
    <UiToggle
      data-variant={context.variant || variant}
      data-size={context.size || size}
      data-spacing={context.spacing}
      className={cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        "w-auto min-w-0 shrink-0 px-3 focus:z-10 focus-visible:z-10",
        "data-[spacing=0]:rounded-none data-[spacing=0]:shadow-none data-[spacing=0]:first:rounded-l-md data-[spacing=0]:last:rounded-r-md data-[spacing=0]:data-[variant=outline]:border-l-0 data-[spacing=0]:data-[variant=outline]:first:border-l",
        className
      )}
      {...props}
    >
      {children}
    </UiToggle>
  );
}

export { ToggleGroup, ToggleGroupItem };
