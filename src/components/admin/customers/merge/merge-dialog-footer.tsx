"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MergeDialogFooterProps {
  step: 1 | 2 | 3 | 4;
  loading: boolean;
  canProceed: boolean;
  preselectedGuest: boolean;
  onBackOrCancel: () => void;
  onNext: () => void;
  onFinalSubmit: () => void;
}

export function MergeDialogFooter({
  step,
  loading,
  canProceed,
  preselectedGuest,
  onBackOrCancel,
  onNext,
  onFinalSubmit,
}: MergeDialogFooterProps) {
  const isFirstStep = step === 1 || (step === 2 && preselectedGuest);

  return (
    <div className="p-4 border-t-2 border-border-strong flex items-center justify-between bg-surface">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onBackOrCancel}
        disabled={loading}
        className="min-h-[40px] px-4 text-xs font-semibold border-2 border-border-strong"
      >
        {isFirstStep ? "Annuler" : "Retour"}
      </Button>

      {step === 1 && (
        <Button
          type="button"
          disabled={!canProceed}
          onClick={onNext}
          className="min-h-[40px] px-4 text-xs font-bold bg-primary text-white"
        >
          <span>Continuer</span>
          <ArrowRight className="size-3.5 ml-1" />
        </Button>
      )}

      {step === 2 && (
        <Button
          type="button"
          disabled={!canProceed || loading}
          onClick={onNext}
          className="min-h-[40px] px-4 text-xs font-bold bg-primary text-white"
        >
          <span>{loading ? "Chargement..." : "Voir l'aperçu"}</span>
          <ArrowRight className="size-3.5 ml-1" />
        </Button>
      )}

      {step === 3 && (
        <Button
          type="button"
          onClick={onNext}
          className="min-h-[40px] px-4 text-xs font-bold bg-primary text-white"
        >
          <span>Passer à la confirmation</span>
          <ArrowRight className="size-3.5 ml-1" />
        </Button>
      )}

      {step === 4 && (
        <Button
          type="button"
          disabled={!canProceed || loading}
          onClick={onFinalSubmit}
          className="min-h-[40px] px-4 text-xs font-bold bg-destructive text-white hover:bg-destructive/90 disabled:opacity-40"
        >
          {loading ? "Fusion en cours..." : "Confirmer la fusion irréversible"}
        </Button>
      )}
    </div>
  );
}
