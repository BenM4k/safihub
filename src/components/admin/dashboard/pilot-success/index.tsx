import { getTranslations } from "next-intl/server";
import type { AdminDashboardMetrics } from "@/dal";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PilotScorecard } from "./pilot-scorecard";
import { ScorecardRow, type ScorecardRowData } from "./scorecard-row";

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
      definitionAriaLabel: t("definitionAriaLabel", { metric: t("ordersPerWeek") }),
      currentDisplay: t("ordersPerWeekUnit", { count: metrics.ordersPerWeek }),
      targetDisplay: t("ordersPerWeekTarget"),
      progressPercent: Math.min(100, Math.round((metrics.ordersPerWeek / 20) * 100)),
      status: metrics.ordersPerWeek >= 20 ? "met" : metrics.ordersPerWeek >= 10 ? "at-risk" : "failing",
    },
    {
      id: "acceptance_rate",
      metric: t("acceptanceRate"),
      formula: t("acceptanceRateDesc"),
      definitionAriaLabel: t("definitionAriaLabel", { metric: t("acceptanceRate") }),
      currentDisplay: `${metrics.acceptanceRatePercent}%`,
      targetDisplay: t("acceptanceRateTarget"),
      progressPercent: metrics.acceptanceRatePercent,
      status: metrics.acceptanceRatePercent >= 80 ? "met" : metrics.acceptanceRatePercent >= 60 ? "at-risk" : "failing",
    },
    {
      id: "net_margin",
      metric: t("marginPerOrder"),
      formula: t("marginPerOrderDesc"),
      definitionAriaLabel: t("definitionAriaLabel", { metric: t("marginPerOrder") }),
      currentDisplay: `CDF ${metrics.marginPerOrderCDF.toLocaleString("en-US")}`,
      targetDisplay: t("marginPerOrderTarget"),
      progressPercent: metrics.marginPerOrderCDF > 0 ? 100 : 0,
      status: metrics.marginPerOrderCDF > 0 ? "met" : "at-risk",
    },
    {
      id: "cash_discrepancy",
      metric: t("cashDiscrepancies"),
      formula: t("cashDiscrepanciesDesc"),
      definitionAriaLabel: t("definitionAriaLabel", { metric: t("cashDiscrepancies") }),
      currentDisplay: `${metrics.cashDiscrepancyPercent.toFixed(1)}%`,
      targetDisplay: t("cashDiscrepanciesTarget"),
      progressPercent: Math.min(100, Math.round((metrics.cashDiscrepancyPercent / 2) * 100)),
      status: metrics.cashDiscrepancyPercent < 2 ? "met" : "failing",
    },
    {
      id: "dispute_rate",
      metric: t("disputeRate"),
      formula: t("disputeRateDesc"),
      definitionAriaLabel: t("definitionAriaLabel", { metric: t("disputeRate") }),
      currentDisplay: `${metrics.disputeRatePercent.toFixed(1)}%`,
      targetDisplay: t("disputeRateTarget"),
      progressPercent: Math.min(100, Math.round((metrics.disputeRatePercent / 5) * 100)),
      status: metrics.disputeRatePercent < 5 ? "met" : "failing",
    },
    {
      id: "admin_minutes",
      metric: t("adminMinutesPerOrder"),
      formula: t("adminMinutesDesc"),
      definitionAriaLabel: t("definitionAriaLabel", { metric: t("adminMinutesPerOrder") }),
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
  const statusLabels = {
    met: t("statusMet"),
    atRisk: t("statusAtRisk"),
    failing: t("statusFailing"),
    noData: t("statusNoData"),
  };

  return (
    <section aria-labelledby="scorecard-heading">
      <PilotScorecard
        title={t("successCriteriaTitle")}
        subtitle={t("successCriteriaSubtitle")}
        phaseBadge={t("pilotPhaseBadge")}
        summaryText={t("pilotHealthSummary", { metCount, totalCount })}
        segments={criteria.map((c) => ({
          id: c.id,
          metric: c.metric,
          status: c.status,
        }))}
        statusLabels={statusLabels}
      >
        <Table className="text-xs">
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="h-9 py-2 px-5 sm:px-6 uppercase font-semibold text-foreground">
                {t("colMetric")}
              </TableHead>
              <TableHead className="h-9 py-2 px-4 uppercase font-semibold text-foreground">
                {t("colCurrent")}
              </TableHead>
              <TableHead className="h-9 py-2 px-4 uppercase font-semibold text-foreground">
                {t("colTarget")}
              </TableHead>
              <TableHead className="h-9 py-2 px-4 uppercase font-semibold text-foreground">
                {t("colProgress")}
              </TableHead>
              <TableHead className="h-9 py-2 px-5 sm:px-6 text-right uppercase font-semibold text-foreground">
                {t("colStatus")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {criteria.map((c) => (
              <ScorecardRow key={c.id} data={c} labels={statusLabels} />
            ))}
          </TableBody>
        </Table>
      </PilotScorecard>
    </section>
  );
}
