"use client";

import * as React from "react";
import {
  Accordion as UiAccordion,
  AccordionHeader,
  AccordionItem as UiAccordionItem,
  AccordionPanel,
  AccordionTrigger as UiAccordionTrigger,
} from "@ui-sdk/react/accordion";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type AccordionProps = Omit<
  React.ComponentProps<typeof UiAccordion>,
  "value" | "defaultValue" | "onValueChange"
> & {
  type?: "single" | "multiple";
  collapsible?: boolean;
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: string & string[]) => void;
};

function toArray(val: string | string[] | undefined): string[] | undefined {
  if (val === undefined) return undefined;
  return Array.isArray(val) ? val : val ? [val] : [];
}

function Accordion({
  type,
  collapsible,
  multiple,
  value,
  defaultValue,
  onValueChange,
  ...props
}: AccordionProps) {
  const isMultiple = multiple ?? type === "multiple";

  return (
    <UiAccordion
      multiple={isMultiple}
      collapsible={collapsible ?? true}
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
      {...props}
    />
  );
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof UiAccordionItem>) {
  return (
    <UiAccordionItem
      className={cn("border-b last:border-b-0", className)}
      {...props}
    />
  );
}

function AccordionTrigger({
  className,
  children,
  ...props
}: Omit<React.ComponentProps<typeof UiAccordionTrigger>, "children"> & {
  children?: React.ReactNode;
}) {
  return (
    <AccordionHeader className="flex">
      <UiAccordionTrigger
        className={cn(
          "flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-disabled:pointer-events-none data-disabled:opacity-50 [&[data-open]>svg]:rotate-180",
          className
        )}
        {...props}
      >
        {children}
        <ChevronDownIcon
          className="pointer-events-none size-4 shrink-0 translate-y-0.5 text-muted-foreground transition-transform duration-200"
          aria-hidden="true"
        />
      </UiAccordionTrigger>
    </AccordionHeader>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: Omit<React.ComponentProps<typeof AccordionPanel>, "children"> & {
  children?: React.ReactNode;
}) {
  return (
    <AccordionPanel
      className="overflow-hidden text-sm data-closed:animate-accordion-up data-open:animate-accordion-down"
      {...props}
    >
      <div className={cn("pt-0 pb-4", className)}>{children}</div>
    </AccordionPanel>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
