import React from "react";
import { CheckCircle2, AlertTriangle, XCircle, MinusCircle } from "lucide-react";

export type MetricStatus = "met" | "at-risk" | "failing" | "no-data";

interface ScorecardStatusBadgeProps {
  status: MetricStatus;
  labels: {
    met: string;
    atRisk: string;
    failing: string;
    noData: string;
  };
}

export function ScorecardStatusBadge({ status, labels }: ScorecardStatusBadgeProps) {
  switch (status) {
    case "met":
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
          <span>{labels.met}</span>
        </span>
      );
    case "at-risk":
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
          <AlertTriangle className="size-3.5 text-amber-600 dark:text-amber-400 shrink-0" aria-hidden="true" />
          <span>{labels.atRisk}</span>
        </span>
      );
    case "failing":
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">
          <XCircle className="size-3.5 text-rose-600 dark:text-rose-400 shrink-0" aria-hidden="true" />
          <span>{labels.failing}</span>
        </span>
      );
    case "no-data":
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-muted text-muted-foreground border border-border">
          <MinusCircle className="size-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
          <span>{labels.noData}</span>
        </span>
      );
  }
}

