"use client";

import { useTranslations } from "next-intl";
import { WifiOff, AlertTriangle, RefreshCw } from "lucide-react";
import { useCourierStore } from "@/lib/stores/courier-store";
import { Button } from "@/components/ui/button";

interface CourierSyncBannerProps {
  onOpenConflicts?: () => void;
}

export function CourierSyncBanner({ onOpenConflicts }: CourierSyncBannerProps) {
  const t = useTranslations("courier.sync");
  const isOnline = useCourierStore((s) => s.isOnline);
  const syncStatus = useCourierStore((s) => s.syncStatus);
  const conflicts = useCourierStore((s) => s.conflicts);

  if (isOnline && syncStatus !== "syncing" && conflicts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2 mb-4">
      {/* Offline Mode Banner */}
      {!isOnline && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2.5 text-amber-800 text-xs shadow-2xs">
          <WifiOff className="size-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">{t("offlineBannerTitle")}</p>
            <p className="text-amber-700/90 mt-0.5">{t("offlineBannerDesc")}</p>
          </div>
        </div>
      )}

      {/* Syncing Progress Banner */}
      {isOnline && syncStatus === "syncing" && (
        <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2 text-blue-700 text-xs animate-pulse">
          <RefreshCw className="size-3.5 animate-spin shrink-0 text-blue-600" />
          <span>{t("syncing")}</span>
        </div>
      )}

      {/* Sync Conflicts Alert */}
      {conflicts.length > 0 && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-800 text-xs shadow-2xs">
          <AlertTriangle className="size-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">
              {t("conflictsTitle")} ({conflicts.length})
            </p>
            <p className="text-rose-700/90 mt-0.5">{t("conflictsDesc")}</p>
            {onOpenConflicts && (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenConflicts}
                className="mt-2 h-7 px-2.5 text-xs bg-white text-rose-700 border-rose-300 hover:bg-rose-100"
              >
                {t("viewConflicts")}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
