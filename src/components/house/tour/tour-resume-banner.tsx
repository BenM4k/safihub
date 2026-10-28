"use client";

import { BellRing, Play, X, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TourResumeBannerProps {
  isOrderPaused: boolean;
  hasIncompleteTour: boolean;
  reminderCount: number;
  currentStepIndex: number;
  totalSteps: number;
  onResume: () => void;
  onDismiss: () => void;
}

export function TourResumeBanner({
  isOrderPaused,
  hasIncompleteTour,
  reminderCount,
  currentStepIndex,
  totalSteps,
  onResume,
  onDismiss,
}: TourResumeBannerProps) {
  if (isOrderPaused) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="p-3.5 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-950 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-in fade-in duration-200"
      >
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <BellRing className="size-4 animate-bounce" />
          </div>
          <div>
            <p className="text-xs font-bold leading-tight">
              Nouvelle commande, la visite est en pause
            </p>
            <p className="text-[11px] text-amber-800 dark:text-amber-300">
              Traitez la commande en priorité. Vous pourrez reprendre la visite à tout moment.
            </p>
          </div>
        </div>

        <Button
          type="button"
          size="sm"
          onClick={onResume}
          className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs h-9 px-4 rounded-xl shrink-0 cursor-pointer"
        >
          <Play className="size-3.5 mr-1.5 fill-current" />
          <span>Reprendre</span>
        </Button>
      </div>
    );
  }

  if (hasIncompleteTour && reminderCount < 2) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="p-3.5 sm:p-4 rounded-2xl bg-primary/5 border border-primary/20 text-foreground flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-in fade-in duration-200"
      >
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Compass className="size-4" />
          </div>
          <div>
            <p className="text-xs font-bold leading-tight">
              Reprendre la visite guidée ({currentStepIndex + 1} / {totalSteps})
            </p>
            <p className="text-[11px] text-muted-foreground">
              Continuez la découverte des fonctionnalités essentielles de votre espace pressing.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            type="button"
            size="sm"
            onClick={onResume}
            className="font-bold text-xs h-8 px-3 rounded-xl cursor-pointer"
          >
            <Play className="size-3.5 mr-1 fill-current" />
            <span>Reprendre</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            aria-label="Ignorer le rappel"
            className="text-xs text-muted-foreground hover:text-foreground h-8 px-2 rounded-xl"
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
