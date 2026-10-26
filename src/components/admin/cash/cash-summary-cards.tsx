"use client";

import { useTranslations } from "next-intl";
import { ArrowDownLeft, ArrowUpRight, Scale, CheckCircle2, ShieldAlert, AlertCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { formatMoney, getDiscrepancyInfo } from "@/lib/cash-formatters";

interface CashSummaryCardsProps {
  summary: {
    totalExpectedCDF: number;
    totalReceivedCDF: number;
    totalDiscrepancyCDF: number;
    couriersCount?: number;
    reconciledCount?: number;
    pendingCount?: number;
  };
}

export function CashSummaryCards({ summary }: CashSummaryCardsProps) {
  const t = useTranslations("admin.cash");

  const diffInfo = getDiscrepancyInfo(summary.totalDiscrepancyCDF, "CDF");

  // Determine icon & color for Discrepancy
  let DiscrepancyIcon = Scale;
  let discrepancyColor = "text-foreground";
  if (diffInfo.isZero) {
    DiscrepancyIcon = CheckCircle2;
    discrepancyColor = "text-emerald-600 dark:text-emerald-400";
  } else if (diffInfo.isShortage) {
    DiscrepancyIcon = ShieldAlert;
    discrepancyColor = "text-rose-600 dark:text-rose-400";
  } else if (diffInfo.isSurplus) {
    DiscrepancyIcon = AlertCircle;
    discrepancyColor = "text-amber-600 dark:text-amber-400";
  }

  const totalCouriers = summary.couriersCount ?? 0;
  const reconciledCouriers = summary.reconciledCount ?? 0;
  const pendingCouriers = summary.pendingCount ?? (totalCouriers - reconciledCouriers);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center py-1">
      {/* 1. Attendu */}
      <div className="flex-1 p-3 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
            {t("totalExpected")}
          </p>
          <ArrowDownLeft className="size-3.5 text-muted-foreground shrink-0" />
        </div>
        <p className="text-2xl font-bold font-mono tabular-nums text-foreground mt-1.5">
          {formatMoney(summary.totalExpectedCDF)}
        </p>
        {totalCouriers > 0 && (
          <p className="text-[11px] text-muted-foreground mt-1 truncate">
            {t("activeCouriersCount", { count: totalCouriers })}
          </p>
        )}
      </div>

      <Separator orientation="vertical" className="hidden sm:block h-12 mx-4 shrink-0" />
      <Separator orientation="horizontal" className="sm:hidden my-2" />

      {/* 2. Reçu */}
      <div className="flex-1 p-3 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
            {t("totalReceived")}
          </p>
          <ArrowUpRight className="size-3.5 text-muted-foreground shrink-0" />
        </div>
        <p className="text-2xl font-bold font-mono tabular-nums text-foreground mt-1.5">
          {formatMoney(summary.totalReceivedCDF)}
        </p>
        {totalCouriers > 0 && (
          <p className="text-[11px] text-muted-foreground mt-1 truncate">
            {t("reconciledCountSummary", {
              reconciled: reconciledCouriers,
              pending: pendingCouriers,
            })}
          </p>
        )}
      </div>

      <Separator orientation="vertical" className="hidden sm:block h-12 mx-4 shrink-0" />
      <Separator orientation="horizontal" className="sm:hidden my-2" />

      {/* 3. Écart total */}
      <div className="flex-1 p-3 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
            {t("totalDiscrepancy")}
          </p>
          <DiscrepancyIcon className={`size-3.5 shrink-0 ${discrepancyColor}`} />
        </div>
        <p className={`text-2xl font-bold font-mono tabular-nums mt-1.5 ${discrepancyColor}`}>
          {diffInfo.formattedAmount}
        </p>
        <p className={`text-[11px] font-semibold mt-1 truncate ${discrepancyColor}`}>
          {diffInfo.isZero
            ? t("balancedStatus")
            : diffInfo.isShortage
            ? t("shortageStatus")
            : t("surplusStatus")}
        </p>
      </div>
    </div>
  );
}
