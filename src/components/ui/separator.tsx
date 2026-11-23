"use client";

import * as React from "react";
import { Separator as UiSeparator } from "@ui-sdk/react/separator";
import { cn } from "@/lib/utils";

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<typeof UiSeparator> & { decorative?: boolean }) {
  return (
    <UiSeparator
      orientation={orientation}
      aria-hidden={decorative || undefined}
      className={cn(
        "shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        className
      )}
      {...props}
    />
  );
}

export { Separator };
