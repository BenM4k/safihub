"use client";

import { AlertCircle, Eye } from "lucide-react";
import type { HouseExclusionRecord } from "@/dal";

interface CustomerPreviewCardProps {
  exclusions: HouseExclusionRecord[];
}

export function CustomerPreviewCard({ exclusions }: CustomerPreviewCardProps) {
  if (exclusions.length === 0) return null;

  return (
    <section className="bg-card rounded-2xl border border-border p-5 shadow-xs space-y-3">
      <div className="flex items-center gap-2 text-xs font-bold text-heading">
        <Eye className="size-4 text-primary" />
        <span>Aperçu côté client (Page publique du pressing)</span>
      </div>

      <div className="p-4 rounded-xl border border-warning/30 bg-warning-soft text-warning space-y-2">
        <div className="flex items-center gap-2 font-bold text-xs">
          <AlertCircle className="size-4 shrink-0" />
          <span>Articles et matières non pris en charge :</span>
        </div>
        <ul className="list-disc list-inside text-xs space-y-1 text-foreground/80 pl-2">
          {exclusions.map((ex) => (
            <li key={ex.id}>
              <strong>{ex.itemNameFr ?? "Tous articles"}</strong> ({ex.fabricNameFr ?? "Toutes matières"})
              {ex.note && <span className="text-muted-foreground"> — {ex.note}</span>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
