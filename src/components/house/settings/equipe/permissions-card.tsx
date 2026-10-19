"use client";

import { Shield } from "lucide-react";

export function PermissionsCard() {
  return (
    <section className="bg-card rounded-2xl border border-border p-5 shadow-xs space-y-3">
      <div className="flex items-center gap-2">
        <Shield className="size-4 text-primary" />
        <h2 className="text-sm font-bold text-heading">Matrice des rôles & permissions</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="p-3.5 bg-surface rounded-xl border border-border space-y-1.5">
          <span className="font-bold text-heading block">Propriétaire</span>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Contrôle total : paramètres, coordonnées de versement, catalogue, équipe, fermeture. Le dernier propriétaire ne peut pas être retiré.
          </p>
        </div>
        <div className="p-3.5 bg-surface rounded-xl border border-border space-y-1.5">
          <span className="font-bold text-heading block">Gérant</span>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Gestion opérationnelle : commandes, catalogue, exclusions, horaires. Ne peut pas modifier les coordonnées de versement.
          </p>
        </div>
        <div className="p-3.5 bg-surface rounded-xl border border-border space-y-1.5">
          <span className="font-bold text-heading block">Opérateur</span>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Exécution atelier : acceptation, comptage de réception, marquage prêt. Accès en lecture seule aux réglages et tarifs.
          </p>
        </div>
      </div>
    </section>
  );
}
