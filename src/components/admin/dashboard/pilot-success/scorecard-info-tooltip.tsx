"use client";

import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ScorecardInfoTooltipProps {
  formula: string;
  ariaLabel: string;
}

export function ScorecardInfoTooltip({
  formula,
  ariaLabel,
}: ScorecardInfoTooltipProps) {
  return (
    <Tooltip delay={150}>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="inline-flex size-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-help focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={ariaLabel}
        >
          <HelpCircle className="size-3.5" aria-hidden="true" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="right" className="max-w-64 leading-relaxed">
        {formula}
      </TooltipContent>
    </Tooltip>
  );
}
