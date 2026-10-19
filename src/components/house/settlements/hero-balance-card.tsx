"use client";

import Link from "next/link";
import { Calendar, CheckCircle2, ChevronRight, HelpCircle, Phone, Wallet } from "lucide-react";
import { formatMoney } from "@/lib/cash-formatters";
import type { PartnerSettlementHeroData } from "@/types/partner-settlements";

interface HeroBalanceCardProps {
  hero: PartnerSettlementHeroData;
  houseSlug: string;
}

export function HeroBalanceCard({ hero, houseSlug }: HeroBalanceCardProps) {
  const isPositive = hero.balanceOwedCDF > 0;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface to-card border border-border shadow-xs p-5 sm:p-7 space-y-6">
      {/* Top row: Header & Account badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="size-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
            <Wallet className="size-5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Solde à recevoir
              </span>
              <span
                className="inline-flex items-center text-ink-400 hover:text-ink-600 transition-colors cursor-help"
                title="Total net de toutes vos commandes livrées moins tous les versements déjà reçus."
              >
                <HelpCircle className="size-3.5" />
              </span>
            </div>
            <p className="text-2xs text-muted-foreground">
              Total cumulé dû par SafiHub à votre pressing
            </p>
          </div>
        </div>

        {/* Payout method badge or action */}
        {hero.isPayoutMethodConfigured ? (
          <div className="flex items-center gap-2 self-start sm:self-auto px-3 py-1.5 rounded-lg bg-surface border border-border text-xs text-heading font-medium">
            <Phone className="size-3.5 text-success shrink-0" aria-hidden="true" />
            <span className="font-mono text-2xs sm:text-xs">
              {hero.payoutMethodName} · {hero.maskedAccount}
            </span>
          </div>
        ) : (
          <Link
            href={`/partner/${houseSlug}/settings`}
            className="flex items-center gap-1.5 self-start sm:self-auto px-3 py-1.5 rounded-lg bg-warning-light text-warning-base border border-warning-base/30 text-xs font-semibold hover:bg-warning-light/80 transition min-h-[44px] sm:min-h-0"
          >
            <span>Ajouter numéro Mobile Money</span>
            <ChevronRight className="size-3.5" />
          </Link>
        )}
      </div>

      {/* Main balance display */}
      <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4">
        <div>
          <div className="text-3xl sm:text-4xl md:text-5xl font-black font-mono tracking-tight text-heading tabular-nums">
            {formatMoney(hero.balanceOwedCDF, "CDF")}
          </div>

          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground flex-wrap">
            <div className="flex items-center gap-1.5">
              <Calendar className="size-3.5 text-primary shrink-0" aria-hidden="true" />
              <span>
                Prochain versement :{" "}
                <strong className="text-heading font-semibold">
                  {hero.nextPayoutDate}
                </strong>
              </span>
            </div>
            <span>•</span>
            <span>{hero.payoutCycle}</span>
            {hero.minPayoutThresholdCDF ? (
              <>
                <span>•</span>
                <span>Seuil min : {formatMoney(hero.minPayoutThresholdCDF)}</span>
              </>
            ) : null}
          </div>
        </div>

        {/* Status pill on large balance */}
        <div className="self-start md:self-end">
          {isPositive ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-soft text-primary border border-primary/30 text-xs font-bold">
              <span className="size-2 rounded-full bg-primary animate-pulse" />
              En attente du cycle hebdomadaire
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success-light text-success-base border border-success-base/30 text-xs font-semibold">
              <CheckCircle2 className="size-3.5" />
              Tout est à jour
            </span>
          )}
        </div>
      </div>

      {/* Reconciliation Equation Line */}
      <div className="pt-4 border-t border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap text-muted-foreground font-mono">
          <span className="text-heading font-bold">
            {formatMoney(hero.totalAllTimeNetCDF, "CDF")}
          </span>
          <span className="text-muted-foreground/70 text-2xs font-sans">(Net gagné)</span>
          <span className="text-ink-400 font-bold">−</span>
          <span className="text-heading font-bold">
            {formatMoney(hero.totalAllTimeSettledCDF, "CDF")}
          </span>
          <span className="text-muted-foreground/70 text-2xs font-sans">(Déjà versé)</span>
          <span className="text-ink-400 font-bold">=</span>
          <span className="text-primary font-bold">
            {formatMoney(hero.balanceOwedCDF, "CDF")}
          </span>
          <span className="text-primary/80 text-2xs font-sans">(Reste dû)</span>
        </div>

        <span className="text-2xs text-muted-foreground">
          Calcul automatique certifié conforme
        </span>
      </div>
    </div>
  );
}
