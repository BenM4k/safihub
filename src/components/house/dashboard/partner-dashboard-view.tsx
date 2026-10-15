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

export function PartnerDashboardView({
  initialMetrics,
  houseSlug,
}: PartnerDashboardViewProps) {
  const router = useRouter();
  const [lastUpdated, setLastUpdated] = useState(() => new Date());
  const prevWaitingCountRef = useRef(initialMetrics.waitingAcceptanceCount);
  const metrics = initialMetrics;

  // Synchronize soundEnabled from external storage
  const soundEnabled = useSyncExternalStore(
    (callback) => {
      window.addEventListener("storage", callback);
      window.addEventListener("safihub-sound-toggled", callback);
      return () => {
        window.removeEventListener("storage", callback);
        window.removeEventListener("safihub-sound-toggled", callback);
      };
    },
    () => {
      try {
        const stored = localStorage.getItem("safihub_sound_enabled");
        return stored !== "false";
      } catch {
        return true;
      }
    },
    () => true
  );

  // Online / offline detection via useSyncExternalStore
  const isOnline = useSyncExternalStore(
    (callback) => {
      window.addEventListener("online", callback);
      window.addEventListener("offline", callback);
      return () => {
        window.removeEventListener("online", callback);
        window.removeEventListener("offline", callback);
      };
    },
    () => navigator.onLine,
    () => true
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
      <PartnerBanner house={metrics.house} />

      {/* 2. Priority Alert Strip (Hidden if empty) */}
      <PartnerAlertStrip alerts={metrics.alerts} />

      {/* 3. Orders Awaiting Acceptance Priority Queue */}
      <AcceptanceQueue
        orders={metrics.waitingAcceptanceOrders}
        missedOrders={metrics.missedOrders}
        houseSlug={houseSlug}
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
        onOpenPause={() => {
          const bannerBtn = document.querySelector('button[aria-pressed]') as HTMLButtonElement | null;
          bannerBtn?.click();
        }}
        isPaused={metrics.isPaused}
      />
    </div>
  );
}
