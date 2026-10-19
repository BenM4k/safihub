"use client";

import { Gauge } from "lucide-react";

interface CapacitySectionProps {
  hasCapacityLimit: boolean;
  dailyCapacity: number | null;
  todayOrdersCount: number;
  onToggleLimit: (checked: boolean) => void;
  onChangeCapacity: (capacity: number) => void;
}

export function CapacitySection({
  hasCapacityLimit,
  dailyCapacity,
  todayOrdersCount,
  onToggleLimit,
  onChangeCapacity,
}: CapacitySectionProps) {
  const capTotal = hasCapacityLimit && dailyCapacity ? dailyCapacity : null;
  const capPercent = capTotal
    ? Math.min(100, Math.round((todayOrdersCount / capTotal) * 100))
    : 0;

  return (
    <section className="bg-card rounded-2xl border border-border p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-heading flex items-center gap-2">
            <Gauge className="size-4 text-primary" />
            <span>Capacité journalière de traitement</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Limite le nombre de commandes acceptées par jour. Au plafond, les créneaux sont verrouillés.
          </p>
        </div>

        <label className="relative inline-flex items-center cursor-pointer min-h-[44px]">
          <input
            type="checkbox"
            checked={hasCapacityLimit}
            onChange={(e) => onToggleLimit(e.target.checked)}
            className="sr-only peer"
            aria-label="Limiter les commandes par jour"
          />
          <div className="w-11 h-6 bg-secondary peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[14px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
        </label>
      </div>

      {/* Usage Gauge */}
      <div className="p-3.5 bg-surface rounded-xl border border-border space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-muted-foreground">Commandes aujourd&apos;hui</span>
          <span className="font-bold text-heading">
            {todayOrdersCount} {capTotal ? `/ ${capTotal}` : "commandes (illimité)"}
          </span>
        </div>

        {capTotal && (
          <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                capPercent >= 90
                  ? "bg-destructive"
                  : capPercent >= 75
                    ? "bg-warning"
                    : "bg-primary"
              }`}
              style={{ width: `${capPercent}%` }}
            />
          </div>
        )}
      </div>

      {hasCapacityLimit && (
        <div className="pt-2">
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Plafond de commandes par jour
          </label>
          <input
            type="number"
            min={1}
            max={500}
            value={dailyCapacity ?? ""}
            onChange={(e) => onChangeCapacity(parseInt(e.target.value, 10) || 1)}
            className="w-full sm:w-48 h-10 min-h-[44px] px-3 rounded-xl border border-border text-xs font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
      )}
    </section>
  );
}
