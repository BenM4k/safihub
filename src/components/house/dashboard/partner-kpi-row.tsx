"use client";

import { useState } from "react";
import { ShoppingBag, Wallet, CheckCircle, Timer } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatAmount } from "@/lib/order-formatters";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { PartnerKpiCell } from "./partner-kpi-cell";
import { PartnerRevenueKpiCell } from "./partner-revenue-kpi-cell";
import type { HouseDashboardMetrics } from "@/dal";

interface PartnerKpiRowProps {
  metrics: HouseDashboardMetrics;
  houseSlug: string;
  className?: string;
}

/**
 * Borderless partner KPI summary row with clean separators and distinct surface background.
 * Lays out in a single row with vertical separators on desktop, and an unclustered
 * 2-column grid with clean vertical/horizontal separators on mobile & tablet.
 */
export function PartnerKpiRow({
  metrics,
  houseSlug,
  className,
}: PartnerKpiRowProps) {
  const t = useTranslations("house.dashboard");
  const [revenuePeriod, setRevenuePeriod] = useState<"day" | "week">("day");

  const netRevenue =
    revenuePeriod === "day"
      ? metrics.todayNetRevenueCDF
      : metrics.weekNetRevenueCDF;
  const previousRevenue =
    revenuePeriod === "day"
      ? metrics.yesterdayNetRevenueCDF
      : metrics.lastWeekNetRevenueCDF;
  const revenueTrendPercent =
    previousRevenue > 0
      ? Math.round(((netRevenue - previousRevenue) / previousRevenue) * 100)
      : null;

  const todayOrdersSubtext = metrics.dailyCapacity
    ? t("todayOrdersCapacity", { max: metrics.dailyCapacity })
    : t("todayOrdersVolume");

  const acceptanceRateValue =
    metrics.acceptanceRate30d !== null ? `${metrics.acceptanceRate30d}%` : "—";
  const acceptanceRateSubtext =
    metrics.acceptanceRateTrend !== null ? (
      <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-bold">
        <span>{t("acceptanceTrend", { trend: metrics.acceptanceRateTrend })}</span>
      </span>
    ) : (
      t("acceptanceTarget")
    );

  return (
    <div
      className={cn(
        "mt-4 sm:mt-6 lg:mt-8 bg-surface dark:bg-card/75 rounded-3xl p-2 sm:p-3.5 border border-border/50 shadow-xs font-sans",
        className
      )}
    >
      {/* Desktop Layout: 1 horizontal row with vertical separators */}
      <div className="hidden lg:flex lg:items-center">
        <PartnerKpiCell
          label={t("todayOrders")}
          value={metrics.todayOrdersCount}
          subtext={todayOrdersSubtext}
          icon={ShoppingBag}
          href={`/partner/${houseSlug}/orders`}
        />

        <Separator orientation="vertical" className="h-12 mx-1 shrink-0 bg-border/60" />

        <PartnerRevenueKpiCell
          netRevenue={netRevenue}
          revenuePeriod={revenuePeriod}
          onPeriodChange={setRevenuePeriod}
          revenueTrendPercent={revenueTrendPercent}
          houseSlug={houseSlug}
        />

        <Separator orientation="vertical" className="h-12 mx-1 shrink-0 bg-border/60" />

        <PartnerKpiCell
          label={t("balanceOwed")}
          value={formatAmount(metrics.balanceOwedCDF)}
          subtext={t("settlementNext", { date: metrics.nextSettlementDate })}
          icon={Wallet}
          href={`/partner/${houseSlug}/settlements`}
          iconBgClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />

        <Separator orientation="vertical" className="h-12 mx-1 shrink-0 bg-border/60" />

        <PartnerKpiCell
          label={t("acceptanceRate30d")}
          value={acceptanceRateValue}
          subtext={acceptanceRateSubtext}
          icon={CheckCircle}
          href={`/partner/${houseSlug}/orders`}
          iconBgClass="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        />

        <Separator orientation="vertical" className="h-12 mx-1 shrink-0 bg-border/60" />

        <PartnerKpiCell
          label={t("avgAcceptanceTime")}
          value={metrics.avgAcceptanceMinutes ? `${metrics.avgAcceptanceMinutes} min` : "—"}
          subtext={t("avgAcceptanceLimit")}
          icon={Timer}
          href={`/partner/${houseSlug}/orders`}
        />
      </div>

      {/* Mobile & Tablet Layout (<1024px): 2 columns with clean horizontal and vertical hairline separators */}
      <div className="lg:hidden">
        <div className="grid grid-cols-2 items-stretch">
          <PartnerKpiCell
            label={t("todayOrders")}
            value={metrics.todayOrdersCount}
            subtext={todayOrdersSubtext}
            icon={ShoppingBag}
            href={`/partner/${houseSlug}/orders`}
            className="pr-2"
          />
          <div className="border-l border-border/60 pl-2 flex flex-col justify-between">
            <PartnerRevenueKpiCell
              netRevenue={netRevenue}
              revenuePeriod={revenuePeriod}
              onPeriodChange={setRevenuePeriod}
              revenueTrendPercent={revenueTrendPercent}
              houseSlug={houseSlug}
            />
          </div>
        </div>

        <Separator className="my-1.5 bg-border/60" />

        <div className="grid grid-cols-2 items-stretch">
          <PartnerKpiCell
            label={t("balanceOwed")}
            value={formatAmount(metrics.balanceOwedCDF)}
            subtext={t("settlementNext", { date: metrics.nextSettlementDate })}
            icon={Wallet}
            href={`/partner/${houseSlug}/settlements`}
            iconBgClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            className="pr-2"
          />
          <div className="border-l border-border/60 pl-2 flex flex-col justify-between">
            <PartnerKpiCell
              label={t("acceptanceRate30d")}
              value={acceptanceRateValue}
              subtext={acceptanceRateSubtext}
              icon={CheckCircle}
              href={`/partner/${houseSlug}/orders`}
              iconBgClass="bg-amber-500/10 text-amber-600 dark:text-amber-400"
            />
          </div>
        </div>

        <Separator className="my-1.5 bg-border/60" />

        <div>
          <PartnerKpiCell
            label={t("avgAcceptanceTime")}
            value={metrics.avgAcceptanceMinutes ? `${metrics.avgAcceptanceMinutes} min` : "—"}
            subtext={t("avgAcceptanceLimit")}
            icon={Timer}
            href={`/partner/${houseSlug}/orders`}
          />
        </div>
      </div>
    </div>
  );
}
