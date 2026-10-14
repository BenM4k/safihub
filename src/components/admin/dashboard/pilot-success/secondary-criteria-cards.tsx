import { getTranslations } from "next-intl/server";
import { DollarSign, ShieldAlert, Percent, Clock } from "lucide-react";
import type { AdminDashboardMetrics } from "@/dal";
import { cn } from "@/lib/utils";

interface SecondaryCriteriaCardsProps {
  metrics: AdminDashboardMetrics;
}

export async function SecondaryCriteriaCards({ metrics }: SecondaryCriteriaCardsProps) {
  const t = await getTranslations("admin.dashboard");

  const cards = [
    {
      id: "marginPerOrder",
      label: t("marginPerOrder"),
      value: `${metrics.marginPerOrderCDF.toLocaleString()} CDF`,
      target: t("marginPerOrderTarget"),
      met: metrics.marginPerOrderCDF > 0,
      icon: DollarSign,
      desc: t("marginPerOrderDesc"),
      iconClass: "bg-primary-soft text-primary border border-[#D9DDFF]",
    },
    {
      id: "cashDiscrepancies",
      label: t("cashDiscrepancies"),
      value: `${metrics.cashDiscrepancyPercent}%`,
      subValue: `(${metrics.cashDiscrepanciesCount} signalés)`,
      target: t("cashDiscrepanciesTarget"),
      met: metrics.cashDiscrepancyPercent < 2,
      icon: ShieldAlert,
      desc: t("cashDiscrepanciesDesc"),
      iconClass:
        metrics.cashDiscrepancyPercent < 2
          ? "bg-success-light text-[#027A48] border border-[#A6F4C5]"
          : "bg-destructive-light text-destructive border border-[#FECDCA]",
    },
    {
      id: "disputeRate",
      label: t("disputeRate"),
      value: `${metrics.disputeRatePercent}%`,
      target: t("disputeRateTarget"),
      met: metrics.disputeRatePercent < 5,
      icon: Percent,
      desc: t("disputeRateDesc"),
      iconClass:
        metrics.disputeRatePercent < 5
          ? "bg-primary-soft text-primary border border-[#D9DDFF]"
          : "bg-destructive-light text-destructive border border-[#FECDCA]",
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
      desc: t("adminMinutesDesc"),
      iconClass: "bg-warning-light text-warning border border-[#FEDF89]",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.id}
            className="p-5 bg-surface hover:bg-surface/80 rounded-2xl border border-border flex flex-col justify-between gap-3.5 transition-colors shadow-xs"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-2xs font-semibold uppercase tracking-wider text-muted-foreground line-clamp-1">
                  {c.label}
                </span>
                <div
                  className={`size-8 rounded-lg flex items-center justify-center shrink-0 border ${c.iconClass}`}
                >
                  <Icon className="size-4" />
                </div>
              </div>

              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-bold text-heading tracking-tight font-display">
                    {c.value}
                  </span>
                  {c.subValue && (
                    <span className="text-2xs text-muted-foreground font-semibold">
                      {c.subValue}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-1 mt-1.5">
                  <span className="text-2xs text-heading font-semibold truncate">
                    {c.target}
                  </span>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-2xs font-bold shrink-0",
                      c.met
                        ? "bg-success-light text-[#027A48] border border-[#A6F4C5]"
                        : "bg-warning-light text-warning border border-[#FEDF89]"
                    )}
                  >
                    {c.met ? t("targetMet") : t("targetPending")}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed pt-2.5 border-t border-border">
              {c.desc}
            </p>
          </div>
        );
      })}
    </div>
  );
}
