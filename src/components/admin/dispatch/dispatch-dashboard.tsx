"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Clock, RefreshCw, Truck } from "lucide-react";
import { DispatchKpiCards } from "./dispatch-kpi-cards";
import { DispatchAwaitingContainer } from "./dispatch-awaiting-container";
import { DispatchMissionsList } from "./dispatch-missions-list";
import type { DispatchDashboardData } from "@/services/admin";

interface DispatchDashboardProps {
  initialData: DispatchDashboardData;
}

export function DispatchDashboard({ initialData }: DispatchDashboardProps) {
  const t = useTranslations("admin.dispatch");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<"relances" | "missions">("relances");
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState(45);

  const awaitingOrders = initialData.ordersAwaitingAcceptance;
  const overdueCount = awaitingOrders.filter((o) => o.urgency.isOverdue).length;
  const unassignedMissions = initialData.unassignedMissions;

  function handleManualRefresh() {
    setSecondsUntilRefresh(45);
    startTransition(() => {
      router.refresh();
    });
  }

  // Auto-refresh timer every 45s (live in background, preserving state)
  useEffect(() => {
    const countdown = setInterval(() => {
      setSecondsUntilRefresh((prev) => (prev > 1 ? prev - 1 : 45));
    }, 1000);

    const refreshTimer = setInterval(() => {
      startTransition(() => {
        router.refresh();
      });
    }, 45000);

    return () => {
      clearInterval(countdown);
      clearInterval(refreshTimer);
    };
  }, [router]);

  return (
    <div className="font-sans space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-heading font-display">
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("subtitle")}
          </p>
        </div>

        {/* Live auto-refresh status */}
        <div className="flex items-center gap-3 self-start sm:self-center">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-surface px-3 py-1.5 rounded-full border border-border">
            <RefreshCw className={`w-3.5 h-3.5 ${isPending ? "animate-spin text-primary" : "text-ink-400"}`} />
            <span>
              {isPending
                ? "Actualisation en cours..."
                : `Actualisation dans ${secondsUntilRefresh}s`}
            </span>
          </div>

          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isPending}
            className="text-xs font-semibold text-primary hover:text-primary-hover hover:underline cursor-pointer"
          >
            {t("refreshNow")}
          </button>
        </div>
      </div>

      {/* KPI Cards (Clickable Filters) */}
      <DispatchKpiCards
        awaitingCount={awaitingOrders.length}
        overdueCount={overdueCount}
        unassignedMissionsCount={unassignedMissions.length}
        courierStats={initialData.courierStats}
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
      />

      {/* Tabs navigation */}
      <div className="border-b border-border">
        <nav className="flex space-x-6" aria-label="Tabs">
          <button
            type="button"
            onClick={() => setActiveTab("relances")}
            className={`flex items-center gap-2 py-3 px-1 border-b-2 font-semibold text-sm transition-all cursor-pointer ${
              activeTab === "relances"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-heading hover:border-border-strong"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{t("tabRelances")}</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                activeTab === "relances"
                  ? "bg-primary-soft text-primary-soft-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              {awaitingOrders.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("missions")}
            className={`flex items-center gap-2 py-3 px-1 border-b-2 font-semibold text-sm transition-all cursor-pointer ${
              activeTab === "missions"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-heading hover:border-border-strong"
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>{t("tabMissions")}</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                activeTab === "missions"
                  ? "bg-primary-soft text-primary-soft-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              {unassignedMissions.length}
            </span>
          </button>
        </nav>
      </div>

      {/* Active Tab Content */}
      {activeTab === "relances" ? (
        <DispatchAwaitingContainer
          orders={awaitingOrders}
          availablePressings={initialData.availablePressings}
          onRefresh={handleManualRefresh}
          isRefreshing={isPending}
        />
      ) : (
        <DispatchMissionsList missions={unassignedMissions} />
      )}
    </div>
  );
}
