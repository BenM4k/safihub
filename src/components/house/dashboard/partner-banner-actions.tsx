"use client";

import Link from "next/link";
import { ExternalLink, Settings, PauseCircle, PlayCircle } from "lucide-react";

interface PartnerBannerActionsProps {
  slug: string;
  isPaused: boolean;
  onOpenPauseDialog: () => void;
}

export function PartnerBannerActions({
  slug,
  isPaused,
  onOpenPauseDialog,
}: PartnerBannerActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0 shrink-0">
      {/* Accept orders toggle */}
      <button
        type="button"
        onClick={onOpenPauseDialog}
        aria-pressed={!isPaused}
        aria-label={
          isPaused
            ? "Reprendre les commandes"
            : "Suspendre temporairement les commandes"
        }
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
          !isPaused
            ? "bg-success-soft text-success border-success/30 hover:bg-success-soft/80"
            : "bg-warning-soft text-warning border-warning/30 hover:bg-warning-soft/80"
        }`}
      >
        {!isPaused ? (
          <>
            <PlayCircle className="size-4 text-success" />
            <span>Commandes actives</span>
          </>
        ) : (
          <>
            <PauseCircle className="size-4 text-warning" />
            <span>En pause</span>
          </>
        )}
      </button>

      <Link
        href={`/houses/${slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-foreground bg-secondary hover:bg-secondary/80 border border-transparent transition"
      >
        <span>Voir page publique</span>
        <ExternalLink className="size-3.5 text-muted-foreground" />
      </Link>

      <Link
        href={`/partner/${slug}/settings`}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-foreground bg-secondary hover:bg-secondary/80 border border-transparent transition"
        title="Modifier le profil et les paramètres"
      >
        <Settings className="size-3.5 text-muted-foreground" />
        <span className="hidden sm:inline">Paramètres</span>
      </Link>
    </div>
  );
}
