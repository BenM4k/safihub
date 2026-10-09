import { getTranslations } from "next-intl/server";
import { CheckCircle2, Clock, DollarSign, Percent, ShieldAlert, TrendingUp } from "lucide-react";
import type { AdminDashboardMetrics } from "@/dal";

interface SuccessCriteriaGridProps {
  metrics: AdminDashboardMetrics;
}

export async function SuccessCriteriaGrid({ metrics }: SuccessCriteriaGridProps) {
  const t = await getTranslations("admin.dashboard");

  const criteria = [
    {
      id: "ordersPerWeek",
      label: t("ordersPerWeek"),
      value: `${metrics.ordersPerWeek}`,
      target: t("ordersPerWeekTarget"),
      met: metrics.ordersPerWeek >= 20,
      icon: TrendingUp,
      color: "text-blue-600 bg-blue-50 border-blue-200",
    },
    {
      id: "acceptanceRate",
      label: t("acceptanceRate"),
      value: `${metrics.acceptanceRatePercent}%`,
      target: t("acceptanceRateTarget"),
      met: metrics.acceptanceRatePercent >= 80,
      icon: CheckCircle2,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    },
    {
      id: "marginPerOrder",
      label: t("marginPerOrder"),
      value: `${metrics.marginPerOrderCDF.toLocaleString()} CDF`,
      target: t("marginPerOrderTarget"),
      met: metrics.marginPerOrderCDF > 0,
      icon: DollarSign,
      color: "text-violet-600 bg-violet-50 border-violet-200",
    },
    {
      id: "cashDiscrepancies",
      label: t("cashDiscrepancies"),
      value: `${metrics.cashDiscrepancyPercent}% (${metrics.cashDiscrepanciesCount})`,
      target: t("cashDiscrepanciesTarget"),
      met: metrics.cashDiscrepancyPercent < 2,
      icon: ShieldAlert,
      color: metrics.cashDiscrepancyPercent < 2
        ? "text-teal-600 bg-teal-50 border-teal-200"
        : "text-rose-600 bg-rose-50 border-rose-200",
    },
    {
      id: "disputeRate",
      label: t("disputeRate"),
      value: `${metrics.disputeRatePercent}%`,
      target: t("disputeRateTarget"),
      met: metrics.disputeRatePercent < 5,
      icon: Percent,
      color: metrics.disputeRatePercent < 5
        ? "text-indigo-600 bg-indigo-50 border-indigo-200"
        : "text-rose-600 bg-rose-50 border-rose-200",
    },
    {
      id: "adminMinutesPerOrder",
      label: t("adminMinutesPerOrder"),
      value:
        metrics.adminMinutesPerOrder !== null
          ? `${metrics.adminMinutesPerOrder} min`
          : t("notMeasured"),
      target: t("adminMinutesPerOrderTarget"),
      met:
        metrics.adminMinutesPerOrder !== null &&
        metrics.adminMinutesPerOrder <= 10,
      icon: Clock,
      color: "text-amber-600 bg-amber-50 border-amber-200",
    },
  ];

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-sm font-bold text-heading">
          {t("successCriteriaTitle")}
        </h2>
        <p className="text-2xs text-muted-foreground mt-0.5">
          {t("successCriteriaSubtitle")}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {criteria.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.id}
              className="p-3.5 bg-white rounded-xl border border-border shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-1.5 mb-2">
                <span className="text-2xs font-semibold text-muted-foreground line-clamp-1">
                  {c.label}
                </span>
                <div className={`size-6 rounded-md flex items-center justify-center border shrink-0 ${c.color}`}>
                  <Icon className="size-3.5" />
                </div>
              </div>

              <div>
                <div className="text-lg font-black text-heading tracking-tight">
                  {c.value}
                </div>
                <div className="text-2xs text-muted-foreground font-medium mt-0.5">
                  {c.target}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
