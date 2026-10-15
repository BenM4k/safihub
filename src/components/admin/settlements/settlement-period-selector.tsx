"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Calendar, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getWeekBounds,
  formatWeekRange,
  getNextSettlementDateFormatted,
} from "./period-utils";

interface SettlementPeriodSelectorProps {
  currentWeekString?: string; // YYYY-Www, defaults to current week
  baseUrl?: string;
}

export function SettlementPeriodSelector({
  currentWeekString,
  baseUrl = "/admin/settlements",
}: SettlementPeriodSelectorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const currentBounds = getWeekBounds();
  const activeWeekString = currentWeekString ?? currentBounds.weekString;
  const isCurrentWeek = activeWeekString === currentBounds.weekString;

  // Parse YYYY-Www to reference Date for calculation
  const getReferenceDateForWeek = (weekStr: string): Date => {
    const match = weekStr.match(/^(\d{4})-W(\d{2})$/);
    if (!match) return new Date();
    const year = Number(match[1]);
    const week = Number(match[2]);
    // 4th of January is always in week 1
    const simple = new Date(Date.UTC(year, 0, 4));
    const dayOfWeek = simple.getUTCDay() || 7;
    const mondayWeek1 = new Date(simple);
    mondayWeek1.setUTCDate(simple.getUTCDate() - dayOfWeek + 1);
    const targetMonday = new Date(mondayWeek1);
    targetMonday.setUTCDate(mondayWeek1.getUTCDate() + (week - 1) * 7);
    return targetMonday;
  };

  const activeDate = getReferenceDateForWeek(activeWeekString);
  const activeBounds = getWeekBounds(activeDate);

  const navigateToWeek = (targetWeek: string) => {
    startTransition(() => {
      router.push(`${baseUrl}?period=${targetWeek}`);
    });
  };

  const shiftWeek = (weeks: number) => {
    const nextDate = new Date(activeDate);
    nextDate.setDate(activeDate.getDate() + weeks * 7);
    const nextBounds = getWeekBounds(nextDate);
    navigateToWeek(nextBounds.weekString);
  };

  const nextSettlementDate = getNextSettlementDateFormatted();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-2 rounded-xl border border-border-strong shadow-2xs">
      <div className="flex items-center gap-1.5 flex-wrap">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => shiftWeek(-1)}
          disabled={isPending}
          className="size-10 p-0 min-h-[40px] hover:bg-surface text-ink-700 focus-visible:ring-2 focus-visible:ring-primary rounded-lg border border-border-strong"
          title="Semaine précédente"
          aria-label="Semaine précédente"
        >
          <ChevronLeft className="size-4.5" />
        </Button>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-surface rounded-lg border border-border-strong min-h-[40px]">
          <Calendar className="size-4 text-ink-500 shrink-0" aria-hidden="true" />
          <span className="font-mono text-xs font-bold text-heading tabular-nums">
            {activeBounds.weekString} · {formatWeekRange(activeBounds.start, activeBounds.end)}
          </span>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => shiftWeek(1)}
          disabled={isPending}
          className="size-10 p-0 min-h-[40px] hover:bg-surface text-ink-700 focus-visible:ring-2 focus-visible:ring-primary rounded-lg border border-border-strong"
          title="Semaine suivante"
          aria-label="Semaine suivante"
        >
          <ChevronRight className="size-4.5" />
        </Button>

        {!isCurrentWeek && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigateToWeek(currentBounds.weekString)}
            disabled={isPending}
            className="h-10 px-3 text-xs font-semibold bg-white hover:bg-surface text-primary border-primary/40 min-h-[40px] focus-visible:ring-2 focus-visible:ring-primary rounded-lg shadow-2xs"
          >
            Semaine actuelle
          </Button>
        )}
      </div>

      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-border-strong rounded-lg text-xs text-ink-700 font-medium">
        <CalendarClock className="size-4 text-primary shrink-0" aria-hidden="true" />
        <span>Prochain règlement :</span>
        <span className="font-bold text-heading capitalize">{nextSettlementDate}</span>
      </div>
    </div>
  );
}
