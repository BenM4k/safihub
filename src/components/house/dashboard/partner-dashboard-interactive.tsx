"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { WifiOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePartnerSound } from "../use-partner-sound";

interface PartnerPauseContextValue {
  isPaused: boolean;
  setIsPaused: (val: boolean) => void;
  isPauseDialogOpen: boolean;
  setIsPauseDialogOpen: (val: boolean) => void;
  openPauseDialog: () => void;
  closePauseDialog: () => void;
}

const PartnerPauseContext = createContext<PartnerPauseContextValue | null>(null);

export function usePartnerPause(): PartnerPauseContextValue | null {
  return useContext(PartnerPauseContext);
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

interface PartnerDashboardInteractiveProps {
  initialWaitingCount: number;
  initialPaused: boolean;
  children: ReactNode;
}

/**
 * Donut pattern client shell:
 * Manages network presence, live polling refresh, audio chimes,
 * and contextual pause dialog state while hosting server-rendered children.
 */
export function PartnerDashboardInteractive({
  initialWaitingCount,
  initialPaused,
  children,
}: PartnerDashboardInteractiveProps) {
  const router = useRouter();
  const t = useTranslations("house.dashboard");
  const [lastUpdated, setLastUpdated] = useState(() => new Date());
  const prevWaitingCountRef = useRef(initialWaitingCount);
  const [isPaused, setIsPaused] = useState(initialPaused);
  const [isPauseDialogOpen, setIsPauseDialogOpen] = useState(false);

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
      initialWaitingCount > prevWaitingCountRef.current
    ) {
      try {
        const audio = new Audio("/sounds/new-order.mp3");
        audio.play().catch(() => {});
      } catch {
        // Audio error or unpermitted
      }
    }
    prevWaitingCountRef.current = initialWaitingCount;
  }, [initialWaitingCount, soundEnabled]);

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
    <PartnerPauseContext.Provider
      value={{
        isPaused,
        setIsPaused,
        isPauseDialogOpen,
        setIsPauseDialogOpen,
        openPauseDialog: () => setIsPauseDialogOpen(true),
        closePauseDialog: () => setIsPauseDialogOpen(false),
      }}
    >
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

        {children}
      </div>
    </PartnerPauseContext.Provider>
  );
}
