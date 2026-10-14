"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Radio, ChevronDown, ChevronUp } from "lucide-react";
import { ScorecardRow, type ScorecardRowData } from "./scorecard-row";

interface PilotScorecardProps {
  title: string;
  subtitle: string;
  phaseBadge: string;
  criteria: ScorecardRowData[];
  labels: {
    summary: string;
    colMetric: string;
    colCurrent: string;
    colTarget: string;
    colProgress: string;
    colStatus: string;
    statusMet: string;
    statusAtRisk: string;
    statusFailing: string;
    statusNoData: string;
  };
}

export function PilotScorecard({
  title,
  subtitle,
  phaseBadge,
  criteria,
  labels,
}: PilotScorecardProps) {
  const t = useTranslations("admin.dashboard");
  const [isExpanded, setIsExpanded] = useState(true);

  const metCount = criteria.filter((c) => c.status === "met").length;
  const totalCount = criteria.length;
  const summaryText = labels.summary.includes("{metCount}")
    ? labels.summary
        .replace("{metCount}", metCount.toString())
        .replace("{totalCount}", totalCount.toString())
    : labels.summary;

  return (
    <div className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-sm">
      {/* Scorecard Header with Segmented Progress Bar */}
      <div className="p-5 sm:p-6 border-b border-slate-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700">
                <Radio className="w-3 h-3 text-indigo-600" />
                {phaseBadge}
              </span>
              <span className="text-xs text-slate-400">· Bukavu</span>
            </div>
            <h2 className="text-lg font-semibold leading-6 text-slate-900 mt-1">
              {title}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {subtitle}
            </p>
          </div>

          {/* Segmented Bar & Collapse Toggle */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="flex items-center justify-end gap-1.5">
                <span className="text-sm font-semibold text-slate-900">
                  {summaryText}
                </span>
                <span className="text-xs text-slate-400">
                  ({Math.round((metCount / totalCount) * 100)}%)
                </span>
              </div>

              {/* Segmented Bar: 1 segment per criterion */}
              <div className="flex items-center gap-1 mt-1.5" aria-hidden="true">
                {criteria.map((item) => {
                  let segmentColor = "bg-slate-200";
                  let statusTitle = labels.statusNoData;
                  if (item.status === "met") {
                    segmentColor = "bg-emerald-500";
                    statusTitle = labels.statusMet;
                  } else if (item.status === "at-risk") {
                    segmentColor = "bg-amber-500";
                    statusTitle = labels.statusAtRisk;
                  } else if (item.status === "failing") {
                    segmentColor = "bg-rose-500";
                    statusTitle = labels.statusFailing;
                  }
                  return (
                    <div
                      key={item.id}
                      className={`h-2 w-6 rounded-xs transition-colors ${segmentColor}`}
                      title={`${item.metric}: ${statusTitle}`}
                    />
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              aria-expanded={isExpanded}
              aria-label={isExpanded ? t("collapseScorecard") : t("expandScorecard")}
            >
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Collapsible Table */}
      {isExpanded && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-300">
              <tr className="text-xs font-semibold text-slate-600">
                <th className="py-3 px-5 sm:px-6">{labels.colMetric}</th>
                <th className="py-3 px-4">{labels.colCurrent}</th>
                <th className="py-3 px-4">{labels.colTarget}</th>
                <th className="py-3 px-4">{labels.colProgress}</th>
                <th className="py-3 px-5 sm:px-6 text-right">{labels.colStatus}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white text-sm text-slate-700">
              {criteria.map((c) => (
                <ScorecardRow
                  key={c.id}
                  data={c}
                  labels={{
                    met: labels.statusMet,
                    atRisk: labels.statusAtRisk,
                    failing: labels.statusFailing,
                    noData: labels.statusNoData,
                  }}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
