"use client";

import { ArrowDownRight, ArrowUpRight, CircleDollarSign, Minus, Percent, Receipt, Wallet } from "lucide-react";
import { formatMoney } from "@/lib/cash-formatters";
import type { PartnerSettlementKpiData } from "@/types/partner-settlements";
import { KpiCard } from "@/components/shared";

interface PeriodKpiRowProps {
  kpis: PartnerSettlementKpiData;
}

function renderTrend(diff: number | null, percent: number | null) {
  if (diff === null || diff === 0) {
    return (
      <span className="flex items-center gap-1 text-2xs text-muted-foreground">
        <Minus className="size-3" aria-hidden="true" />
        <span>Stable vs période préc.</span>
      </span>
    );
  }

  const isUp = diff > 0;
  const Arrow = isUp ? ArrowUpRight : ArrowDownRight;
  const color = isUp ? "text-success-base" : "text-destructive-base";
  const sign = isUp ? "+" : "";

  return (
    <span className={`flex items-center gap-1 text-2xs font-semibold ${color}`}>
      <Arrow className="size-3.5" aria-hidden="true" />
      <span>
        {sign}{formatMoney(diff, "CDF")} {percent !== null ? `(${sign}${percent}%)` : ""}{" "}
        <span className="text-muted-foreground font-normal">vs préc.</span>
      </span>
    </span>
  );
}

export function PeriodKpiRow({ kpis }: PeriodKpiRowProps) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Chiffre d'affaires brut */}
        <KpiCard
          label="Chiffre d'affaires brut"
          value={formatMoney(kpis.grossRevenueCDF, "CDF")}
          icon={CircleDollarSign}
          tooltip="Total des montants facturés pour les articles de pressing sur les commandes livrées de la période (hors frais de livraison)."
          formula="Articles livrés"
          secondary={renderTrend(kpis.grossTrendDiffCDF, kpis.grossTrendPercent)}
        />

        {/* 2. Commissions prélevées */}
        <KpiCard
          label={`Commissions SafiHub (${kpis.commissionRatePercent}%)`}
          value={`-${formatMoney(kpis.commissionCDF, "CDF")}`}
          icon={Percent}
          tooltip={`Montant de commission prélevé par la plateforme SafiHub sur les articles livrés (taux fixé à ${kpis.commissionRatePercent}%).`}
          formula={`Taux : ${kpis.commissionRatePercent}%`}
          secondary={
            <span className="text-2xs text-muted-foreground">
              Déduit automatiquement à la source
            </span>
          }
        />

        {/* 3. Net à percevoir */}
        <KpiCard
          label="Net à percevoir"
          value={formatMoney(kpis.netReceivableCDF, "CDF")}
          icon={Wallet}
          variant="success"
          tooltip="Votre revenu net généré sur la période (Brut − Commissions). Ce montant vous revient intégralement."
          formula="Brut − Commission = Net"
          secondary={renderTrend(kpis.netTrendDiffCDF, kpis.netTrendPercent)}
        />

        {/* 4. Total versé */}
        <KpiCard
          label="Total versé"
          value={formatMoney(kpis.totalSettledCDF, "CDF")}
          icon={Receipt}
          tooltip="Somme des versements effectifs décaissés et reçus sur votre compte durant cette période."
          formula="Versements effectués"
          secondary={
            <span className="text-2xs text-muted-foreground">
              Versements reçus sur la période
            </span>
          }
        />
      </div>

      {/* Adjustments note if any difference between brut - commission and net */}
      {kpis.adjustmentsCDF !== 0 && (
        <div className="text-2xs text-ink-600 bg-surface px-3 py-1.5 rounded-lg border border-border flex items-center justify-between">
          <span>
            * Un ajustement de {formatMoney(kpis.adjustmentsCDF, "CDF")} est appliqué sur la période suite à des régularisations exceptionnelles.
          </span>
          <span className="font-mono font-bold">
            Brut ({formatMoney(kpis.grossRevenueCDF)}) − Commission ({formatMoney(kpis.commissionCDF)}) + Ajustement ({formatMoney(kpis.adjustmentsCDF)}) = Net ({formatMoney(kpis.netReceivableCDF)})
          </span>
        </div>
      )}
    </div>
  );
}
