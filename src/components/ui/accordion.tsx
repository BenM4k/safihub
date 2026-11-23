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

type AccordionBaseProps = Omit<
  React.ComponentProps<typeof UiAccordion>,
  "multiple" | "value" | "defaultValue" | "onValueChange"
> & {
  collapsible?: boolean;
};

type AccordionSingleProps = AccordionBaseProps & {
  type?: "single";
  multiple?: false;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};

type AccordionMultipleProps = AccordionBaseProps &
  (
    | {
        type: "multiple";
        multiple?: true;
      }
    | {
        type?: never;
        multiple: true;
      }
  ) & {
    value?: string[];
    defaultValue?: string[];
    onValueChange?: (value: string[]) => void;
  };

type AccordionProps = AccordionSingleProps | AccordionMultipleProps;

function Accordion(props: AccordionProps) {
  if (props.type === "multiple" || props.multiple === true) {
    const {
      type: _type,
      multiple: _multiple,
      collapsible,
      value,
      defaultValue,
      onValueChange,
      ...rest
    } = props;
    void _type;
    void _multiple;

    return (
      <UiAccordion
        multiple
        collapsible={collapsible ?? true}
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange ? (next) => onValueChange(next) : undefined}
        {...rest}
      />
    );
  }

  const {
    type: _type,
    multiple: _multiple,
    collapsible,
    value,
    defaultValue,
    onValueChange,
    ...rest
  } = props;
  void _type;
  void _multiple;

  return (
    <UiAccordion
      multiple={false}
      collapsible={collapsible ?? true}
      value={value !== undefined ? (value ? [value] : []) : undefined}
      defaultValue={
        defaultValue !== undefined
          ? defaultValue
            ? [defaultValue]
            : []
          : undefined
      }
      onValueChange={
        onValueChange ? (next) => onValueChange(next[0] ?? "") : undefined
      }
      {...rest}
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
          "flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-disabled:pointer-events-none data-disabled:opacity-50 [&[data-open]>svg:last-child]:rotate-180",
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
      className="h-[var(--accordion-panel-height)] overflow-hidden text-sm transition-[height,opacity] duration-200 ease-out data-starting-style:h-0 data-starting-style:opacity-0 data-ending-style:h-0 data-ending-style:opacity-0"
      {...props}
    >
      <div className={cn("pt-0 pb-4", className)}>{children}</div>
    </AccordionPanel>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
