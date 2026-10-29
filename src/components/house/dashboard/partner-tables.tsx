"use client";

import Link from "next/link";
import { ArrowRight, MapPin, Truck } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatAmount } from "@/lib/order-formatters";
import type { HouseOrderListItemRecord } from "@/dal";

interface PartnerTablesProps {
  recentOrders: HouseOrderListItemRecord[];
  upcomingPickups: HouseOrderListItemRecord[];
  houseSlug: string;
}

export function PartnerTables({
  recentOrders,
  upcomingPickups,
  houseSlug,
}: PartnerTablesProps) {
  const t = useTranslations("house.dashboard");

  function getStatusLabel(status: string) {
    switch (status) {
      case "created":
        return {
          label: "À accepter",
          class: "bg-warning-soft text-warning border-warning/20",
        };
      case "accepted":
      case "pickup_assigned":
      case "pickup_in_progress":
        return {
          label: "Collecte coursier",
          class: "bg-primary-soft text-primary border-primary/20",
        };
      case "washing":
      case "received":
      case "price_adjusted":
        return {
          label: "Traitement",
          class: "bg-secondary text-heading border-border/40",
        };
      case "ready":
        return {
          label: "Prête",
          class: "bg-success-soft text-success border-success/20",
        };
      case "delivered":
        return {
          label: "Livrée",
          class: "bg-surface text-muted-foreground border-border/40",
        };
      case "expired":
        return {
          label: "Expirée",
          class: "bg-destructive-soft text-destructive border-destructive/20",
        };
      default:
        return {
          label: status,
          class: "bg-surface text-muted-foreground border-border/40",
        };
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-4 font-sans">
      {/* 1. Commandes récentes */}
      <div className="p-4 sm:p-5 rounded-2xl bg-card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-base sm:text-lg text-heading tracking-tight">
            {t("recentOrdersTitle")}
          </h3>
          <Link
            href={`/partner/${houseSlug}/orders`}
            className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1 hover:underline"
          >
            <span>{t("viewAll")}</span>
            <ArrowRight className="size-3" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 py-6 text-center">
            {t("noRecentOrders")}
          </p>
        ) : (
          <div className="divide-y divide-border/60">
            {recentOrders.map((ord) => {
              const statusCfg = getStatusLabel(ord.status);
              return (
                <div
                  key={ord.id}
                  className="py-2.5 sm:py-3 flex items-center justify-between gap-2.5 sm:gap-3 text-xs hover:bg-surface/50 rounded-lg px-2 transition"
                >
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <Link
                        href={`/partner/${houseSlug}/orders/${ord.id}`}
                        className="font-mono font-bold text-heading hover:text-primary transition"
                      >
                        {ord.code}
                      </Link>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusCfg.class}`}
                      >
                        {statusCfg.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate">
                      {ord.customerFirstName} · {ord.neighborhoodName} ·{" "}
                      {ord.itemsSummary || t("laundryArticlesLabel")}
                    </p>
                  </div>

                  <div className="text-right shrink-0 min-w-[70px]">
                    <span className="font-bold text-heading block font-mono">
                      {formatAmount(ord.totalDue)}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(ord.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        timeZone: "Africa/Lubumbashi",
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Collectes à venir */}
      <div className="p-4 sm:p-5 rounded-2xl bg-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="size-4 text-primary" />
            <h3 className="font-display font-bold text-base sm:text-lg text-heading tracking-tight">
              {t("upcomingPickupsTitle")}
            </h3>
          </div>
          <span className="text-xs text-muted-foreground">
            {t("upcomingPickupsCount", { count: upcomingPickups.length })}
          </span>
        </div>

        {upcomingPickups.length === 0 ? (
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 py-6 text-center">
            {t("noUpcomingPickups")}
          </p>
        ) : (
          <div className="divide-y divide-border/60">
            {upcomingPickups.map((ord) => {
              const slotTime = ord.pickupSlotStart
                ? new Date(ord.pickupSlotStart).toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: "Africa/Lubumbashi",
                  })
                : t("today");

              return (
                <div
                  key={ord.id}
                  className="py-2.5 sm:py-3 flex items-center justify-between gap-2.5 sm:gap-3 text-xs hover:bg-slate-50 dark:hover:bg-accent/40 rounded-lg px-2 transition"
                >
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span className="font-mono font-bold text-heading">
                        {ord.code}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                        {t("slotFrom", { time: slotTime })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate flex items-center gap-1">
                      <MapPin className="size-3 text-muted-foreground shrink-0" />
                      <span>
                        {ord.neighborhoodName} · {ord.customerFirstName}
                      </span>
                    </p>
                  </div>

                  <Link
                    href={`/partner/${houseSlug}/orders/${ord.id}`}
                    className="text-xs font-semibold text-primary hover:text-primary-hover hover:underline shrink-0"
                  >
                    {t("detail")}
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
