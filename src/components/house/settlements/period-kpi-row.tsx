"use client";

import { useTranslations } from "next-intl";
import { ArrowDownRight, ArrowUpRight, CircleDollarSign, Minus, Percent, Receipt, Wallet } from "lucide-react";
import { formatMoney } from "@/lib/cash-formatters";
import type { PartnerSettlementKpiData } from "@/types/partner-settlements";
import { Separator } from "@/components/ui/separator";

interface PeriodKpiRowProps {
  kpis: PartnerSettlementKpiData;
}

export function PeriodKpiRow({ kpis }: PeriodKpiRowProps) {
  const t = useTranslations("house.settlements");

  function renderTrend(diff: number | null, percent: number | null) {
    if (diff === null || diff === 0) {
      return (
        <span className="flex items-center gap-1 text-2xs text-muted-foreground">
          <Minus className="size-3" aria-hidden="true" />
          <span>{t("stableVsPrevious")}</span>
        </span>
      );
    }

    const isUp = diff > 0;
    const Arrow = isUp ? ArrowUpRight : ArrowDownRight;
    const color = isUp ? "text-emerald-600 dark:text-emerald-400" : "text-destructive";
    const sign = isUp ? "+" : "";

    return (
      <span className={`flex items-center gap-1 text-2xs font-semibold ${color}`}>
        <Arrow className="size-3.5" aria-hidden="true" />
        <span>
          {sign}{formatMoney(diff, "CDF")} {percent !== null ? `(${sign}${percent}%)` : ""}{" "}
          <span className="text-muted-foreground font-normal">{t("vsPrevious")}</span>
        </span>
      </span>
    );
  }

  return (
    <div className="space-y-4 py-2">
      {/* Seamless KPI row with vertical separators on lg screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:divide-x lg:divide-border/60">
        {/* 1. Chiffre d'affaires brut */}
        <div className="space-y-1.5 lg:px-6 first:lg:pl-0">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <CircleDollarSign className="size-4 text-primary shrink-0" aria-hidden="true" />
            <span>{t("grossRevenue")}</span>
          </div>
          <div className="text-2xl font-black font-mono tracking-tight text-foreground tabular-nums">
            {formatMoney(kpis.grossRevenueCDF, "CDF")}
          </div>
          <div className="pt-0.5">{renderTrend(kpis.grossTrendDiffCDF, kpis.grossTrendPercent)}</div>
        </div>

        {/* 2. Commissions SafiHub */}
        <div className="space-y-1.5 lg:px-6">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Percent className="size-4 text-muted-foreground shrink-0" aria-hidden="true" />
            <span>{t("commissionsPlatform", { rate: kpis.commissionRatePercent })}</span>
          </div>
          <div className="text-2xl font-black font-mono tracking-tight text-muted-foreground tabular-nums">
            -{formatMoney(kpis.commissionCDF, "CDF")}
          </div>
          <div className="text-2xs text-muted-foreground pt-0.5">{t("automaticDeduction")}</div>
        </div>

        {/* 3. Net à percevoir */}
        <div className="space-y-1.5 lg:px-6">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Wallet className="size-4 text-primary shrink-0" aria-hidden="true" />
            <span>{t("netReceivable")}</span>
          </div>
          <div className="text-2xl font-black font-mono tracking-tight text-primary tabular-nums">
            {formatMoney(kpis.netReceivableCDF, "CDF")}
          </div>
          <div className="pt-0.5">{renderTrend(kpis.netTrendDiffCDF, kpis.netTrendPercent)}</div>
        </div>

        {/* 4. Total versé */}
        <div className="space-y-1.5 lg:px-6 last:lg:pr-0">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Receipt className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
            <span>{t("totalSettledLabel")}</span>
          </div>
          <div className="text-2xl font-black font-mono tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
            {formatMoney(kpis.totalSettledCDF, "CDF")}
          </div>
          <div className="text-2xs text-muted-foreground pt-0.5">{t("payoutsReceivedPeriod")}</div>
        </div>
      </div>

      {/* Adjustments note if any */}
      {kpis.adjustmentsCDF !== 0 && (
        <div className="text-2xs text-muted-foreground py-2 px-3 rounded-lg bg-muted/40 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <span>
            * Ajustement de {formatMoney(kpis.adjustmentsCDF, "CDF")} appliqué sur la période suite à des régularisations exceptionnelles.
          </span>
          <span className="font-mono font-bold text-foreground">
            {formatMoney(kpis.grossRevenueCDF)} − {formatMoney(kpis.commissionCDF)} + {formatMoney(kpis.adjustmentsCDF)} = {formatMoney(kpis.netReceivableCDF)}
          </span>
        </div>
      )}
      <Separator />
    </div>
  );
}
