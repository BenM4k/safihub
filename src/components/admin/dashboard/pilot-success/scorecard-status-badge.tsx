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
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
          <span>{labels.met}</span>
        </span>
      );
    case "at-risk":
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" aria-hidden="true" />
          <span>{labels.atRisk}</span>
        </span>
      );
    case "failing":
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" aria-hidden="true" />
          <span>{labels.failing}</span>
        </span>
      );
    case "no-data":
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
          <MinusCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
          <span>{labels.noData}</span>
        </span>
      );
  }
}
