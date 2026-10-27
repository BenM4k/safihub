"use client";

import { Clock, Download, Globe, ShieldAlert, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";

export function PreferencesTab() {
  return (
    <div className="space-y-6">
      {/* 1. Regional Preferences */}
      <section className="space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Globe className="size-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">Préférences régionales</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Langue et fuseau horaire opérationnel.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <Field className="space-y-1.5">
            <FieldLabel className="font-semibold text-foreground">
              Langue de l&apos;interface
            </FieldLabel>
            <Input
              disabled
              value="Français (RDC) — Géré via le widget en bas à droite"
              className="text-base sm:text-xs h-10 min-h-[40px] bg-muted/30 text-muted-foreground cursor-not-allowed rounded-xl"
            />
            <span className="text-[10px] text-muted-foreground mt-1 block">
              Utilisez le bouton flottant circulaire en bas à droite de l&apos;écran pour changer de langue (FR / EN / SW).
            </span>
          </Field>

          <Field className="space-y-1.5">
            <FieldLabel className="font-semibold text-foreground flex items-center gap-1.5">
              <Clock className="size-3.5 text-muted-foreground" />
              <span>Fuseau horaire officiel</span>
            </FieldLabel>
            <Input
              type="text"
              value="Heure de Bukavu (UTC+2 / Africa/Lubumbashi)"
              disabled
              className="text-base sm:text-xs h-10 min-h-[40px] bg-muted/30 text-muted-foreground cursor-not-allowed rounded-xl"
            />
          </Field>
        </div>
      </section>

      <Separator />

      {/* 2. Zone sensible */}
      <section className="space-y-4">
        <div className="flex items-center gap-2.5 text-destructive">
          <div className="size-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
            <ShieldAlert className="size-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-destructive">Zone sensible</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Actions d&apos;export et demandes de clôture de compte.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 sm:p-5 space-y-4 divide-y divide-destructive/10">
          {/* Export data */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-foreground block">Exporter mes données</span>
              <p className="text-muted-foreground text-[11px] mt-0.5">
                Télécharger une copie complète au format JSON/CSV de vos commandes, catalogue et versements.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled
              className="h-10 sm:h-9 px-4 rounded-xl text-xs font-semibold self-start sm:self-auto opacity-50 cursor-not-allowed gap-1.5"
            >
              <Download className="size-3.5" />
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
            <Button
              variant="outline"
              size="sm"
              asChild
              className="h-10 sm:h-9 px-4 rounded-xl text-xs font-semibold text-destructive border-destructive/30 hover:bg-destructive/10 self-start sm:self-auto gap-1.5 cursor-pointer"
            >
              <a
                href="https://wa.me/243999999999"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Headphones className="size-3.5" />
                <span>Contacter le support pour fermeture</span>
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
