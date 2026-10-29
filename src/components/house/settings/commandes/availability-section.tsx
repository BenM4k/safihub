"use client";

import { Info, PauseCircle, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AvailabilitySectionProps {
  isPaused: boolean;
  pausedUntil: string | null;
  pauseReason: string | null;
  onTogglePause: () => void;
}

export function AvailabilitySection({
  isPaused,
  pausedUntil,
  pauseReason,
  onTogglePause,
}: AvailabilitySectionProps) {
  return (
    <section className="py-2 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <span>Disponibilité des commandes</span>
            {isPaused ? (
              <Badge variant="outline" className="border-amber-500/30 text-amber-800 dark:text-amber-300 text-[11px] font-bold rounded-full">
                En pause
              </Badge>
            ) : (
              <Badge variant="outline" className="border-success/30 text-success bg-success-soft/30 text-[11px] font-bold rounded-full">
                Commandes acceptées
              </Badge>
            )}
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
            Suspend temporairement la réception de nouvelles commandes sans affecter les commandes en cours.
          </p>
        </div>

        <Button
          type="button"
          onClick={onTogglePause}
          variant={isPaused ? "default" : "outline"}
          size="sm"
          className={`min-h-[40px] px-4 text-xs font-bold gap-2 shrink-0 rounded-lg cursor-pointer ${
            isPaused ? "bg-amber-600 hover:bg-amber-700 text-white" : ""
          }`}
        >
          {isPaused ? (
            <>
              <PauseCircle className="size-4 shrink-0" />
              <span>En pause (reprendre)</span>
            </>
          ) : (
            <>
              <PlayCircle className="size-4 text-success shrink-0" />
              <span>Mettre en pause</span>
            </>
          )}
        </Button>
      </div>

      {isPaused && (
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs space-y-1">
          <div className="font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
            <Info className="size-3.5" />
            <span>Pressing actuellement en pause</span>
          </div>
          {pausedUntil && (
            <p className="text-[11px] text-muted-foreground">
              Reprise automatique prévue : {new Date(pausedUntil).toLocaleString("fr-FR")}
            </p>
          )}
          {pauseReason && (
            <p className="text-[11px] text-muted-foreground">Motif enregistré : {pauseReason}</p>
          )}
        </div>
      )}
    </section>
  );
}
