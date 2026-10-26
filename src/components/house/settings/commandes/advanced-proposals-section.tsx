"use client";

import { Sparkles } from "lucide-react";

export function AdvancedProposalsSection() {
  return (
    <section className="py-2 space-y-3">
      <div className="flex items-center gap-2 text-primary font-bold text-xs">
        <Sparkles className="size-4" />
        <span>Paramètres opérationnels avancés (Standard plateforme)</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-3 bg-muted/40 rounded-xl space-y-1">
          <span className="font-semibold text-foreground block">
            Délai standard de traitement
          </span>
          <span className="text-muted-foreground text-[11px]">
            24h à 48h selon service et charge
          </span>
        </div>
        <div className="p-3 bg-muted/40 rounded-xl space-y-1">
          <span className="font-semibold text-foreground block">Service Express 12h</span>
          <span className="text-muted-foreground text-[11px]">Majoration standard +50%</span>
        </div>
        <div className="p-3 bg-muted/40 rounded-xl space-y-1">
          <span className="font-semibold text-foreground block">Créneaux de collecte</span>
          <span className="text-muted-foreground text-[11px]">
            Créneaux de 2h pendant les heures d&apos;ouverture
          </span>
        </div>
        <div className="p-3 bg-muted/40 rounded-xl space-y-1">
          <span className="font-semibold text-foreground block">
            Plafond articles par commande
          </span>
          <span className="text-muted-foreground text-[11px]">50 articles max par panier</span>
        </div>
      </div>
    </section>
  );
}
