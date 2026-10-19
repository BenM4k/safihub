"use client";

import { BarChart3, AlertTriangle, Star } from "lucide-react";
import { formatAmount } from "@/lib/order-formatters";
import type { HouseDashboardMetrics } from "@/dal";

interface PartnerAnalyticsProps {
  metrics: HouseDashboardMetrics;
  houseSlug: string;
}

export function PartnerAnalytics({ metrics }: PartnerAnalyticsProps) {
  const capacity = metrics.dailyCapacity ?? 30; // fallback to standard threshold if null
  const used = metrics.todayOrdersCount;
  const capacityPercent = Math.min(100, Math.round((used / capacity) * 100));
  const isHighCapacity = capacityPercent >= 80;

  const maxRevenue = Math.max(...metrics.dailyChart.map((d) => d.revenueCDF ?? 0), 1000);

  return (
    <div className="grid lg:grid-cols-3 gap-4 font-sans">
      {/* 1. Accessible Bar Chart (7 derniers jours) */}
      <div className="lg:col-span-2 p-5 rounded-3xl bg-card border border-border shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-primary-soft text-primary flex items-center justify-center font-bold">
              <BarChart3 className="size-4.5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm sm:text-base text-heading">
                Commandes & Revenus
              </h3>
              <p className="text-xs text-muted-foreground">
                Évolution des volumes traités (7 derniers jours)
              </p>
            </div>
          </div>
        </div>

        {/* CSS/SVG Bar Chart with Accessible Tooltips */}
        <div className="space-y-3 pt-2">
          <div className="h-44 flex items-end justify-between gap-2 sm:gap-4 px-2 pt-4 border-b border-border">
            {metrics.dailyChart.map((point) => {
              const rev = point.revenueCDF ?? 0;
              const heightPercent = Math.max(8, Math.round((rev / maxRevenue) * 100));
              const revLabel = point.revenueCDF !== null ? formatAmount(point.revenueCDF) : "--";
              const countLabel = point.ordersCount !== null ? `${point.ordersCount} cmd(s)` : "--";

              return (
                <div
                  key={point.date}
                  className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative"
                >
                  {/* Tooltip on hover/focus */}
                  <div className="absolute -top-12 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity bg-heading text-background text-[10px] font-bold py-1 px-2 rounded-lg pointer-events-none whitespace-nowrap z-20 shadow-md">
                    <div>{revLabel}</div>
                    <div className="text-muted-foreground font-normal">{countLabel}</div>
                  </div>

                  {/* Visual Bar with accessible aria-label - Solid Royal Indigo, strictly no gradients */}
                  <div
                    tabIndex={0}
                    role="img"
                    aria-label={`${point.label} : ${countLabel}, ${revLabel}`}
                    style={{ height: `${heightPercent}%` }}
                    className="w-full max-w-[36px] rounded-t-lg bg-primary hover:bg-primary-hover transition-all cursor-pointer focus:outline-ring"
                  />

                  {/* Day label */}
                  <span className="text-[11px] font-bold text-muted-foreground group-hover:text-heading">
                    {point.label}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-muted-foreground text-center">
            Barres proportionnelles au chiffre d&apos;affaires net journalier (CDF)
          </p>
        </div>
      </div>

      {/* 2. Capacity & Performance Side Widgets */}
      <div className="space-y-4">
        {/* Capacity Widget */}
        <div className="p-5 rounded-3xl bg-card border border-border shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">
              Capacité journalière
            </span>
            {isHighCapacity && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-warning bg-warning-soft px-2 py-0.5 rounded-full border border-warning/20">
                <AlertTriangle className="size-3" />
                Seuil 80%
              </span>
            )}
          </div>

          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-heading font-display">
                {used} / {metrics.dailyCapacity ? metrics.dailyCapacity : `${capacity} max`}
              </span>
              <span className="text-xs font-bold text-muted-foreground">
                {capacityPercent}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2.5 bg-secondary rounded-full mt-2 overflow-hidden">
              <div
                style={{ width: `${capacityPercent}%` }}
                className={`h-full rounded-full transition-all duration-300 ${
                  isHighCapacity ? "bg-warning" : "bg-primary"
                }`}
              />
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {metrics.dailyCapacity
              ? "Défini dans les paramètres de votre pressing. Une fois le seuil atteint, votre visibilité est automatiquement régulée."
              : "Aucune limite configurée dans les paramètres."}
          </p>
        </div>

        {/* Performance Widget */}
        <div className="p-5 rounded-3xl bg-card border border-border shadow-xs space-y-3">
          <span className="text-xs font-bold text-foreground block">
            Qualité & Ponctualité
          </span>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-surface border border-border">
              <span className="text-[10px] font-bold text-muted-foreground block uppercase">
                Livraisons à temps
              </span>
              <span className="text-lg font-black text-success font-display block mt-1">
                {metrics.onTimeDeliveryRate ? `${metrics.onTimeDeliveryRate}%` : "—"}
              </span>
              <span className="text-[10px] text-muted-foreground">vs délai promis</span>
            </div>

            <div className="p-3 rounded-2xl bg-surface border border-border">
              <span className="text-[10px] font-bold text-muted-foreground block uppercase">
                Note moyenne
              </span>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-lg font-black text-heading font-display">
                  {metrics.house.rating ? metrics.house.rating.toFixed(1) : "—"}
                </span>
                {metrics.house.rating && <Star className="size-4 fill-amber-400 text-warning" />}
              </div>
              <span className="text-[10px] text-muted-foreground">Avis clients</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
