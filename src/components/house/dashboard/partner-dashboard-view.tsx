"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { WifiOff } from "lucide-react";
import { PartnerBanner } from "./partner-banner";
import { PartnerAlertStrip } from "./partner-alert-strip";
import { AcceptanceQueue } from "./acceptance-queue";
import { PartnerKpiRow } from "./partner-kpi-row";
import { PartnerPipeline } from "./partner-pipeline";
import { PartnerAnalytics } from "./partner-analytics";
import { PartnerTables } from "./partner-tables";
import { PartnerContextualActions } from "./partner-contextual-actions";
import type { HouseDashboardMetrics } from "@/dal";

interface PartnerDashboardViewProps {
  initialMetrics: HouseDashboardMetrics;
  houseSlug: string;
}

function subscribeSound(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("safihub-sound-toggled", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("safihub-sound-toggled", callback);
  };
}

function getSoundSnapshot() {
  try {
    const stored = localStorage.getItem("safihub_sound_enabled");
    return stored !== "false";
  } catch {
    return true;
  }
}

function getServerSoundSnapshot() {
  return true;
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

export function PartnerDashboardView({
  initialMetrics,
  houseSlug,
}: PartnerDashboardViewProps) {
  const router = useRouter();
  const [lastUpdated, setLastUpdated] = useState(() => new Date());
  const prevWaitingCountRef = useRef(initialMetrics.waitingAcceptanceCount);
  const [isPaused, setIsPaused] = useState(initialMetrics.house.isPaused);
  const [isPauseDialogOpen, setIsPauseDialogOpen] = useState(false);
  const metrics = initialMetrics;

  const soundEnabled = useSyncExternalStore(
    subscribeSound,
    getSoundSnapshot,
    getServerSoundSnapshot,
  );

  const isOnline = useSyncExternalStore(
    subscribeOnline,
    getOnlineSnapshot,
    getServerOnlineSnapshot,
  );

  // Play chime if new order arrived and sound enabled (side effect only, no setState)
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
    <div className="space-y-6 sm:space-y-8 font-sans">
      {/* Offline Indicator */}
      {!isOnline && (
        <div
          role="status"
          className="p-3 bg-amber-100 border border-amber-300 rounded-2xl text-xs text-amber-900 font-bold flex items-center justify-between shadow-2xs"
        >
          <div className="flex items-center gap-2">
            <WifiOff className="size-4 shrink-0 text-amber-700" />
            <span>Mode hors-ligne · Données mises à jour le {lastUpdated.toLocaleTimeString("fr-FR")}</span>
          </div>
          <span className="text-[11px] font-normal text-amber-800">
            Reconnexion automatique...
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
