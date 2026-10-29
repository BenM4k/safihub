"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { WifiOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { PartnerBanner } from "./partner-banner";
import { PartnerAlertStrip } from "./partner-alert-strip";
import { AcceptanceQueue } from "./acceptance-queue";
import { PartnerKpiRow } from "./partner-kpi-row";
import { PartnerPipeline } from "./partner-pipeline";
import { PartnerAnalytics } from "./partner-analytics";
import { PartnerTables } from "./partner-tables";
import { PartnerContextualActions } from "./partner-contextual-actions";
import { SetupChecklistCard } from "../onboarding/setup-checklist-card";
import { usePartnerSound } from "../use-partner-sound";
import type { HouseDashboardMetrics, HouseChecklistDerivation } from "@/dal";

interface PartnerDashboardViewProps {
  initialMetrics: HouseDashboardMetrics;
  houseSlug: string;
  checklist?: HouseChecklistDerivation | null;
}

function subscribeOnline(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getOnlineSnapshot() {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}

function getServerOnlineSnapshot() {
  return true;
}

/**
 * Clean dashboard composition orchestrating hero banner, KPI row, acceptance queue, and analytics.
 */
export function PartnerDashboardView({
  initialMetrics,
  houseSlug,
  checklist,
}: PartnerDashboardViewProps) {
  const router = useRouter();
  const t = useTranslations("house.dashboard");
  const [lastUpdated, setLastUpdated] = useState(() => new Date());
  const prevWaitingCountRef = useRef(initialMetrics.waitingAcceptanceCount);
  const [isPaused, setIsPaused] = useState(initialMetrics.house.isPaused);
  const [isPauseDialogOpen, setIsPauseDialogOpen] = useState(false);
  const metrics = initialMetrics;

  const { soundEnabled } = usePartnerSound();

  const isOnline = useSyncExternalStore(
    subscribeOnline,
    getOnlineSnapshot,
    getServerOnlineSnapshot,
  );

  // Play chime if new order arrived and sound enabled
  useEffect(() => {
    if (
      soundEnabled &&
      initialMetrics.waitingAcceptanceCount > prevWaitingCountRef.current
    ) {
      try {
        const audio = new Audio("/sounds/new-order.mp3");
        audio.play().catch(() => {});
      } catch {
        // Audio error or unpermitted
      }
    }
    prevWaitingCountRef.current = initialMetrics.waitingAcceptanceCount;
  }, [initialMetrics.waitingAcceptanceCount, soundEnabled]);

  // Polling refresh every 25s without losing scroll position
  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === "visible" && navigator.onLine) {
        router.refresh();
        setLastUpdated(new Date());
      }
    }, 25000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="space-y-8 sm:space-y-10 lg:space-y-12 font-sans">
      {/* Offline Indicator */}
      {!isOnline && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-3">
            <WifiOff className="size-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <div className="text-xs sm:text-sm font-semibold leading-relaxed">
              <strong>{t("offlineTitle")}</strong> ·{" "}
              {t("offlineUpdated", {
                time: lastUpdated.toLocaleTimeString(),
              })}
            </div>
          </div>
          <span className="text-xs text-amber-800 dark:text-amber-300">
            {t("offlineReconnecting")}
          </span>
        </div>
      )}

      {/* 1. Identity Banner Header */}
      <PartnerBanner
        house={metrics.house}
        isPaused={isPaused}
        isPauseDialogOpen={isPauseDialogOpen}
        onOpenPauseDialog={() => setIsPauseDialogOpen(true)}
        onClosePauseDialog={() => setIsPauseDialogOpen(false)}
        onPauseChanged={setIsPaused}
      />

      {/* 2. Priority Alert Strip (Hidden if empty) */}
      <PartnerAlertStrip alerts={metrics.alerts} />

      {/* 2b. Setup Checklist & Validation Card (shown regardless of tour status) */}
      {checklist && (
        <div data-tour-id="tour-checklist-card">
          <SetupChecklistCard checklist={checklist} houseSlug={houseSlug} />
        </div>
      )}

      {/* 3. Orders Awaiting Acceptance Priority Queue */}
      <AcceptanceQueue
        orders={metrics.waitingAcceptanceOrders}
        missedOrders={metrics.missedOrders}
        houseSlug={houseSlug}
        waitingAcceptanceCount={metrics.waitingAcceptanceCount}
      />

      {/* 4. Clickable KPI Row */}
      <PartnerKpiRow metrics={metrics} houseSlug={houseSlug} />

      {/* 5. Pipeline Status Cards */}
      <PartnerPipeline metrics={metrics} houseSlug={houseSlug} />

      {/* 6. Analytics, Capacity & Quality Indicators */}
      <PartnerAnalytics metrics={metrics} houseSlug={houseSlug} />

      {/* 7. Tables (Commandes récentes & Collectes à venir) */}
      <PartnerTables
        recentOrders={metrics.recentOrders}
        upcomingPickups={metrics.upcomingPickups}
        houseSlug={houseSlug}
      />

      {/* 8. Contextual Actions */}
      <PartnerContextualActions
        houseSlug={houseSlug}
        onOpenPause={() => setIsPauseDialogOpen(true)}
        isPaused={isPaused}
      />
    </div>
  );
}
