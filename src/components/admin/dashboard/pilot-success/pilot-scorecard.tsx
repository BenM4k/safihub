"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Radio, ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { MetricStatus } from "./scorecard-status-badge";

export interface ScorecardSegmentItem {
  id: string;
  metric: string;
  status: MetricStatus;
}

interface PilotScorecardProps {
  title: string;
  subtitle: string;
  phaseBadge: string;
  summaryText: string;
  segments: ScorecardSegmentItem[];
  statusLabels: {
    met: string;
    atRisk: string;
    failing: string;
    noData: string;
  };
  defaultOpen?: boolean;
  children: ReactNode;
}

const SEGMENT_TONE: Record<MetricStatus, string> = {
  met: "bg-success",
  "at-risk": "bg-warning",
  failing: "bg-destructive",
  "no-data": "bg-muted",
};

export function PilotScorecard({
  title,
  subtitle,
  phaseBadge,
  summaryText,
  segments,
  statusLabels,
  defaultOpen = true,
  children,
}: PilotScorecardProps) {
  const t = useTranslations("admin.dashboard");
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const metCount = segments.filter((s) => s.status === "met").length;
  const totalCount = Math.max(1, segments.length);

  const getStatusLabel = (status: MetricStatus) => {
    if (status === "met") return statusLabels.met;
    if (status === "at-risk") return statusLabels.atRisk;
    if (status === "failing") return statusLabels.failing;
    return statusLabels.noData;
  };

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="bg-card border border-border rounded-xl overflow-hidden shadow-xs animate-enter"
    >
      {/* Donut Shell Header */}
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
            <h2
              id="scorecard-heading"
              className="text-base font-semibold leading-6 text-foreground mt-1"
            >
              {title}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          </div>

          {/* Segmented Bar & Accessible Collapsible Trigger */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="flex items-center justify-end gap-1.5">
                <span className="text-sm font-semibold text-foreground">
                  {summaryText}
                </span>
                <span className="text-xs tabular-nums text-muted-foreground">
                  ({Math.round((metCount / totalCount) * 100)}%)
                </span>
              </div>

              <div className="flex items-center gap-1 mt-1.5" aria-hidden="true">
                {segments.map((item) => (
                  <div
                    key={item.id}
                    className={`h-2 w-6 rounded-xs transition-colors duration-200 ${SEGMENT_TONE[item.status]}`}
                    title={`${item.metric}: ${getStatusLabel(item.status)}`}
                  />
                ))}
              </div>
            </div>

            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="min-h-11 min-w-11 inline-flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-lg transition-colors cursor-pointer press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={isOpen ? t("collapseScorecard") : t("expandScorecard")}
              >
                <ChevronDown
                  className={`size-5 transition-transform duration-200 ease-out ${
                    isOpen ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>
            </CollapsibleTrigger>
          </div>
        </div>
      </div>

      {/* Server-rendered children slotted inside Donut client shell */}
      <CollapsibleContent className="collapsible-smooth overflow-x-auto">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}
