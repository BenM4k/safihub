"use client";

import { useTranslations } from "next-intl";
import { AlertCircle, CheckCircle2, Clock, Truck, Users } from "lucide-react";
import type { CourierFleetStats } from "@/services/admin";

interface DispatchKpiCardsProps {
  awaitingCount: number;
  overdueCount: number;
  unassignedMissionsCount: number;
  courierStats: CourierFleetStats;
  activeTab: "relances" | "missions";
  onSelectTab: (tab: "relances" | "missions") => void;
  onFilterOverdue?: () => void;
}

export function DispatchKpiCards({
  awaitingCount,
  overdueCount,
  unassignedMissionsCount,
  courierStats,
  activeTab,
  onSelectTab,
  onFilterOverdue,
}: DispatchKpiCardsProps) {
  const t = useTranslations("admin.dispatch");

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Card 1: En attente d'acceptation */}
      <button
        type="button"
        onClick={() => {
          onSelectTab("relances");
          if (overdueCount > 0 && onFilterOverdue) {
            onFilterOverdue();
          }
        }}
        className={`text-left p-4 rounded-xl border transition-all duration-150 cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
          activeTab === "relances"
            ? "border-primary/40 bg-card ring-1 ring-primary/20"
            : "border-border bg-card hover:border-border-strong hover:shadow-sm"
        }`}
        aria-label={`${t("kpiAwaiting")}: ${awaitingCount}`}
      >
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {t("kpiAwaiting")}
          </p>
          <Clock className="w-4 h-4 text-ink-400" />
        </div>
        <p className="text-2xl font-bold text-heading mt-1.5 font-mono">
          {awaitingCount}
        </p>
        <div className="mt-1 flex items-center gap-1.5 text-xs">
          {overdueCount > 0 ? (
            <span className="inline-flex items-center gap-1 font-semibold text-destructive bg-destructive-soft px-2 py-0.5 rounded-md border border-destructive/20">
              <AlertCircle className="w-3.5 h-3.5" />
              {t("kpiAwaitingOverdue", { count: overdueCount })}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-success font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {t("kpiAwaitingOk")}
            </span>
          )}
        </div>
      </button>

      {/* Card 2: Missions à assigner */}
      <button
        type="button"
        onClick={() => onSelectTab("missions")}
        className={`text-left p-4 rounded-xl border transition-all duration-150 cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
          activeTab === "missions"
            ? "border-primary/40 bg-card ring-1 ring-primary/20"
            : "border-border bg-card hover:border-border-strong hover:shadow-sm"
        }`}
        aria-label={`${t("kpiMissions")}: ${unassignedMissionsCount}`}
      >
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {t("kpiMissions")}
          </p>
          <Truck className="w-4 h-4 text-ink-400" />
        </div>
        <p className="text-2xl font-bold text-heading mt-1.5 font-mono">
          {unassignedMissionsCount}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {unassignedMissionsCount > 0
            ? t("kpiMissionsSubtitle")
            : t("emptyMissions")}
        </p>
      </button>

      {/* Card 3: Coursiers disponibles & répartition */}
      <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {t("kpiCouriersAvailable")}
          </p>
          <Users className="w-4 h-4 text-ink-400" />
        </div>
        <div className="flex items-baseline gap-2 mt-1.5">
          <p className="text-2xl font-bold text-success font-mono">
            {courierStats.available}
          </p>
          <span className="text-xs text-muted-foreground font-medium">
            {t("courierTotalCount", { count: courierStats.total })}
          </span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-success-soft text-success font-medium border border-success/20">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            {t("courierDispoCount", { count: courierStats.available })}
          </span>
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-warning-soft text-warning font-medium border border-warning/20">
            <span className="w-1.5 h-1.5 rounded-full bg-warning" />
            {t("courierOnMissionCount", { count: courierStats.onMission })}
          </span>
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground font-medium border border-border">
            <span className="w-1.5 h-1.5 rounded-full bg-ink-400" />
            {t("courierOfflineCount", { count: courierStats.offline })}
          </span>
        </div>
      </div>
    </div>
  );
}
