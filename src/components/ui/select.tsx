"use client";

import * as React from "react";
import {
  Select as UiSelect,
  SelectContent as UiSelectContent,
  SelectGroup as UiSelectGroup,
  SelectGroupLabel,
  SelectItem as UiSelectItem,
  SelectItemIndicator,
  SelectSeparator as UiSelectSeparator,
  SelectTrigger as UiSelectTrigger,
  SelectValue as UiSelectValue,
} from "@ui-sdk/react/select";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type SelectProps = Omit<
  React.ComponentProps<typeof UiSelect<string, false>>,
  "onValueChange" | "value" | "defaultValue" | "multiple"
> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};

function extractText(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(extractText).join("").trim();
  }
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return extractText(node.props.children);
  }
  return "";
}

function collectSelectItems(
  children: React.ReactNode,
  acc: Array<{ value: string; label: string; disabled?: boolean }>,
) {
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement<Record<string, unknown>>(child)) return;
    if (child.type === SelectItem && typeof child.props.value === "string") {
      const label =
        typeof child.props.label === "string"
          ? child.props.label
          : extractText(child.props.children as React.ReactNode) ||
            child.props.value;
      acc.push({
        value: child.props.value,
        label,
        disabled: Boolean(child.props.disabled),
      });
      return;
    }
    if (child.props.children) {
      collectSelectItems(child.props.children as React.ReactNode, acc);
    }
  });
}

function Select({
  value,
  defaultValue,
  onValueChange,
  items,
  children,
  ...props
}: SelectProps) {
  const resolvedItems = React.useMemo(() => {
    if (items) return items;
    const collected: Array<{
      value: string;
      label: string;
      disabled?: boolean;
    }> = [];
    collectSelectItems(children, collected);
    return collected.length > 0 ? collected : undefined;
  }, [items, children]);

  return (
    <UiSelect
      value={value}
      defaultValue={defaultValue}
      items={resolvedItems}
      onValueChange={
        onValueChange
          ? (next) => {
              if (next !== null) onValueChange(next);
            }
          : undefined
      }
      {...props}
    >
      {children}
    </UiSelect>
  );
}

function SelectGroup(props: React.ComponentProps<typeof UiSelectGroup>) {
  return <UiSelectGroup {...props} />;
}

function SelectValue(props: React.ComponentProps<typeof UiSelectValue>) {
  return <UiSelectValue {...props} />;
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: Omit<React.ComponentProps<typeof UiSelectTrigger>, "children"> & {
  size?: "sm" | "default";
  children?: React.ReactNode;
}) {
  return (
    <UiSelectTrigger
      data-size={size}
      className={cn(
        "flex w-fit items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-disabled:cursor-not-allowed data-disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDownIcon className="size-4 opacity-50" aria-hidden="true" />
    </UiSelectTrigger>
  );
}

function SelectContent({
  className,
  children,
  align = "center",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof UiSelectContent> & {
  position?: "popper" | "item-aligned";
}) {
  return (
    <UiSelectContent
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "relative z-50 max-h-(--available-height) min-w-[max(8rem,var(--anchor-width))] origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md transition-[opacity,scale] duration-150 data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0",
        className,
      )}
      {...props}
    >
      {children}
    </UiSelectContent>
  );
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectGroupLabel>) {
  return (
    <SelectGroupLabel
      className={cn("px-2 py-1.5 text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}

function SelectItem({
  className,
  children,
  label,
  ...props
}: Omit<React.ComponentProps<typeof UiSelectItem>, "children"> & {
  children?: React.ReactNode;
}) {
  const resolvedLabel =
    label ?? (extractText(children) || String(props.value ?? ""));

  return (
    <UiSelectItem
      label={resolvedLabel}
      className={cn(
        "relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className,
      )}
      {...props}
    >
      <SelectItemIndicator className="absolute right-2 flex size-3.5 items-center justify-center">
        <CheckIcon className="size-4" aria-hidden="true" />
      </SelectItemIndicator>
      <span className="flex-1">{children}</span>
    </UiSelectItem>
  );
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof UiSelectSeparator>) {
  return (
    <UiSelectSeparator
      className={cn("pointer-events-none -mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  );
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="select-scroll-up-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className,
      )}
      {...props}
    >
      <ChevronUpIcon className="size-4" aria-hidden="true" />
    </div>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="select-scroll-down-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className,
      )}
      {...props}
    >
      <ChevronDownIcon className="size-4" aria-hidden="true" />
    </div>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
