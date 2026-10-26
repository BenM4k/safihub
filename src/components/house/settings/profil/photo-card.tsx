"use client";

import { Image as ImageIcon } from "lucide-react";

export function PhotoCard() {
  return (
    <section className="py-2 space-y-3">
      <div className="flex items-center gap-2">
        <ImageIcon className="size-4 text-primary" />
        <h2 className="text-sm font-bold text-foreground">Photo de vitrine du pressing</h2>
      </div>
      <p className="text-xs text-muted-foreground">
        Image affichée sur la carte et la fiche client. Format JPG, PNG ou WebP (max 5 Mo).
      </p>

      <div className="p-6 border-2 border-dashed border-border/80 rounded-xl flex flex-col items-center justify-center bg-muted/20 space-y-2 text-center">
        <ImageIcon className="size-8 text-muted-foreground/60" />
        <span className="text-xs font-semibold text-foreground">
          Photo de vitrine officielle
        </span>
        <span className="text-[11px] text-muted-foreground max-w-sm">
          Pour garantir la qualité d&apos;affichage aux clients, la photo de vitrine est validée et mise à jour par l&apos;équipe d&apos;assistance SafiHub.
        </span>
      </div>

      <p className="text-[11px] text-muted-foreground">
        Toute nouvelle photo de vitrine reste soumise à validation modérée par l&apos;équipe SafiHub avant publication publique.
      </p>
    </section>
  );
}
