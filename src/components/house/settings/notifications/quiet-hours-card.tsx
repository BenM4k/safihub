"use client";

import { Moon, Sparkles } from "lucide-react";

export function QuietHoursCard() {
  return (
    <div className="space-y-4">
      <section className="bg-card rounded-2xl border border-border p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Moon className="size-4 text-primary" />
          <h2 className="text-sm font-bold text-heading">Plage de repos (Heures calmes)</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          En dehors des heures d&apos;ouverture (21h00 à 07h00), les sonneries répétées sont automatiquement atténuées.
        </p>
      </section>

      <div className="p-4 bg-surface rounded-2xl border border-dashed border-border flex items-start gap-3 text-xs text-muted-foreground">
        <Sparkles className="size-4 text-primary shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-foreground block">Canaux externes (SMS, WhatsApp, E-mail) :</strong>
          Ces canaux sont proposés dans la feuille de route SafiHub et seront activés dès la mise en service des passerelles télécom directes.
        </div>
      </div>
    </div>
  );
}
