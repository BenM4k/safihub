"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, Calendar, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatFrenchDate } from "@/lib/cash-formatters";

interface DateNavigatorProps {
  currentDate: string; // YYYY-MM-DD
  maxDate?: string;    // YYYY-MM-DD, defaults to today
  baseUrl?: string;    // defaults to /admin/cash
}

export function DateNavigator({
  currentDate,
  maxDate,
  baseUrl = "/admin/cash",
}: DateNavigatorProps) {
  const router = useRouter();
  const t = useTranslations("admin.cash");
  const [isPending, startTransition] = useTransition();

  // Today in Africa/Lubumbashi
  const todayLubumbashi =
    maxDate ??
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Africa/Lubumbashi",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

  const isToday = currentDate === todayLubumbashi;
  const isFuture = currentDate > todayLubumbashi;

  const navigateToDate = (targetDate: string) => {
    if (targetDate > todayLubumbashi) return;
    startTransition(() => {
      router.push(`${baseUrl}?date=${targetDate}`);
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
      if (val > todayLubumbashi) {
        navigateToDate(todayLubumbashi);
      } else {
        navigateToDate(val);
      }
    }
  };

  return (
    <div className="flex items-center gap-2 bg-card p-1 rounded-xl border border-border-strong shadow-2xs flex-wrap sm:flex-nowrap">
      {/* Day step buttons */}
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => shiftDay(-1)}
          disabled={isPending}
          className="size-10 p-0 min-h-[40px] hover:bg-surface text-ink-700 focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
          title={t("dateNavPrev")}
          aria-label={t("dateNavPrev")}
        >
          <ChevronLeft className="size-4.5" />
        </Button>

        {/* Date Display & Picker */}
        <div className="relative flex items-center gap-2 px-3 py-1.5 bg-surface rounded-lg border border-border-strong min-h-[40px]">
          <Calendar className="size-4 text-ink-500 shrink-0 pointer-events-none" aria-hidden="true" />
          <span className="font-mono text-xs font-bold text-heading tabular-nums whitespace-nowrap">
            {formatFrenchDate(currentDate)}
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
          size="sm"
          onClick={() => shiftDay(1)}
          disabled={isPending || isToday || isFuture}
          className="size-10 p-0 min-h-[40px] hover:bg-surface text-ink-700 disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
          title={t("dateNavNext")}
          aria-label={t("dateNavNext")}
        >
          <ChevronRight className="size-4.5" />
        </Button>
      </div>

      {/* Aujourd'hui shortcut */}
      {!isToday && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => navigateToDate(todayLubumbashi)}
          disabled={isPending}
          className="h-10 px-3 text-xs font-semibold bg-white hover:bg-surface text-primary border-primary/40 min-h-[40px] focus-visible:ring-2 focus-visible:ring-primary rounded-lg shadow-2xs"
        >
          {t("dateNavToday")}
        </Button>
      )}

      {/* Business-day boundary tooltip info */}
      <span
        className="text-ink-400 hover:text-ink-600 transition-colors p-2 cursor-help hidden sm:inline-block"
        title={t("dateNavTzTooltip")}
        aria-label={t("dateNavTzAria")}
      >
        <Info className="size-4" />
      </span>
    </div>
  );
}
