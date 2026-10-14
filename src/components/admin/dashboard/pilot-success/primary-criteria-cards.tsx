import { getTranslations } from "next-intl/server";
import { TrendingUp, CheckCircle2 } from "lucide-react";
import type { AdminDashboardMetrics } from "@/dal";
import { cn } from "@/lib/utils";

interface PrimaryCriteriaCardsProps {
  metrics: AdminDashboardMetrics;
}

export async function PrimaryCriteriaCards({ metrics }: PrimaryCriteriaCardsProps) {
  const t = await getTranslations("admin.dashboard");

  const ordersProgress = Math.min(100, Math.round((metrics.ordersPerWeek / 20) * 100));
  const acceptanceProgress = Math.min(100, Math.round(metrics.acceptanceRatePercent));

  const cards = [
    {
      id: "ordersPerWeek",
      label: t("ordersPerWeek"),
      value: metrics.ordersPerWeek,
      unit: t("ordersPerWeekUnit", { count: "" }).trim(),
      targetText: t("ordersPerWeekTarget"),
      met: metrics.ordersPerWeek >= 20,
      progressPercent: ordersProgress,
      progressText: t("progressTargetText", { percent: ordersProgress }),
      icon: TrendingUp,
      desc: t("ordersPerWeekDesc"),
      iconClass: "bg-primary-soft text-primary border border-[#D9DDFF]",
      subStats: [
        { label: t("subStatPilotTarget"), value: "≥ 20" },
        { label: t("subStatBreakeven"), value: "~23" },
      ],
    },
    {
      id: "acceptanceRate",
      label: t("acceptanceRate"),
      value: `${metrics.acceptanceRatePercent}%`,
      unit: t("unitValidated"),
      targetText: t("acceptanceRateTarget"),
      met: metrics.acceptanceRatePercent >= 80,
      progressPercent: acceptanceProgress,
      progressText: t("progressThresholdText", { percent: acceptanceProgress, threshold: 80 }),
      icon: CheckCircle2,
      desc: t("acceptanceRateDesc"),
      iconClass: "bg-success-light text-[#027A48] border border-[#A6F4C5]",
      subStats: [
        { label: t("subStatDeadline"), value: "45 min" },
        { label: t("subStatOperatingHours"), value: t("subStatOperatingHoursValue") },
      ],
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.id}
            className="p-6 sm:p-7 rounded-2xl border border-border bg-surface flex flex-col justify-between gap-5 transition-all"
          >
            <div className="space-y-4">
              {/* Header with Title and Status Chip */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {c.label}
                    </span>
                    <span
                      className={cn(
                        "px-2.5 py-0.5 rounded-full text-2xs font-bold uppercase tracking-wider",
                        c.met
                          ? "bg-success-light text-[#027A48] border border-[#A6F4C5]"
                          : "bg-warning-light text-warning border border-[#FEDF89]"
                      )}
                    >
                      {c.met ? t("targetMet") : t("targetPending")}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 pt-1">
                    <span className="text-4xl sm:text-5xl font-bold text-heading tracking-tight font-display">
                      {c.value}
                    </span>
                    <span className="text-xs font-bold text-muted-foreground">
                      {c.unit}
                    </span>
                  </div>
                </div>

                <div
                  className={`size-12 rounded-2xl flex items-center justify-center shrink-0 border ${c.iconClass}`}
                >
                  <Icon className="size-6" />
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs font-semibold text-heading">
                  <span>{c.targetText}</span>
                  <span className="text-2xs text-muted-foreground font-bold">
                    {c.progressText}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-ink-100 rounded-full overflow-hidden p-0.5 border border-border">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      c.met ? "bg-success" : "bg-warning"
                    )}
                    style={{ width: `${c.progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Narrative description */}
              <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                {c.desc}
              </p>
            </div>

            {/* Sub-stats footer pills */}
            <div className="grid grid-cols-2 gap-2.5 pt-4 border-t border-border">
              {c.subStats.map((s, idx) => (
                <div
                  key={idx}
                  className="bg-white p-3 rounded-xl border border-border flex items-center justify-between"
                >
                  <span className="text-2xs text-muted-foreground font-semibold">
                    {s.label}
                  </span>
                  <span className="text-xs font-bold text-heading font-display">
                    {s.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
