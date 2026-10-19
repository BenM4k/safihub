"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle, ShieldCheck } from "lucide-react";

interface HowItWorksCardProps {
  commissionRatePercent: number;
  settlementDelayNotice: string;
}

export function HowItWorksCard({
  commissionRatePercent,
  settlementDelayNotice,
}: HowItWorksCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-left hover:bg-surface/50 transition cursor-pointer min-h-[44px]"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <HelpCircle className="size-4" />
          </div>
          <div>
            <span className="text-sm font-bold text-heading block">
              Comment fonctionnent vos versements et commissions ?
            </span>
            <span className="text-2xs text-muted-foreground">
              Fréquence, règles de calcul, délais et gestion des litiges
            </span>
          </div>
        </div>

        <ChevronDown
          className={`size-4 text-muted-foreground transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="p-4 sm:p-5 pt-0 border-t border-border/70 space-y-4 text-xs text-muted-foreground leading-relaxed animate-in fade-in duration-150">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3">
            {/* Rule 1: Frequency */}
            <div className="p-3.5 rounded-xl bg-surface border border-border space-y-1">
              <span className="font-bold text-heading block text-xs">
                1. Fréquence des versements
              </span>
              <p>
                Les règlements sont exécutés de façon hebdomadaire chaque <strong>lundi matin</strong>. Tous les montants nets accumulés sur les commandes livrées sont versés sur votre compte Mobile Money vérifié.
              </p>
            </div>

            {/* Rule 2: Commission */}
            <div className="p-3.5 rounded-xl bg-surface border border-border space-y-1">
              <span className="font-bold text-heading block text-xs">
                2. Taux de commission ({commissionRatePercent}%)
              </span>
              <p>
                SafiHub prélève une commission de <strong>{commissionRatePercent}%</strong> sur le montant des articles lavés. Les frais de livraison sont distincts et rémunèrent les coursiers et la logistique.
              </p>
            </div>

            {/* Rule 3: Delivery cutoff */}
            <div className="p-3.5 rounded-xl bg-surface border border-border space-y-1">
              <span className="font-bold text-heading block text-xs">
                3. Période couverte et délai
              </span>
              <p>
                {settlementDelayNotice}. Les commandes livrées le lundi sont incluses dans le cycle du lundi suivant.
              </p>
            </div>

            {/* Rule 4: Disputes & Cancelled */}
            <div className="p-3.5 rounded-xl bg-surface border border-border space-y-1">
              <span className="font-bold text-heading block text-xs">
                4. Gestion des litiges et annulations
              </span>
              <p>
                Toute commande faisant l&apos;objet d&apos;un litige ouvert est suspendue du calcul du virement jusqu&apos;à résolution par le support. Les commandes annulées ne génèrent aucun frais ni commission.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-primary-soft text-primary border border-primary/20 flex items-center gap-2 text-2xs">
            <ShieldCheck className="size-4 shrink-0" />
            <span>
              Besoin d&apos;assistance comptable ou d&apos;une modification de vos coordonnées Mobile Money ? Contactez le support Bukavu ou mettez à jour votre profil dans les Paramètres.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
