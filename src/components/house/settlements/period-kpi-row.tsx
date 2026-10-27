"use client";

import { useTranslations } from "next-intl";
import { ArrowDownRight, ArrowUpRight, CircleDollarSign, Minus, Percent, Receipt, Wallet } from "lucide-react";
import { formatMoney } from "@/lib/cash-formatters";
import type { PartnerSettlementKpiData } from "@/types/partner-settlements";

interface PeriodKpiRowProps {
  kpis: PartnerSettlementKpiData;
}

export function PeriodKpiRow({ kpis }: PeriodKpiRowProps) {
  const t = useTranslations("house.settlements");

  function renderTrend(diff: number | null, percent: number | null) {
    if (diff === null || diff === 0) {
      return (
        <span className="text-[10px] text-muted-foreground/60 flex items-center gap-1 leading-tight">
          <Minus className="size-2.5 text-muted-foreground/50 shrink-0" aria-hidden="true" />
          <span>{t("stableVsPrevious")}</span>
        </span>
      );
    }

    const isUp = diff > 0;
    const Arrow = isUp ? ArrowUpRight : ArrowDownRight;
    const color = isUp ? "text-emerald-600 dark:text-emerald-400" : "text-destructive";
    const sign = isUp ? "+" : "";

    return (
      <div className="flex items-center gap-1 text-[10px] leading-tight flex-wrap">
        <span className={`inline-flex items-center gap-0.5 font-medium ${color}`}>
          <Arrow className="size-2.5 shrink-0" aria-hidden="true" />
          <span>
            {percent !== null ? `${sign}${percent}%` : `${sign}${formatMoney(diff, "").trim()}`}
          </span>
        </span>
        <span className="text-muted-foreground/60 font-normal">{t("vsPrevious")}</span>
      </div>
    );
  }

  return (
    <div className="bg-muted/40 dark:bg-card/75 rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 border border-border/70 shadow-xs font-sans space-y-4">
      {/* Responsive unified grid: 2x2 on mobile (<md) with hairline cross-divider, 4 columns on desktop (>=md) with vertical dividers */}
      <div className="grid grid-cols-2 md:grid-cols-4 md:divide-x md:divide-border/60">
        {/* 1. Chiffre d'affaires brut (Top-Left on mobile) */}
        <div className="pr-3 pb-3.5 md:p-0 md:px-5 first:md:pl-0 border-r border-b border-border/60 md:border-r-0 md:border-b-0 space-y-1.5">
          {/* Layer 1: Label */}
          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-muted-foreground font-medium">
            <CircleDollarSign className="size-3.5 text-primary/80 shrink-0" aria-hidden="true" />
            <span className="truncate">{t("grossRevenue")}</span>
          </div>
          {/* Layer 2: Big Price (Dominant on mobile) */}
          <div className="flex items-baseline">
            <span className="text-2xl sm:text-2xl lg:text-3xl font-black font-mono tracking-tight text-foreground tabular-nums">
              {formatMoney(kpis.grossRevenueCDF, "").trim()}
            </span>
            <span className="text-2xs sm:text-xs font-semibold font-mono text-muted-foreground/60 ml-1">
              CDF
            </span>
          </div>
          {/* Layer 3: Secondary Meta (Much smaller, compact) */}
          <div className="pt-0.5">{renderTrend(kpis.grossTrendDiffCDF, kpis.grossTrendPercent)}</div>
        </div>

        {/* 2. Commissions SafiHub (Top-Right on mobile) */}
        <div className="pl-3 pb-3.5 md:p-0 md:px-5 border-b border-border/60 md:border-b-0 space-y-1.5">
          {/* Layer 1: Label */}
          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-muted-foreground font-medium">
            <Percent className="size-3.5 text-muted-foreground/70 shrink-0" aria-hidden="true" />
            <span className="truncate">{t("commissionsPlatform", { rate: kpis.commissionRatePercent })}</span>
          </div>
          {/* Layer 2: Big Price (Dominant on mobile) */}
          <div className="flex items-baseline">
            <span className="text-2xl sm:text-2xl lg:text-3xl font-black font-mono tracking-tight text-muted-foreground/90 tabular-nums">
              -{formatMoney(kpis.commissionCDF, "").trim()}
            </span>
            <span className="text-2xs sm:text-xs font-semibold font-mono text-muted-foreground/60 ml-1">
              CDF
            </span>
          </div>
          {/* Layer 3: Secondary Meta (Much smaller, compact) */}
          <div className="pt-0.5 text-[10px] text-muted-foreground/60 font-normal leading-tight">
            {t("automaticDeduction")}
          </div>
        </div>

        {/* 3. Net à percevoir - HERO METRIC (Bottom-Left on mobile) */}
        <div className="pr-3 pt-3.5 md:p-0 md:px-5 border-r border-border/60 md:border-r-0 space-y-1.5">
          {/* Layer 1: Label (Hero accented) */}
          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-emerald-700 dark:text-emerald-300 font-semibold">
            <Wallet className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
            <span className="truncate">{t("netReceivable")}</span>
          </div>
          {/* Layer 2: Big Price - Maximum prominence */}
          <div className="flex items-baseline">
            <span className="text-3xl sm:text-3xl lg:text-4xl font-black font-mono tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
              {formatMoney(kpis.netReceivableCDF, "").trim()}
            </span>
            <span className="text-2xs sm:text-xs font-bold font-mono text-emerald-700/70 dark:text-emerald-300/70 ml-1">
              CDF
            </span>
          </div>
          {/* Layer 3: Secondary Meta (Much smaller, compact) */}
          <div className="pt-0.5">{renderTrend(kpis.netTrendDiffCDF, kpis.netTrendPercent)}</div>
        </div>

        {/* 4. Total versé (Bottom-Right on mobile) */}
        <div className="pl-3 pt-3.5 md:p-0 md:px-5 last:md:pr-0 space-y-1.5">
          {/* Layer 1: Label */}
          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-muted-foreground font-medium">
            <Receipt className="size-3.5 text-emerald-600/70 dark:text-emerald-400/70 shrink-0" aria-hidden="true" />
            <span className="truncate">{t("totalSettledLabel")}</span>
          </div>
          {/* Layer 2: Big Price (Dominant on mobile) */}
          <div className="flex items-baseline">
            <span className="text-2xl sm:text-2xl lg:text-3xl font-black font-mono tracking-tight text-emerald-600/90 dark:text-emerald-400/90 tabular-nums">
              {formatMoney(kpis.totalSettledCDF, "").trim()}
            </span>
            <span className="text-2xs sm:text-xs font-semibold font-mono text-muted-foreground/60 ml-1">
              CDF
            </span>
          </div>
          {/* Layer 3: Secondary Meta (Much smaller, compact) */}
          <div className="pt-0.5 text-[10px] text-muted-foreground/60 font-normal leading-tight">
            {t("payoutsReceivedPeriod")}
          </div>
        </div>
      </div>

      {/* Adjustments note if any */}
      {kpis.adjustmentsCDF !== 0 && (
        <div className="pt-2 border-t border-border/60 text-2xs text-muted-foreground flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <span>
            * Ajustement de {formatMoney(kpis.adjustmentsCDF, "CDF")} appliqué sur la période suite à des régularisations exceptionnelles.
          </span>
          <span className="font-mono font-bold text-foreground">
            {formatMoney(kpis.grossRevenueCDF)} − {formatMoney(kpis.commissionCDF)} + {formatMoney(kpis.adjustmentsCDF)} = {formatMoney(kpis.netReceivableCDF)}
          </span>
        </div>
      )}
    </div>
  );
}
