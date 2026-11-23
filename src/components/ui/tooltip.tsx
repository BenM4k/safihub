"use client";

import * as React from "react";
import {
  Tooltip as UiTooltip,
  TooltipArrow,
  TooltipContent as UiTooltipContent,
  TooltipTrigger as UiTooltipTrigger,
} from "@ui-sdk/react/tooltip";
import { cn } from "@/lib/utils";

const TooltipDelayContext = React.createContext<number | undefined>(undefined);

function TooltipProvider({
  children,
  delayDuration = 0,
}: {
  children?: React.ReactNode;
  delayDuration?: number;
}) {
  return (
    <TooltipDelayContext.Provider value={delayDuration}>
      {children}
    </TooltipDelayContext.Provider>
  );
}

function Tooltip({
  delay,
  ...props
}: React.ComponentProps<typeof UiTooltip>) {
  const inheritedDelay = React.useContext(TooltipDelayContext);
  return <UiTooltip delay={delay ?? inheritedDelay} {...props} />;
}

function TooltipTrigger({
  asChild,
  children,
  ...props
}: React.ComponentProps<typeof UiTooltipTrigger> & { asChild?: boolean }) {
  if (asChild && React.isValidElement(children)) {
    return <UiTooltipTrigger render={children} {...props} />;
  }
  return <UiTooltipTrigger {...props}>{children}</UiTooltipTrigger>;
}

function TooltipContent({
  className,
  sideOffset = 4,
  collisionPadding = 12,
  children,
  ...props
}: Omit<React.ComponentProps<typeof UiTooltipContent>, "children"> & {
  children?: React.ReactNode;
}) {
  return (
    <UiTooltipContent
      sideOffset={sideOffset}
      collisionPadding={collisionPadding}
      className={cn(
        "z-50 w-fit max-w-[calc(100vw-2rem)] sm:max-w-xs origin-(--transform-origin) rounded-md bg-foreground px-3 py-1.5 text-xs text-balance text-background shadow-md break-words transition-[opacity,scale] duration-150 data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0",
        className
      )}
      {...props}
    >
      {children}
      <TooltipArrow className="z-50 size-2.5 rotate-45 rounded-[2px] bg-foreground fill-foreground" />
    </UiTooltipContent>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
