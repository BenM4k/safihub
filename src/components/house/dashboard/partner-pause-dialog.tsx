"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PartnerPauseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  isPaused: boolean;
  onConfirm: () => void;
  isPending: boolean;
  houseName: string;
}

export function PartnerPauseDialog({
  isOpen,
  onClose,
  isPaused,
  onConfirm,
  isPending,
  houseName,
}: PartnerPauseDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in"
    >
      <div className="w-full max-w-md bg-card rounded-3xl p-6 space-y-4 shadow-lift border border-border">
        <div className="flex items-center gap-3">
          <div
            className={`size-11 rounded-2xl flex items-center justify-center ${
              !isPaused ? "bg-warning-soft text-warning" : "bg-success-soft text-success"
            }`}
          >
            <AlertTriangle className="size-5" />
          </div>
          <div>
            <h3 className="font-display font-black text-base text-heading">
              {!isPaused
                ? "Mettre les commandes en pause ?"
                : "Reprendre la réception des commandes ?"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {houseName} · Bukavu
            </p>
          </div>
        </div>

        <p className="text-xs text-foreground leading-relaxed">
          {!isPaused
            ? "En mettant votre pressing en pause, les clients ne pourront plus soumettre de nouvelles commandes sur votre établissement. Vos commandes déjà acceptées ou en cours de traitement restent actives."
            : "Votre pressing redeviendra immédiatement sélectionnable dans le catalogue SafiHub et pourra recevoir de nouvelles commandes."}
        </p>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <Button
            type="button"
            variant="ghost"
            disabled={isPending}
            onClick={onClose}
            className="text-xs font-semibold"
          >
            Annuler
          </Button>
          <Button
            type="button"
            disabled={isPending}
            onClick={onConfirm}
            className={`text-xs font-bold text-white ${
              !isPaused
                ? "bg-warning hover:bg-warning/90"
                : "bg-primary hover:bg-primary-hover"
            }`}
          >
            {isPending && (
              <Loader2 className="size-3.5 mr-1.5 animate-spin" />
            )}
            {!isPaused ? "Confirmer la pause" : "Confirmer la reprise"}
          </Button>
        </div>
      </div>
    </div>
  );
}
