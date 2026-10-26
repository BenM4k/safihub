"use client";

import { Shield } from "lucide-react";

export function PermissionsCard() {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Shield className="size-4 text-primary" />
        <h2 className="text-sm font-bold text-foreground">Matrice des rôles & permissions</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20 space-y-1.5">
          <span className="font-bold text-foreground block">Propriétaire</span>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Contrôle total : paramètres, coordonnées de versement, catalogue, équipe, fermeture. Le dernier propriétaire ne peut pas être retiré.
          </p>
        </div>
        <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20 space-y-1.5">
          <span className="font-bold text-foreground block">Gérant</span>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Gestion opérationnelle : commandes, catalogue, exclusions, horaires. Ne peut pas modifier les coordonnées de versement.
          </p>
        </div>
        <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20 space-y-1.5">
          <span className="font-bold text-foreground block">Opérateur</span>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Exécution atelier : acceptation, comptage de réception, marquage prêt. Accès en lecture seule aux réglages et tarifs.
          </p>
        </div>
      </div>
    </section>
  );
}
