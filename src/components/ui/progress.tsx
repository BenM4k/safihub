"use client";

import * as React from "react";
import {
  Progress as UiProgress,
  ProgressIndicator,
  ProgressTrack,
} from "@ui-sdk/react/progress";
import { cn } from "@/lib/utils";

function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof UiProgress>) {
  return (
    <UiProgress
      value={value}
      className={cn("w-full", className)}
      {...props}
    >
      <ProgressTrack className="bg-muted relative h-2 w-full overflow-hidden rounded-full">
        <ProgressIndicator className="bg-primary h-full transition-all" />
      </ProgressTrack>
    </UiProgress>
  );
}

export { Progress };
