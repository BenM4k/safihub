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
} from "lucide-react";
import { formatAmount } from "@/lib/order-formatters";
import type { HouseDashboardMetrics } from "@/dal";

interface PartnerKpiRowProps {
  metrics: HouseDashboardMetrics;
  houseSlug: string;
}

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
    <div className="space-y-3 font-sans">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {/* 1. Commandes du jour */}
        <Link
          href={`/partner/${houseSlug}/orders`}
          className="p-4 rounded-2xl bg-card border border-border shadow-xs hover:border-border-strong hover:shadow-sm transition group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-muted-foreground truncate">
              Commandes du jour
            </span>
            <div className="size-8 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0 group-hover:bg-primary-soft/80 transition">
              <ShoppingBag className="size-4" />
            </div>
          </div>
          <div className="mt-2 space-y-1">
            <div className="text-xl sm:text-2xl font-black text-heading font-display">
              {metrics.todayOrdersCount}
            </div>
            <p className="text-[11px] text-muted-foreground font-medium">
              {metrics.dailyCapacity ? `Sur ${metrics.dailyCapacity} max` : "Volume du jour"}
            </p>
          </div>
        </Link>

        {/* 2. Revenu net (Jour / Semaine switch) */}
        <div className="p-4 rounded-2xl bg-card border border-border shadow-xs hover:border-border-strong hover:shadow-sm transition flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-bold text-muted-foreground truncate">
              Revenu net
            </span>
            {/* Inline day/week toggle */}
            <div className="inline-flex rounded-lg bg-secondary p-0.5 text-[10px] font-bold">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setRevenuePeriod("day");
                }}
                className={`px-1.5 py-0.5 rounded-md transition cursor-pointer ${
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
                className={`px-1.5 py-0.5 rounded-md transition cursor-pointer ${
                  revenuePeriod === "week"
                    ? "bg-card text-heading shadow-xs"
                    : "text-muted-foreground hover:text-heading"
                }`}
              >
                Sem.
              </button>
            </div>
          </div>

          <Link href={`/partner/${houseSlug}/settlements`} className="mt-2 space-y-1 block group">
            <div className="text-xl sm:text-2xl font-black text-success font-display truncate">
              {formatAmount(netRevenue)}
            </div>
            <div className="flex items-center gap-1 text-[11px]">
              {revenueTrendPercent !== null ? (
                <span
                  className={`inline-flex items-center gap-0.5 font-bold ${
                    revenueTrendPercent >= 0 ? "text-success" : "text-destructive"
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

        {/* 3. Solde à recevoir */}
        <Link
          href={`/partner/${houseSlug}/settlements`}
          className="p-4 rounded-2xl bg-card border border-border shadow-xs hover:border-border-strong hover:shadow-sm transition group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-muted-foreground truncate">
              Solde à recevoir
            </span>
            <div className="size-8 rounded-xl bg-success-soft text-success flex items-center justify-center shrink-0 group-hover:bg-success-soft/80 transition">
              <Wallet className="size-4" />
            </div>
          </div>
          <div className="mt-2 space-y-1">
            <div className="text-xl sm:text-2xl font-black text-heading font-display truncate">
              {formatAmount(metrics.balanceOwedCDF)}
            </div>
            <p className="text-[11px] text-muted-foreground font-medium truncate">
              Règlement : {metrics.nextSettlementDate}
            </p>
          </div>
        </Link>

        {/* 4. Taux d'acceptation (30 j) */}
        <Link
          href={`/partner/${houseSlug}/orders`}
          className="p-4 rounded-2xl bg-card border border-border shadow-xs hover:border-border-strong hover:shadow-sm transition group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-muted-foreground truncate">
              Taux acceptation (30 j)
            </span>
            <div className="size-8 rounded-xl bg-warning-soft text-warning flex items-center justify-center shrink-0 group-hover:bg-warning-soft/80 transition">
              <CheckCircle className="size-4" />
            </div>
          </div>
          <div className="mt-2 space-y-1">
            <div className="text-xl sm:text-2xl font-black text-heading font-display">
              {metrics.acceptanceRate30d !== null ? `${metrics.acceptanceRate30d}%` : "—"}
            </div>
            <div className="flex items-center gap-1 text-[11px]">
              {metrics.acceptanceRateTrend !== null ? (
                <span className="inline-flex items-center gap-0.5 text-success font-bold">
                  <ArrowUpRight className="size-3" />
                  <span>+{metrics.acceptanceRateTrend}%</span>
                  <span className="text-muted-foreground font-normal">vs m-1</span>
                </span>
              ) : (
                <span className="text-muted-foreground">Objectif ≥ 85%</span>
              )}
            </div>
          </div>
        </Link>

        {/* 5. Délai moyen d'acceptation */}
        <Link
          href={`/partner/${houseSlug}/orders`}
          className="p-4 rounded-2xl bg-card border border-border shadow-xs hover:border-border-strong hover:shadow-sm transition group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-muted-foreground truncate">
              Délai moyen acceptation
            </span>
            <div className="size-8 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0 group-hover:bg-primary-soft/80 transition">
              <Timer className="size-4" />
            </div>
          </div>
          <div className="mt-2 space-y-1">
            <div className="text-xl sm:text-2xl font-black text-heading font-display">
              {metrics.avgAcceptanceMinutes ? `${metrics.avgAcceptanceMinutes} min` : "—"}
            </div>
            <p className="text-[11px] text-muted-foreground font-medium">
              Limite max : 45 min
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
