"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminCashErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminCashError({ error, reset }: AdminCashErrorProps) {
  useEffect(() => {
    // Log error for telemetry/Sentry if available
    console.error("Admin cash page error:", error);
  }, [error]);

  return (
    <div
      role="alert"
      className="p-6 my-6 bg-card rounded-2xl border border-destructive-base/30 shadow-xs max-w-xl mx-auto space-y-4 text-center"
    >
      <div className="size-12 rounded-xl bg-destructive-light text-destructive-base border border-destructive-base/30 flex items-center justify-center mx-auto">
        <AlertCircle className="size-6" />
      </div>

      <div className="space-y-1.5">
        <h2 className="text-base font-bold text-heading font-display">
          Erreur de chargement des données de caisse
        </h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {error.message ||
            "Une erreur inattendue est survenue lors de la récupération des écritures comptables ou du grand livre de caisse."}
        </p>
      </div>

      <div className="pt-2">
        <Button
          type="button"
          onClick={reset}
          className="min-h-[40px] px-5 text-xs font-semibold gap-2 bg-primary hover:bg-primary-hover text-white"
        >
          <RotateCcw className="size-4" />
          <span>Réessayer</span>
        </Button>
      </div>
    </div>
  );
}
