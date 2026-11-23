"use client";

import * as React from "react";
import {
  Popover as UiPopover,
  PopoverContent as UiPopoverContent,
  PopoverDescription as UiPopoverDescription,
  PopoverTitle as UiPopoverTitle,
  PopoverTrigger as UiPopoverTrigger,
} from "@ui-sdk/react/popover";
import { cn } from "@/lib/utils";

function Popover(props: React.ComponentProps<typeof UiPopover>) {
  return <UiPopover {...props} />;
}

function PopoverTrigger({
  asChild,
  children,
  ...props
}: React.ComponentProps<typeof UiPopoverTrigger> & { asChild?: boolean }) {
  if (asChild && React.isValidElement(children)) {
    return <UiPopoverTrigger render={children} {...props} />;
  }
  return <UiPopoverTrigger {...props}>{children}</UiPopoverTrigger>;
}

function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof UiPopoverContent>) {
  return (
    <UiPopoverContent
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-72 origin-(--transform-origin) rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-hidden transition-[opacity,scale] duration-150 data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0",
        className
      )}
      {...props}
    />
  );
}

function PopoverAnchor({ ...props }: React.ComponentProps<"div">) {
  return <div data-slot="popover-anchor" {...props} />;
}

function PopoverHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="popover-header"
      className={cn("flex flex-col gap-1 text-sm", className)}
      {...props}
    />
  );
}

function PopoverTitle({
  className,
  ...props
}: React.ComponentProps<typeof UiPopoverTitle>) {
  return (
    <UiPopoverTitle className={cn("font-medium", className)} {...props} />
  );
}

function PopoverDescription({
  className,
  ...props
}: React.ComponentProps<typeof UiPopoverDescription>) {
  return (
    <UiPopoverDescription
      className={cn("text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverAnchor,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
};
