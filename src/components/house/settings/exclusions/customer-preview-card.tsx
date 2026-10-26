"use client";

import { AlertCircle, Eye } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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

      <Alert className="border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200">
        <AlertCircle className="size-4 text-amber-600 dark:text-amber-400" />
        <AlertTitle className="text-xs font-bold">
          Articles et matières non pris en charge :
        </AlertTitle>
        <AlertDescription className="mt-1">
          <ul className="list-disc list-inside text-xs space-y-1 text-foreground/80 pl-2">
            {exclusions.map((ex) => (
              <li key={ex.id}>
                <strong>{ex.itemNameFr ?? "Tous articles"}</strong> ({ex.fabricNameFr ?? "Toutes matières"})
                {ex.note && <span className="text-muted-foreground"> — {ex.note}</span>}
              </li>
            ))}
          </ul>
        </AlertDescription>
      </Alert>
    </section>
  );
}
