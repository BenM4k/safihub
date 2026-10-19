import { Wallet } from "lucide-react";
import type { HouseRecord } from "@/dal";

interface FinancialTermsCardProps {
  house: HouseRecord;
  nextPayoutDate?: string;
}

export function FinancialTermsCard({ house, nextPayoutDate }: FinancialTermsCardProps) {
  const nextMondayLabel = nextPayoutDate ?? "Lundi prochain";

  const commissionPercent = house.isOwnerHouse
    ? 0
    : house.commissionBps !== null
    ? house.commissionBps / 100
    : 20;

  return (
    <section className="bg-card rounded-2xl border border-border p-5 shadow-xs space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          <Wallet className="size-4" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-heading">Modalités des versements</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Conditions contractuelles appliquées aux règlements SafiHub.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="p-3 bg-surface rounded-xl border border-border space-y-1">
          <span className="text-muted-foreground block text-[11px]">Taux de commission SafiHub</span>
          <span className="font-bold text-heading text-sm font-mono">{commissionPercent}%</span>
          <span className="text-[10px] text-muted-foreground block">
            {house.isOwnerHouse ? "Pressing propriétaire (0%)" : "Sur chiffre d'affaires articles"}
          </span>
        </div>

        <div className="p-3 bg-surface rounded-xl border border-border space-y-1">
          <span className="text-muted-foreground block text-[11px]">Fréquence de versement</span>
          <span className="font-bold text-heading text-sm">Hebdomadaire</span>
          <span className="text-[10px] text-muted-foreground block">Chaque lundi</span>
        </div>

        <div className="p-3 bg-surface rounded-xl border border-border space-y-1">
          <span className="text-muted-foreground block text-[11px]">Seuil minimum de versement</span>
          <span className="font-bold text-heading text-sm font-mono">Aucun seuil</span>
          <span className="text-[10px] text-muted-foreground block">Règlement intégral sans retenue</span>
        </div>

        <div className="p-3 bg-surface rounded-xl border border-border space-y-1">
          <span className="text-muted-foreground block text-[11px]">Prochain versement</span>
          <span className="font-bold text-heading text-sm text-primary">{nextMondayLabel}</span>
          <span className="text-[10px] text-muted-foreground block">Calculé en heure de Bukavu</span>
        </div>
      </div>
    </section>
  );
}
