import { useTranslations } from "next-intl";
import { AlertCircle, CheckCircle2, Clock, Truck, Users } from "lucide-react";
import { Separator } from "@/components/ui/separator";
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
    <div className="flex flex-col sm:flex-row sm:items-center py-1">
      {/* Card 1: En attente d'acceptation */}
      <button
        type="button"
        onClick={() => {
          onSelectTab("relances");
          if (overdueCount > 0 && onFilterOverdue) {
            onFilterOverdue();
          }
        }}
        className={`flex-1 text-left p-3 rounded-md transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary ${
          activeTab === "relances"
            ? "bg-primary/10 text-primary"
            : "hover:bg-muted/50"
        }`}
        aria-label={`${t("kpiAwaiting")}: ${awaitingCount}`}
      >
        <div className="flex items-center justify-between gap-2">
          <p
            className={`text-[11px] font-semibold uppercase tracking-wider truncate ${
              activeTab === "relances" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {t("kpiAwaiting")}
          </p>
          <Clock
            className={`size-3.5 shrink-0 ${
              activeTab === "relances" ? "text-primary" : "text-muted-foreground"
            }`}
          />
        </div>
        <p
          className={`text-2xl font-bold font-mono tabular-nums mt-1.5 ${
            activeTab === "relances" ? "text-primary" : "text-foreground"
          }`}
        >
          {awaitingCount}
        </p>
        <div className="mt-1 flex items-center gap-1.5 text-xs">
          {overdueCount > 0 ? (
            <span className="inline-flex items-center gap-1 font-semibold text-destructive text-[11px]">
              <AlertCircle className="size-3" />
              {t("kpiAwaitingOverdue", { count: overdueCount })}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium text-[11px]">
              <CheckCircle2 className="size-3" />
              {t("kpiAwaitingOk")}
            </span>
          )}
        </div>
      </button>

      <Separator orientation="vertical" className="hidden sm:block h-12 mx-4 shrink-0" />
      <Separator orientation="horizontal" className="sm:hidden my-2" />

      {/* Card 2: Missions à assigner */}
      <button
        type="button"
        onClick={() => onSelectTab("missions")}
        className={`flex-1 text-left p-3 rounded-md transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary ${
          activeTab === "missions"
            ? "bg-primary/10 text-primary"
            : "hover:bg-muted/50"
        }`}
        aria-label={`${t("kpiMissions")}: ${unassignedMissionsCount}`}
      >
        <div className="flex items-center justify-between gap-2">
          <p
            className={`text-[11px] font-semibold uppercase tracking-wider truncate ${
              activeTab === "missions" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {t("kpiMissions")}
          </p>
          <Truck
            className={`size-3.5 shrink-0 ${
              activeTab === "missions" ? "text-primary" : "text-muted-foreground"
            }`}
          />
        </div>
        <p
          className={`text-2xl font-bold font-mono tabular-nums mt-1.5 ${
            activeTab === "missions" ? "text-primary" : "text-foreground"
          }`}
        >
          {unassignedMissionsCount}
        </p>
        <p className="text-[11px] text-muted-foreground mt-1 truncate">
          {unassignedMissionsCount > 0
            ? t("kpiMissionsSubtitle")
            : t("emptyMissions")}
        </p>
      </button>

      <Separator orientation="vertical" className="hidden sm:block h-12 mx-4 shrink-0" />
      <Separator orientation="horizontal" className="sm:hidden my-2" />

      {/* Card 3: Coursiers disponibles */}
      <div className="flex-1 p-3 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
            {t("kpiCouriersAvailable")}
          </p>
          <Users className="size-3.5 text-muted-foreground shrink-0" />
        </div>
        <div className="flex items-baseline gap-2 mt-1">
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
            {courierStats.available}
          </p>
          <span className="text-[11px] text-muted-foreground font-medium">
            {t("courierTotalCount", { count: courierStats.total })}
          </span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px]">
          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            {t("courierDispoCount", { count: courierStats.available })}
          </span>
          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium">
            <span className="size-1.5 rounded-full bg-amber-500" />
            {t("courierOnMissionCount", { count: courierStats.onMission })}
          </span>
          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-muted text-muted-foreground font-medium">
            <span className="size-1.5 rounded-full bg-muted-foreground/50" />
            {t("courierOfflineCount", { count: courierStats.offline })}
          </span>
        </div>
      </div>
    </div>
  );
}
