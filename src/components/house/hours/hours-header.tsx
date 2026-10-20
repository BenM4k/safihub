"use client";

import { Clock, Globe, Info, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  TIMEZONE_CONFIG,
  computeLiveStatus,
  formatWeeklyHoursTotal,
  calculateWeeklyTotalMinutes,
  computeTimerExample,
  formatDateFr,
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
    .filter((c) => c.endsOn >= new Date().toISOString().slice(0, 10))
    .sort((a, b) => a.startsOn.localeCompare(b.startsOn))[0];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-heading tracking-tight font-display">
            {t("title")}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {t("ruleExplanation")}
          </p>
        </div>

        {/* Timezone pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-surface border border-border text-foreground shrink-0 self-start sm:self-auto shadow-2xs">
          <Globe className="size-3.5 text-primary" aria-hidden="true" />
          <span>{TIMEZONE_CONFIG.label}</span>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex flex-wrap items-center gap-2.5 p-3 sm:p-4 rounded-xl bg-card border border-border shadow-xs text-xs">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-xs ${liveStatus.badgeClass}`}
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
      <div className="p-3.5 rounded-xl bg-surface border border-border flex items-start gap-2.5 text-xs text-foreground leading-relaxed">
        <Info className="size-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
        <div className="space-y-1">
          <p className="font-semibold text-heading">{timerExample}</p>
        </div>
      </div>

      {/* Customer preview */}
      <div className="p-3 rounded-xl bg-primary-soft/50 border border-primary/20 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary shrink-0" aria-hidden="true" />
          <div>
            <span className="font-bold text-heading mr-1.5">{t("customerPreview")} :</span>
            <span className="text-foreground">
              Les clients voient &laquo;&nbsp;{liveStatus.text} {liveStatus.nextInfo}&nbsp;&raquo;
              {upcomingClosure && (
                <span className="text-muted-foreground ml-1.5">
                  · Prochaine fermeture affichée : du {formatDateFr(upcomingClosure.startsOn)} au {formatDateFr(upcomingClosure.endsOn)}
                  {upcomingClosure.reason ? ` (${upcomingClosure.reason})` : ""}
                </span>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
