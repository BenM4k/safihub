"use client";

import { Activity, useCallback, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Clock, Truck } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  buildAdminDispatchQueryString,
  parseAdminDispatchSearchParams,
  type AdminDispatchQueryParams,
  type DispatchTab,
} from "@/lib/admin-dispatch-query";
import type { DispatchDashboardData } from "@/services/admin";
import { DispatchKpiCards } from "./dispatch-kpi-cards";
import { DispatchAwaitingContainer } from "./dispatch-awaiting-container";
import { DispatchMissionsList } from "./dispatch-missions-list";
import { DispatchRefreshTicker } from "./dispatch-refresh-ticker";

interface DispatchDashboardProps {
  initialData: DispatchDashboardData;
  initialQuery: AdminDispatchQueryParams;
}

export function DispatchDashboard({
  initialData,
  initialQuery,
}: DispatchDashboardProps) {
  const t = useTranslations("admin.dispatch");
  const router = useRouter();
  const pathname = usePathname();
  const liveSearchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [localTab, setLocalTab] = useState<DispatchTab>(initialQuery.tab);
  const activeTab =
    liveSearchParams.get("tab") === "missions"
      ? "missions"
      : liveSearchParams.get("tab") === "relances"
      ? "relances"
      : localTab;

  const awaitingOrders = initialData.ordersAwaitingAcceptance;
  const overdueCount = awaitingOrders.filter((o) => o.urgency.isOverdue).length;
  const unassignedMissions = initialData.unassignedMissions;

  const handleRefresh = useCallback(() => {
    startTransition(() => {
      router.refresh();
    });
  }, [router]);

  function handleSelectTab(tab: DispatchTab) {
    setLocalTab(tab);
    const current = parseAdminDispatchSearchParams(
      Object.fromEntries(liveSearchParams.entries())
    );
    const qs = buildAdminDispatchQueryString({ ...current, tab, page: 1 });
    startTransition(() => {
      router.replace(qs ? `${pathname}${qs}` : pathname, { scroll: false });
    });
  }

  function handleFilterOverdue() {
    const current = parseAdminDispatchSearchParams(
      Object.fromEntries(liveSearchParams.entries())
    );
    const qs = buildAdminDispatchQueryString({
      ...current,
      tab: "relances",
      delay: "overdue",
      page: 1,
    });
    startTransition(() => {
      router.replace(qs ? `${pathname}${qs}` : pathname, { scroll: false });
    });
  }

  return (
    <div className="font-sans space-y-6 animate-enter">
      {/* Header + Isolated 1s Refresh Ticker */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-display">
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{t("subtitle")}</p>
        </div>

        <DispatchRefreshTicker
          intervalSeconds={45}
          isRefreshing={isPending}
          onRefresh={handleRefresh}
        />
      </div>

      {/* KPI Summary Cards */}
      <DispatchKpiCards
        awaitingCount={awaitingOrders.length}
        overdueCount={overdueCount}
        unassignedMissionsCount={unassignedMissions.length}
        courierStats={initialData.courierStats}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onFilterOverdue={handleFilterOverdue}
      />

      {/* @ui-sdk/react Tabs */}
      <div className="border-b border-border pb-2">
        <Tabs
          value={activeTab}
          onValueChange={(next) => handleSelectTab(next as DispatchTab)}
        >
          <TabsList variant="line" className="h-10 gap-2">
            <TabsTrigger value="relances" className="min-h-10 gap-2 text-sm px-3">
              <Clock className="size-4" />
              <span>{t("tabRelances")}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold tabular-nums ${
                  activeTab === "relances"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {awaitingOrders.length}
              </span>
            </TabsTrigger>

            <TabsTrigger value="missions" className="min-h-10 gap-2 text-sm px-3">
              <Truck className="size-4" />
              <span>{t("tabMissions")}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold tabular-nums ${
                  activeTab === "missions"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {unassignedMissions.length}
              </span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* React 19 <Activity> preserves child state across tab switches */}
      <Activity mode={activeTab === "relances" ? "visible" : "hidden"}>
        <div className="animate-enter-fast">
          <DispatchAwaitingContainer
            orders={awaitingOrders}
            availablePressings={initialData.availablePressings}
            initialQuery={initialQuery}
            onRefresh={handleRefresh}
            isRefreshing={isPending}
          />
        </div>
      </Activity>

      <Activity mode={activeTab === "missions" ? "visible" : "hidden"}>
        <div className="animate-enter-fast">
          <DispatchMissionsList
            missions={unassignedMissions}
            onAssigned={handleRefresh}
          />
        </div>
      </Activity>
    </div>
  );
}
