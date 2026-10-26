"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { HelpCircle } from "lucide-react";
import { ScorecardStatusBadge, type MetricStatus } from "./scorecard-status-badge";
import { TableRow, TableCell } from "@/components/ui/table";

export interface ScorecardRowData {
  id: string;
  metric: string;
  formula: string;
  currentDisplay: string;
  targetDisplay: string;
  progressPercent: number | null;
  status: MetricStatus;
}

export function ScorecardRow({
  data,
  labels,
}: {
  data: ScorecardRowData;
  labels: {
    met: string;
    atRisk: string;
    failing: string;
    noData: string;
  };
}) {
  const t = useTranslations("admin.dashboard");
  const [showTooltip, setShowTooltip] = useState(false);

  const tooltipId = `tooltip-formula-${data.id}`;

  return (
    <TableRow>
      {/* Metric Name + Formula Tooltip */}
      <TableCell className="py-3.5 px-5 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground">{data.metric}</span>
          <div className="relative">
            <button
              type="button"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onFocus={() => setShowTooltip(true)}
              onBlur={() => setShowTooltip(false)}
              className="text-muted-foreground hover:text-foreground cursor-help"
              aria-label={t("definitionAriaLabel", { metric: data.metric })}
              aria-describedby={tooltipId}
            >
              <HelpCircle className="size-3.5" />
            </button>
            {showTooltip && (
              <div
                id={tooltipId}
                role="tooltip"
                className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-64 p-2.5 bg-popover text-popover-foreground border border-border text-xs rounded-lg shadow-lg pointer-events-none leading-relaxed"
              >
                {data.formula}
              </div>
            )}
          </div>
        </div>
      </TableCell>

      {/* Current Value */}
      <TableCell className="py-3.5 px-4 font-semibold text-foreground">
        {data.currentDisplay}
      </TableCell>

      {/* Target Value */}
      <TableCell className="py-3.5 px-4 text-xs text-muted-foreground font-medium">
        {data.targetDisplay}
      </TableCell>

      {/* Progress Bar */}
      <TableCell className="py-3.5 px-4">
        {data.progressPercent !== null ? (
          <div className="w-32 flex items-center gap-2">
            <div className="flex-1 h-2 bg-muted border border-border rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  data.status === "met"
                    ? "bg-emerald-500"
                    : data.status === "at-risk"
                    ? "bg-amber-500"
                    : "bg-rose-500"
                }`}
                style={{ width: `${Math.min(data.progressPercent, 100)}%` }}
              />
            </div>
            <span className="text-xs font-mono text-muted-foreground w-8">
              {Math.round(data.progressPercent)}%
            </span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground/60">—</span>
        )}
      </TableCell>

      {/* Status Badge */}
      <TableCell className="py-3.5 px-5 sm:px-6 text-right">
        <ScorecardStatusBadge status={data.status} labels={labels} />
      </TableCell>
    </TableRow>
  );
}

