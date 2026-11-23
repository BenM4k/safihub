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

interface PopoverAnchorContextValue {
  anchor: HTMLElement | null;
  setAnchor: (node: HTMLElement | null) => void;
}

const PopoverAnchorContext =
  React.createContext<PopoverAnchorContextValue | null>(null);

function Popover({ children, ...props }: React.ComponentProps<typeof UiPopover>) {
  const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);

  return (
    <PopoverAnchorContext.Provider value={{ anchor, setAnchor }}>
      <UiPopover {...props}>{children}</UiPopover>
    </PopoverAnchorContext.Provider>
  );
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
  anchor,
  ...props
}: React.ComponentProps<typeof UiPopoverContent>) {
  const anchorCtx = React.useContext(PopoverAnchorContext);
  const resolvedAnchor = anchor ?? anchorCtx?.anchor ?? undefined;

  return (
    <UiPopoverContent
      align={align}
      sideOffset={sideOffset}
      anchor={resolvedAnchor}
      className={cn(
        "z-50 w-72 origin-(--transform-origin) rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-hidden transition-[opacity,scale] duration-150 data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0",
        className
      )}
      {...props}
    />
  );
}

function PopoverAnchor({
  ref,
  ...props
}: React.ComponentProps<"div"> & { ref?: React.Ref<HTMLDivElement> }) {
  const anchorCtx = React.useContext(PopoverAnchorContext);

  const handleRef = (node: HTMLDivElement | null) => {
    anchorCtx?.setAnchor(node);
    if (typeof ref === "function") {
      ref(node);
    } else if (ref && typeof ref === "object" && "current" in ref) {
      (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
    }
  };

  return <div ref={handleRef} data-slot="popover-anchor" {...props} />;
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
