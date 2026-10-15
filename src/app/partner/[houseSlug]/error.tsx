"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PartnerDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Partner dashboard error:", error);
  }, [error]);

  return (
    <div
      role="alert"
      className="rounded-3xl border border-destructive/20 bg-destructive-soft/50 p-6 sm:p-10 text-center max-w-xl mx-auto my-12 space-y-4"
    >
      <div className="size-14 rounded-2xl bg-destructive-soft text-destructive flex items-center justify-center mx-auto shadow-xs">
        <AlertTriangle className="size-7" />
      </div>

      <div className="space-y-1">
        <h2 className="font-display font-black text-lg text-heading">
          Impossible de charger le tableau de bord
        </h2>
        <p className="text-xs sm:text-sm text-foreground max-w-md mx-auto">
          Une erreur temporaire est survenue lors de la récupération des données de votre pressing.
          Veuillez réessayer ou vérifier votre connexion internet.
        </p>
      </div>

      <div className="pt-2">
        <Button
          type="button"
          onClick={() => reset()}
          className="rounded-xl font-bold bg-primary hover:bg-primary-hover text-primary-foreground text-xs px-5 h-10 gap-2 cursor-pointer"
        >
          <RotateCcw className="size-4" />
          <span>Réessayer</span>
        </Button>
      </div>
    </div>
  );
}
