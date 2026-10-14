import { getTranslations } from "next-intl/server";
import type { AdminDashboardMetrics } from "@/dal";
import { PilotScorecard } from "./pilot-scorecard";
import type { ScorecardRowData } from "./scorecard-row";

interface PilotSuccessSectionProps {
  metrics: AdminDashboardMetrics;
}

export async function PilotSuccessSection({ metrics }: PilotSuccessSectionProps) {
  const t = await getTranslations("admin.dashboard");

  const criteria: ScorecardRowData[] = [
    {
      id: "orders_per_week",
      metric: t("ordersPerWeek"),
      formula: t("ordersPerWeekDesc"),
      currentDisplay: t("ordersPerWeekUnit", { count: metrics.ordersPerWeek }),
      targetDisplay: t("ordersPerWeekTarget"),
      progressPercent: Math.min(100, Math.round((metrics.ordersPerWeek / 20) * 100)),
      status: metrics.ordersPerWeek >= 20 ? "met" : metrics.ordersPerWeek >= 10 ? "at-risk" : "failing",
    },
    {
      id: "acceptance_rate",
      metric: t("acceptanceRate"),
      formula: t("acceptanceRateDesc"),
      currentDisplay: `${metrics.acceptanceRatePercent}%`,
      targetDisplay: t("acceptanceRateTarget"),
      progressPercent: metrics.acceptanceRatePercent,
      status: metrics.acceptanceRatePercent >= 80 ? "met" : metrics.acceptanceRatePercent >= 60 ? "at-risk" : "failing",
    },
    {
      id: "net_margin",
      metric: t("marginPerOrder"),
      formula: t("marginPerOrderDesc"),
      currentDisplay: `CDF ${metrics.marginPerOrderCDF.toLocaleString("en-US")}`,
      targetDisplay: t("marginPerOrderTarget"),
      progressPercent: metrics.marginPerOrderCDF > 0 ? 100 : 0,
      status: metrics.marginPerOrderCDF > 0 ? "met" : "at-risk",
    },
    {
      id: "cash_discrepancy",
      metric: t("cashDiscrepancies"),
      formula: t("cashDiscrepanciesDesc"),
      currentDisplay: `${metrics.cashDiscrepancyPercent.toFixed(1)}%`,
      targetDisplay: t("cashDiscrepanciesTarget"),
      progressPercent: Math.min(100, Math.round((metrics.cashDiscrepancyPercent / 2) * 100)),
      status: metrics.cashDiscrepancyPercent < 2 ? "met" : "failing",
    },
    {
      id: "dispute_rate",
      metric: t("disputeRate"),
      formula: t("disputeRateDesc"),
      currentDisplay: `${metrics.disputeRatePercent.toFixed(1)}%`,
      targetDisplay: t("disputeRateTarget"),
      progressPercent: Math.min(100, Math.round((metrics.disputeRatePercent / 5) * 100)),
      status: metrics.disputeRatePercent < 5 ? "met" : "failing",
    },
    {
      id: "admin_minutes",
      metric: t("adminMinutesPerOrder"),
      formula: t("adminMinutesDesc"),
      currentDisplay: metrics.adminMinutesPerOrder !== null ? `${metrics.adminMinutesPerOrder} min` : "—",
      targetDisplay: t("adminMinutesPerOrderTarget"),
      progressPercent:
        metrics.adminMinutesPerOrder !== null
          ? Math.min(100, Math.round((metrics.adminMinutesPerOrder / 10) * 100))
          : null,
      status:
        metrics.adminMinutesPerOrder === null
          ? "no-data"
          : metrics.adminMinutesPerOrder <= 10
          ? "met"
          : "at-risk",
    },
  ];

  const metCount = criteria.filter((c) => c.status === "met").length;
  const totalCount = criteria.length;

  return (
    <section aria-labelledby="scorecard-heading">
      <PilotScorecard
        title={t("successCriteriaTitle")}
        subtitle={t("successCriteriaSubtitle")}
        phaseBadge={t("pilotPhaseBadge")}
        criteria={criteria}
        labels={{
          summary: t("pilotHealthSummary", { metCount, totalCount }),
          colMetric: t("colMetric"),
          colCurrent: t("colCurrent"),
          colTarget: t("colTarget"),
          colProgress: t("colProgress"),
          colStatus: t("colStatus"),
          statusMet: t("statusMet"),
          statusAtRisk: t("statusAtRisk"),
          statusFailing: t("statusFailing"),
          statusNoData: t("statusNoData"),
        }}
      />
    </section>
  );
}
