"use client";

import { Clock, Download, Globe, ShieldAlert, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PreferencesTab() {
  return (
    <div className="space-y-6">
      {/* 1. Regional Preferences */}
      <section className="bg-card rounded-2xl border border-border p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Globe className="size-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-heading">Préférences régionales</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Langue et fuseau horaire opérationnel.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-semibold text-foreground block mb-1.5">
              Langue de l&apos;interface
            </label>
            <select
              disabled
              value="fr"
              className="w-full h-10 min-h-[44px] px-3 rounded-xl border border-border bg-secondary/60 text-muted-foreground text-xs font-medium cursor-not-allowed"
            >
              <option value="fr">Français (RDC) — Géré via le widget en bas à droite</option>
            </select>
            <span className="text-[10px] text-muted-foreground mt-1 block">
              Utilisez le bouton flottant circulaire en bas à droite de l&apos;écran pour changer de langue (FR / EN / SW).
            </span>
          </div>

          <div>
            <label className="font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
              <Clock className="size-3.5 text-muted-foreground" />
              <span>Fuseau horaire officiel</span>
            </label>
            <input
              type="text"
              value="Heure de Bukavu (UTC+2 / Africa/Lubumbashi)"
              disabled
              className="w-full h-10 min-h-[44px] px-3 rounded-xl border border-border bg-secondary/60 text-muted-foreground text-xs font-medium cursor-not-allowed"
            />
          </div>
        </div>
      </section>

      {/* 2. Zone sensible */}
      <section className="bg-card rounded-2xl border-2 border-destructive/20 p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 text-destructive">
          <div className="size-8 rounded-lg bg-destructive-soft text-destructive flex items-center justify-center">
            <ShieldAlert className="size-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-heading text-destructive">Zone sensible</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Actions d&apos;export et demandes de clôture de compte.
            </p>
          </div>
        </div>

        <div className="space-y-3 divide-y divide-border pt-1">
          {/* Export data */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 text-xs">
            <div>
              <span className="font-bold text-heading block">Exporter mes données</span>
              <p className="text-muted-foreground text-[11px] mt-0.5">
                Télécharger une copie complète au format JSON/CSV de vos commandes, catalogue et versements.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled
              className="min-h-[40px] px-3 text-xs font-semibold self-start sm:self-auto opacity-50 cursor-not-allowed"
            >
              <Download className="size-3.5 mr-1.5" />
              <span>Exporter les données (Bientôt disponible)</span>
            </Button>
          </div>

          {/* Closure request */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 text-xs">
            <div>
              <span className="font-bold text-destructive block">Demander la fermeture du pressing</span>
              <p className="text-muted-foreground text-[11px] mt-0.5">
                Nécessite la clôture préalable de toutes les commandes en cours et la liquidation des versements dus.
              </p>
            </div>
            <a
              href="https://wa.me/243999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-destructive border border-destructive/30 hover:bg-destructive-soft min-h-[40px] self-start sm:self-auto"
            >
              <Headphones className="size-3.5 mr-1.5" />
              <span>Contacter le support pour fermeture</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
