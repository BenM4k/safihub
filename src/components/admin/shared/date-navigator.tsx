"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, Calendar, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toBukavuDateTime } from "@/services/availability/bukavu-time";

interface DateNavigatorProps {
  currentDate: string; // YYYY-MM-DD
  maxDate?: string; // YYYY-MM-DD, defaults to today in Bukavu
  baseUrl?: string; // defaults to /admin/cash
}

function formatLocalizedBusinessDate(dateStr: string, locale: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  const dateObj = new Date(`${dateStr}T12:00:00Z`);
  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(dateObj);
}

export function DateNavigator({
  currentDate,
  maxDate,
  baseUrl = "/admin/cash",
}: DateNavigatorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations("admin.cash");
  const [isPending, startTransition] = useTransition();

  const todayLubumbashi = maxDate ?? toBukavuDateTime(new Date()).dateString;
  const isToday = currentDate === todayLubumbashi;
  const isFuture = currentDate > todayLubumbashi;

  const navigateToDate = (targetDate: string) => {
    if (targetDate > todayLubumbashi) return;
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("date", targetDate);
    startTransition(() => {
      router.push(`${baseUrl}?${nextParams.toString()}`);
    });
  };

  const shiftDay = (days: number) => {
    const [y, m, d] = currentDate.split("-").map(Number);
    const dateObj = new Date(Date.UTC(y, m - 1, d + days, 12, 0, 0));
    const target = dateObj.toISOString().slice(0, 10);
    navigateToDate(target);
  };

  const handleDateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
      navigateToDate(val > todayLubumbashi ? todayLubumbashi : val);
    }
  };

  return (
    <div className="flex items-center gap-2 bg-card p-1 rounded-xl border border-border shadow-2xs flex-wrap sm:flex-nowrap">
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => shiftDay(-1)}
          disabled={isPending}
          className="min-h-11 min-w-11 sm:size-10 p-0 hover:bg-surface text-ink-700 focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
          title={t("dateNavPrev")}
          aria-label={t("dateNavPrev")}
        >
          <ChevronLeft className="size-4.5" aria-hidden="true" />
        </Button>

        <div className="relative flex items-center gap-2 px-3 py-1.5 bg-surface rounded-lg border border-border min-h-11 sm:min-h-10">
          <Calendar className="size-4 text-ink-500 shrink-0 pointer-events-none" aria-hidden="true" />
          <span className="font-mono text-xs font-bold text-heading tabular-nums whitespace-nowrap">
            {formatLocalizedBusinessDate(currentDate, locale)}
          </span>
          <input
            type="date"
            max={todayLubumbashi}
            value={currentDate}
            onChange={handleDateInput}
            disabled={isPending}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            aria-label={t("dateNavSelectAria")}
          />
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => shiftDay(1)}
          disabled={isPending || isToday || isFuture}
          className="min-h-11 min-w-11 sm:size-10 p-0 hover:bg-surface text-ink-700 disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
          title={t("dateNavNext")}
          aria-label={t("dateNavNext")}
        >
          <ChevronRight className="size-4.5" aria-hidden="true" />
        </Button>
      </div>

      {!isToday && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => navigateToDate(todayLubumbashi)}
          disabled={isPending}
          className="min-h-11 sm:min-h-10 px-3 text-xs font-semibold bg-card hover:bg-surface text-primary border-primary/40 focus-visible:ring-2 focus-visible:ring-primary rounded-lg shadow-2xs"
        >
          {t("dateNavToday")}
        </Button>
      )}

      <Tooltip>
        <TooltipTrigger
          render={
            <span
              tabIndex={0}
              className="text-muted-foreground hover:text-heading transition-colors p-2 cursor-help hidden sm:inline-flex items-center"
              aria-label={t("dateNavTzAria")}
            />
          }
        >
          <Info className="size-4" aria-hidden="true" />
        </TooltipTrigger>
        <TooltipContent>{t("dateNavTzTooltip")}</TooltipContent>
      </Tooltip>
    </div>
  );
}
