"use client";

import { AlertTriangle, Eye } from "lucide-react";
import type { HouseExclusionRecord } from "@/dal";

interface CustomerPreviewCardProps {
  exclusions: HouseExclusionRecord[];
}

export function CustomerPreviewCard({ exclusions }: CustomerPreviewCardProps) {
  if (exclusions.length === 0) return null;

  return (
    <section className="py-2 space-y-3">
      <div className="flex items-center gap-2 text-xs font-bold text-foreground">
        <Eye className="size-4 text-primary" />
        <span>Aperçu côté client (Page publique du pressing)</span>
      </div>

      <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 flex items-start gap-3 text-amber-900 dark:text-amber-200 text-xs sm:text-sm">
        <AlertTriangle className="size-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1 min-w-0 flex-1">
          <strong className="block font-semibold">Articles et matières non pris en charge :</strong>
          <ul className="list-disc list-inside text-xs space-y-1 text-slate-700 dark:text-slate-200 pl-1 leading-relaxed">
            {exclusions.map((ex) => (
              <li key={ex.id} className="break-words">
                <strong>{ex.itemNameFr ?? "Tous articles"}</strong> ({ex.fabricNameFr ?? "Toutes matières"})
                {ex.note && <span className="text-slate-500 dark:text-slate-400"> — {ex.note}</span>}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
