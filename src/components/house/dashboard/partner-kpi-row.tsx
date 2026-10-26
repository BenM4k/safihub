"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Wallet,
  CheckCircle,
  Timer,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
} from "lucide-react";
import { formatAmount } from "@/lib/order-formatters";
import { Separator } from "@/components/ui/separator";
import { PartnerKpiCell } from "./partner-kpi-cell";
import type { HouseDashboardMetrics } from "@/dal";

interface PartnerKpiRowProps {
  metrics: HouseDashboardMetrics;
  houseSlug: string;
}

/**
 * Borderless partner KPI summary row separated by vertical dividers.
 */
export function PartnerKpiRow({ metrics, houseSlug }: PartnerKpiRowProps) {
  const [revenuePeriod, setRevenuePeriod] = useState<"day" | "week">("day");

  const netRevenue =
    revenuePeriod === "day"
      ? metrics.todayNetRevenueCDF
      : metrics.weekNetRevenueCDF;

  const previousRevenue =
    revenuePeriod === "day"
      ? metrics.yesterdayNetRevenueCDF
      : metrics.lastWeekNetRevenueCDF;

  const revenueTrendPercent =
    previousRevenue > 0
      ? Math.round(((netRevenue - previousRevenue) / previousRevenue) * 100)
      : null;

  return (
    <div className="rounded-2xl border border-border bg-card p-2 sm:p-3 shadow-xs font-sans">
      <div className="flex flex-col lg:flex-row lg:items-center">
        {/* 1. Commandes du jour */}
        <PartnerKpiCell
          label="Commandes du jour"
          value={metrics.todayOrdersCount}
          subtext={
            metrics.dailyCapacity
              ? `Sur ${metrics.dailyCapacity} max`
              : "Volume du jour"
          }
          icon={ShoppingBag}
          href={`/partner/${houseSlug}/orders`}
        />

        <Separator orientation="vertical" className="hidden lg:block h-12 mx-1 shrink-0" />
        <Separator orientation="horizontal" className="lg:hidden my-1" />

        {/* 2. Revenu net (Day/Week switch) */}
        <div className="flex-1 p-3 text-left space-y-1 transition-colors rounded-xl hover:bg-muted/30 group">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
              Revenu net
            </span>
            <div className="inline-flex rounded-md bg-secondary p-0.5 text-[10px] font-bold">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setRevenuePeriod("day");
                }}
                className={`px-1.5 py-0.5 rounded transition cursor-pointer ${
                  revenuePeriod === "day"
                    ? "bg-card text-heading shadow-xs"
                    : "text-muted-foreground hover:text-heading"
                }`}
              >
                Jour
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setRevenuePeriod("week");
                }}
                className={`px-1.5 py-0.5 rounded transition cursor-pointer ${
                  revenuePeriod === "week"
                    ? "bg-card text-heading shadow-xs"
                    : "text-muted-foreground hover:text-heading"
                }`}
              >
                Sem.
              </button>
            </div>
          </div>
          <Link
            href={`/partner/${houseSlug}/settlements`}
            className="block cursor-pointer"
          >
            <div className="flex items-baseline justify-between gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 truncate">
                {formatAmount(netRevenue)}
              </span>
              <ChevronRight className="size-3.5 text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
            </div>
            <div className="flex items-center gap-1 text-[11px] truncate mt-0.5">
              {revenueTrendPercent !== null ? (
                <span
                  className={`inline-flex items-center gap-0.5 font-bold ${
                    revenueTrendPercent >= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-destructive"
                  }`}
                >
                  {revenueTrendPercent >= 0 ? (
                    <ArrowUpRight className="size-3" />
                  ) : (
                    <ArrowDownRight className="size-3" />
                  )}
                  <span>{Math.abs(revenueTrendPercent)}%</span>
                  <span className="text-muted-foreground font-normal">vs préc.</span>
                </span>
              ) : (
                <span className="text-muted-foreground">Après commission</span>
              )}
            </div>
          </Link>
        </div>

        <Separator orientation="vertical" className="hidden lg:block h-12 mx-1 shrink-0" />
        <Separator orientation="horizontal" className="lg:hidden my-1" />

        {/* 3. Solde à recevoir */}
        <PartnerKpiCell
          label="Solde à recevoir"
          value={formatAmount(metrics.balanceOwedCDF)}
          subtext={`Règlement : ${metrics.nextSettlementDate}`}
          icon={Wallet}
          href={`/partner/${houseSlug}/settlements`}
          iconBgClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />

        <Separator orientation="vertical" className="hidden lg:block h-12 mx-1 shrink-0" />
        <Separator orientation="horizontal" className="lg:hidden my-1" />

        {/* 4. Taux d'acceptation (30 j) */}
        <PartnerKpiCell
          label="Taux acceptation (30 j)"
          value={
            metrics.acceptanceRate30d !== null
              ? `${metrics.acceptanceRate30d}%`
              : "—"
          }
          subtext={
            metrics.acceptanceRateTrend !== null ? (
              <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-bold">
                <ArrowUpRight className="size-3" />
                <span>+{metrics.acceptanceRateTrend}% vs m-1</span>
              </span>
            ) : (
              "Objectif ≥ 85%"
            )
          }
          icon={CheckCircle}
          href={`/partner/${houseSlug}/orders`}
          iconBgClass="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        />

        <Separator orientation="vertical" className="hidden lg:block h-12 mx-1 shrink-0" />
        <Separator orientation="horizontal" className="lg:hidden my-1" />

        {/* 5. Délai moyen d'acceptation */}
        <PartnerKpiCell
          label="Délai acceptation"
          value={
            metrics.avgAcceptanceMinutes
              ? `${metrics.avgAcceptanceMinutes} min`
              : "—"
          }
          subtext="Limite max : 45 min"
          icon={Timer}
          href={`/partner/${houseSlug}/orders`}
        />
      </div>
    </div>
  );
}
