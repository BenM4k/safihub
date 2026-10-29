"use client";

import { BarChart3, AlertTriangle, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatAmount } from "@/lib/order-formatters";
import { cn } from "@/lib/utils";
import type { HouseDashboardMetrics } from "@/dal";

interface PartnerAnalyticsProps {
  metrics: HouseDashboardMetrics;
  houseSlug: string;
  className?: string;
}

export function PartnerAnalytics({ metrics, className }: PartnerAnalyticsProps) {
  const t = useTranslations("house.dashboard");
  const capacity = metrics.dailyCapacity ?? 30;
  const used = metrics.todayOrdersCount;
  const capacityPercent = Math.min(100, Math.round((used / capacity) * 100));
  const isHighCapacity = capacityPercent >= 80;

  const maxRevenue = Math.max(...metrics.dailyChart.map((d) => d.revenueCDF ?? 0), 1000);

  return (
    <div className={cn("grid lg:grid-cols-3 gap-4 font-sans", className)}>
      {/* 1. Accessible Bar Chart (7 derniers jours) */}
      <div className="lg:col-span-2 p-4 sm:p-5 rounded-2xl bg-card shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
              <BarChart3 className="size-4.5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base sm:text-lg text-heading tracking-tight">
                {t("analyticsTitle")}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                {t("analyticsSubtitle")}
              </p>
            </div>
          </div>
        </div>

        {/* CSS/SVG Bar Chart with Accessible Tooltips */}
        <div className="space-y-3 pt-2">
          <div className="h-44 flex items-end justify-between gap-2 sm:gap-4 px-2 pt-4 border-b border-border/60">
            {metrics.dailyChart.map((point, index) => {
              const rev = point.revenueCDF ?? 0;
              const heightPercent = Math.max(8, Math.round((rev / maxRevenue) * 100));
              const revLabel = point.revenueCDF !== null ? formatAmount(point.revenueCDF) : "--";
              const countLabel = point.ordersCount !== null ? `${point.ordersCount} cmd(s)` : "--";

              const isFirst = index === 0;
              const isLast = index === metrics.dailyChart.length - 1;
              const tooltipAlignClass = isFirst
                ? "left-0 translate-x-0"
                : isLast
                ? "right-0 translate-x-0"
                : "left-1/2 -translate-x-1/2";

              return (
                <div
                  key={point.date}
                  className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative"
                >
                  {/* Tooltip on hover/focus */}
                  <div className={`absolute -top-12 ${tooltipAlignClass} opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity bg-heading text-background text-[10px] font-bold py-1 px-2 rounded-lg pointer-events-none whitespace-nowrap z-20 shadow-md`}>
                    <div>{revLabel}</div>
                    <div className="text-muted-foreground font-normal">{countLabel}</div>
                  </div>

                  {/* Visual Bar */}
                  <div
                    tabIndex={0}
                    role="img"
                    aria-label={`${point.label} : ${countLabel}, ${revLabel}`}
                    style={{ height: `${heightPercent}%` }}
                    className="w-full max-w-[36px] rounded-t-lg bg-primary hover:bg-primary-hover transition-all cursor-pointer focus:outline-ring"
                  />

                  {/* Day label */}
                  <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground group-hover:text-heading truncate text-center max-w-full">
                    {point.label}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-muted-foreground text-center">
            {t("analyticsLegend")}
          </p>
        </div>
      </div>

      {/* 2. Capacity & Performance Side Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
        {/* Capacity Widget */}
        <div className="p-4 sm:p-5 rounded-2xl bg-card shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-heading">
              {t("capacityTitle")}
            </span>
            {isHighCapacity && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-900 dark:text-amber-200 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                <AlertTriangle className="size-3 text-amber-600 dark:text-amber-400" />
                {t("capacityThreshold80")}
              </span>
            )}
          </div>

          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-heading font-display">
                {used} / {metrics.dailyCapacity ? metrics.dailyCapacity : `${capacity} max`}
              </span>
              <span className="text-xs font-semibold text-muted-foreground">
                {capacityPercent}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-slate-100 dark:bg-muted rounded-full mt-2 overflow-hidden">
              <div
                style={{ width: `${capacityPercent}%` }}
                className={`h-full rounded-full transition-all duration-300 ${
                  isHighCapacity ? "bg-amber-500" : "bg-primary"
                }`}
              />
            </div>
          </div>

          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
            {metrics.dailyCapacity
              ? t("capacityConfiguredDesc")
              : t("capacityUnconfiguredDesc")}
          </p>
        </div>

        {/* Performance Widget */}
        <div className="p-4 sm:p-5 rounded-2xl bg-card shadow-xs space-y-3">
          <span className="text-xs font-bold text-heading block">
            {t("performanceTitle")}
          </span>

          <div className="grid grid-cols-2 divide-x divide-border/60 bg-surface dark:bg-card/60 rounded-xl p-1">
            <div className="p-2.5 sm:p-3">
              <span className="text-[10px] font-semibold text-muted-foreground block uppercase">
                {t("onTimeRate")}
              </span>
              <span className="text-lg font-bold text-success font-display block mt-1">
                {metrics.onTimeDeliveryRate ? `${metrics.onTimeDeliveryRate}%` : "—"}
              </span>
              <span className="text-[10px] text-muted-foreground">{t("vsPromised")}</span>
            </div>

            <div className="p-2.5 sm:p-3 pl-3 sm:pl-4">
              <span className="text-[10px] font-semibold text-muted-foreground block uppercase">
                {t("averageRating")}
              </span>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-lg font-bold text-heading font-display">
                  {metrics.house.rating ? metrics.house.rating.toFixed(1) : "—"}
                </span>
                {metrics.house.rating && <Star className="size-4 fill-amber-400 text-amber-500" />}
              </div>
              <span className="text-[10px] text-muted-foreground">{t("customerReviews")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
