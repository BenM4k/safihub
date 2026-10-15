"use client";

import { useTranslations } from "next-intl";
import { ArrowDownLeft, ArrowUpRight, Scale, CheckCircle2, ShieldAlert, AlertCircle } from "lucide-react";
import { KpiCard, type KpiCardVariant } from "@/components/admin/shared/kpi-card";
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

  // Determine variant for Discrepancy card
  let discrepancyVariant: KpiCardVariant = "default";
  let DiscrepancyIcon = Scale;
  if (diffInfo.isZero) {
    discrepancyVariant = "success";
    DiscrepancyIcon = CheckCircle2;
  } else if (diffInfo.isShortage) {
    discrepancyVariant = "destructive";
    DiscrepancyIcon = ShieldAlert;
  } else if (diffInfo.isSurplus) {
    discrepancyVariant = "warning";
    DiscrepancyIcon = AlertCircle;
  }

  // Couriers secondary lines
  const totalCouriers = summary.couriersCount ?? 0;
  const reconciledCouriers = summary.reconciledCount ?? 0;
  const pendingCouriers = summary.pendingCount ?? (totalCouriers - reconciledCouriers);

  const couriersSecondary =
    totalCouriers > 0 ? (
      <span>
        {t("activeCouriersCount", { count: totalCouriers })}
      </span>
    ) : undefined;

  const reconciliationProgressSecondary =
    totalCouriers > 0 ? (
      <span>
        {t("reconciledCountSummary", {
          reconciled: reconciledCouriers,
          pending: pendingCouriers,
        })}
      </span>
    ) : undefined;

  const discrepancyStatusSecondary = (
    <span className={`font-semibold ${diffInfo.colorClass}`}>
      {diffInfo.isZero
        ? t("balancedStatus")
        : diffInfo.isShortage
        ? t("shortageStatus")
        : t("surplusStatus")}
    </span>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* 1. Attendu */}
      <KpiCard
        label={t("totalExpected")}
        value={formatMoney(summary.totalExpectedCDF)}
        icon={ArrowDownLeft}
        tooltip={t("expectedTooltip")}
        secondary={couriersSecondary}
        variant="default"
      />

      {/* 2. Reçu */}
      <KpiCard
        label={t("totalReceived")}
        value={formatMoney(summary.totalReceivedCDF)}
        icon={ArrowUpRight}
        tooltip={t("receivedTooltip")}
        secondary={reconciliationProgressSecondary}
        variant="default"
      />

      {/* 3. Écart total */}
      <KpiCard
        label={t("totalDiscrepancy")}
        value={diffInfo.formattedAmount}
        icon={DiscrepancyIcon}
        formula={t("formulaTooltip")}
        tooltip={t("discrepancyTooltip")}
        secondary={discrepancyStatusSecondary}
        variant={discrepancyVariant}
      />
    </div>
  );
}
