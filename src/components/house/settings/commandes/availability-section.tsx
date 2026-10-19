"use client";

import { Info, PauseCircle, PlayCircle } from "lucide-react";

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
    <section className="bg-card rounded-2xl border border-border p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-heading flex items-center gap-2">
            <span>Disponibilité des commandes</span>
            {isPaused ? (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-warning-soft text-warning border border-warning/30">
                En pause
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-success-soft text-success border border-success/30">
                Commandes acceptées
              </span>
            )}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Suspend temporairement la réception de nouvelles commandes sans affecter les commandes en cours.
          </p>
        </div>

        <button
          type="button"
          onClick={onTogglePause}
          className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            isPaused
              ? "bg-warning text-primary-foreground shadow-xs hover:bg-warning/90"
              : "bg-surface text-foreground border border-border hover:bg-secondary"
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
        </button>
      </div>

      {isPaused && (
        <div className="p-3.5 bg-warning-soft/50 border border-warning/20 rounded-xl text-xs space-y-1">
          <div className="font-semibold text-warning flex items-center gap-1.5">
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
