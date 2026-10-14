"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { HelpCircle } from "lucide-react";
import { ScorecardStatusBadge, type MetricStatus } from "./scorecard-status-badge";

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

  return (
    <tr className="hover:bg-slate-50/50 transition-colors">
      {/* Metric Name + Formula Tooltip */}
      <td className="py-3.5 px-5 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-900">{data.metric}</span>
          <div className="relative">
            <button
              type="button"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onFocus={() => setShowTooltip(true)}
              onBlur={() => setShowTooltip(false)}
              className="text-slate-400 hover:text-slate-600 cursor-help"
              aria-label={t("definitionAriaLabel", { metric: data.metric })}
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
            {showTooltip && (
              <div className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-64 p-2.5 bg-slate-900 text-white text-xs rounded-lg shadow-lg pointer-events-none leading-relaxed">
                {data.formula}
              </div>
            )}
          </div>
        </div>
      </td>

      {/* Current Value */}
      <td className="py-3.5 px-4 font-semibold text-slate-900">
        {data.currentDisplay}
      </td>

      {/* Target Value */}
      <td className="py-3.5 px-4 text-xs text-slate-500 font-medium">
        {data.targetDisplay}
      </td>

      {/* Progress Bar */}
      <td className="py-3.5 px-4">
        {data.progressPercent !== null ? (
          <div className="w-32 flex items-center gap-2">
            <div className="flex-1 h-2 bg-slate-100 border border-slate-300 rounded-full overflow-hidden">
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
            <span className="text-xs font-mono text-slate-500 w-8">
              {Math.round(data.progressPercent)}%
            </span>
          </div>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        )}
      </td>

      {/* Status Badge */}
      <td className="py-3.5 px-5 sm:px-6 text-right">
        <ScorecardStatusBadge status={data.status} labels={labels} />
      </td>
    </tr>
  );
}
