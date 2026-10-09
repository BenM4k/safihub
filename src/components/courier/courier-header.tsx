"use client";

import { useTranslations } from "next-intl";
import { Bike, Wifi, WifiOff, RefreshCw, AlertCircle } from "lucide-react";
import { useCourierStore } from "@/lib/stores/courier-store";
import { Button } from "@/components/ui/button";
import { NotificationsInboxWidget } from "@/components/notifications/notifications-inbox-widget";

interface CourierHeaderProps {
  courierName: string;
}

export function CourierHeader({ courierName }: CourierHeaderProps) {
  const t = useTranslations("courier.header");
  const isOnline = useCourierStore((s) => s.isOnline);
  const queue = useCourierStore((s) => s.queue);
  const syncStatus = useCourierStore((s) => s.syncStatus);
  const syncQueue = useCourierStore((s) => s.syncQueue);
  const conflicts = useCourierStore((s) => s.conflicts);

  return (
    <header className="sticky top-0 z-30 bg-slate-900 text-white border-b border-slate-800 shadow-md">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand & Courier Name */}
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <Bike className="size-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                SafiHub
              </span>
              <span className="text-slate-400 text-xs">•</span>
              <span className="text-xs text-slate-300 font-medium truncate max-w-[120px]">
                {courierName}
              </span>
            </div>
            <h1 className="text-sm font-bold text-slate-100 leading-tight">
              {t("title")}
            </h1>
          </div>
        </div>

        {/* Network, Notifications & Sync Badge */}
        <div className="flex items-center gap-2">
          <NotificationsInboxWidget buttonClassName="text-slate-300 hover:text-white hover:bg-slate-800" />
          {isOnline ? (
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Wifi className="size-3" />
              <span>{t("online")}</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <WifiOff className="size-3" />
              <span>{t("offline")}</span>
            </div>
          )}

          {/* Sync status trigger */}
          {queue.length > 0 && isOnline && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => syncQueue()}
              disabled={syncStatus === "syncing"}
              className="h-7 px-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
            >
              <RefreshCw
                className={`size-3 ${syncStatus === "syncing" ? "animate-spin" : ""}`}
              />
              <span className="ml-1 text-[11px]">
                {t("queuedCount", { count: queue.length })}
              </span>
            </Button>
          )}

          {conflicts.length > 0 && (
            <div className="size-7 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <AlertCircle className="size-4" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
