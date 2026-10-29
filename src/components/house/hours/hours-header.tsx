"use client";

import { Clock, Globe, Info, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import {
  TIMEZONE_CONFIG,
  computeLiveStatus,
  formatWeeklyHoursTotal,
  calculateWeeklyTotalMinutes,
  computeTimerExample,
  formatDateFr,
  getClosureStatus,
  type DaySchedule,
  type ClosureItem,
} from "@/lib/hours-utils";

interface HoursHeaderProps {
  schedule: Record<number, DaySchedule>;
  closures: ClosureItem[];
  isPaused?: boolean;
}

export function HoursHeader({ schedule, closures, isPaused = false }: HoursHeaderProps) {
  const t = useTranslations("house.hours");

  const weeklyMinutes = calculateWeeklyTotalMinutes(schedule);
  const weeklyTotalText = formatWeeklyHoursTotal(weeklyMinutes);
  const liveStatus = computeLiveStatus(schedule, closures, new Date(), isPaused);
  const timerExample = computeTimerExample(schedule);

  // Find next upcoming or ongoing closure for customer preview
  const upcomingClosure = closures
    .filter((c) => getClosureStatus(c) !== "past")
    .sort((a, b) => a.startsOn.localeCompare(b.startsOn))[0];

  return (
    <div className="space-y-4 pb-2 border-b border-border/60 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-heading tracking-tight font-display">
            {t("title")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
            {t("ruleExplanation")}
          </p>
        </div>

        {/* Timezone badge */}
        <Badge variant="outline" className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold shrink-0 self-start sm:self-auto rounded-full border-border/80">
          <Globe className="size-3.5 text-primary" aria-hidden="true" />
          <span>{TIMEZONE_CONFIG.label}</span>
        </Badge>
      </div>

      {/* Status Bar */}
      <div className="flex flex-wrap items-center gap-2.5 py-1 text-xs">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${liveStatus.badgeClass}`}
        >
          <span className="size-2 rounded-full bg-current animate-pulse" />
          <span>{liveStatus.text}</span>
        </span>

        <span className="text-muted-foreground font-medium">·</span>
        <span className="font-semibold text-heading">{liveStatus.nextInfo}</span>

        <span className="text-muted-foreground font-medium">·</span>
        <span className="inline-flex items-center gap-1 font-semibold text-foreground">
          <Clock className="size-3.5 text-muted-foreground" aria-hidden="true" />
          <span>{weeklyTotalText}</span>
        </span>
      </div>

      {/* Computed timer real example */}
      <div className="border-l-2 border-primary/60 pl-4 py-2 text-xs leading-relaxed space-y-1 bg-muted/20 rounded-r-xl">
        <div className="flex items-center gap-1.5 font-bold text-heading text-xs sm:text-sm font-display tracking-tight">
          <Info className="size-4 text-primary shrink-0" aria-hidden="true" />
          <span>Règle des minuteurs (45 min)</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{timerExample}</p>
      </div>

      {/* Customer preview */}
      <div className="border-l-2 border-primary/50 pl-4 py-2 text-xs leading-relaxed space-y-1 bg-muted/20 rounded-r-xl">
        <div className="flex items-center gap-1.5 font-bold text-heading text-xs sm:text-sm font-display tracking-tight">
          <Sparkles className="size-4 text-primary shrink-0" aria-hidden="true" />
          <span>{t("customerPreview")}</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          {t("customerSee", { status: liveStatus.text, nextInfo: liveStatus.nextInfo })}
          {upcomingClosure && (
            <span className="text-slate-600 dark:text-slate-300 ml-1.5 font-medium">
              · {t("nextClosureDisplay", {
                starts: formatDateFr(upcomingClosure.startsOn),
                ends: formatDateFr(upcomingClosure.endsOn),
              })}
              {upcomingClosure.reason ? ` (${upcomingClosure.reason})` : ""}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
