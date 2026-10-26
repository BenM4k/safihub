"use client";

import { Gauge } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";

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
    <section className="py-2 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Gauge className="size-4 text-primary" />
            <span>Capacité journalière de traitement</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Limite le nombre de commandes acceptées par jour. Au plafond, les créneaux sont verrouillés.
          </p>
        </div>

        <Switch
          checked={hasCapacityLimit}
          onCheckedChange={onToggleLimit}
          aria-label="Limiter les commandes par jour"
        />
      </div>

      {/* Usage Gauge */}
      <div className="p-3.5 bg-muted/40 rounded-xl space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-muted-foreground">Commandes aujourd&apos;hui</span>
          <span className="font-bold text-foreground">
            {todayOrdersCount} {capTotal ? `/ ${capTotal}` : "commandes (illimité)"}
          </span>
        </div>

        {capTotal && (
          <Progress value={capPercent} className="h-2" />
        )}
      </div>

      {hasCapacityLimit && (
        <div className="pt-1">
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Plafond de commandes par jour
          </label>
          <Input
            type="number"
            min={1}
            max={500}
            value={dailyCapacity ?? ""}
            onChange={(e) => onChangeCapacity(parseInt(e.target.value, 10) || 1)}
            className="w-full sm:w-48 text-xs font-bold font-mono min-h-[38px]"
          />
        </div>
      )}
    </section>
  );
}
