"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Radio, ChevronDown, ChevronUp } from "lucide-react";
import { ScorecardRow, type ScorecardRowData } from "./scorecard-row";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xs">
      {/* Scorecard Header with Segmented Progress Bar */}
      <div className="p-5 sm:p-6 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-primary/10 text-primary">
                <Radio className="size-3 text-primary" />
                {phaseBadge}
              </span>
              <span className="text-xs text-muted-foreground">· Bukavu</span>
            </div>
            <h2 className="text-base font-semibold leading-6 text-foreground mt-1">
              {title}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {subtitle}
            </p>
          </div>

          {/* Segmented Bar & Collapse Toggle */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="flex items-center justify-end gap-1.5">
                <span className="text-sm font-semibold text-foreground">
                  {summaryText}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({Math.round((metCount / totalCount) * 100)}%)
                </span>
              </div>

              {/* Segmented Bar: 1 segment per criterion */}
              <div className="flex items-center gap-1 mt-1.5" aria-hidden="true">
                {criteria.map((item) => {
                  let segmentColor = "bg-muted";
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
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-lg transition-colors cursor-pointer"
              aria-expanded={isExpanded}
              aria-label={isExpanded ? t("collapseScorecard") : t("expandScorecard")}
            >
              {isExpanded ? <ChevronUp className="size-5" /> : <ChevronDown className="size-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Collapsible Table */}
      {isExpanded && (
        <div className="overflow-x-auto">
          <Table className="text-xs">
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="h-9 py-2 px-5 sm:px-6 uppercase font-semibold text-foreground">{labels.colMetric}</TableHead>
                <TableHead className="h-9 py-2 px-4 uppercase font-semibold text-foreground">{labels.colCurrent}</TableHead>
                <TableHead className="h-9 py-2 px-4 uppercase font-semibold text-foreground">{labels.colTarget}</TableHead>
                <TableHead className="h-9 py-2 px-4 uppercase font-semibold text-foreground">{labels.colProgress}</TableHead>
                <TableHead className="h-9 py-2 px-5 sm:px-6 text-right uppercase font-semibold text-foreground">{labels.colStatus}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
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
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

