"use client";

import { PartnerErrorView } from "@/components/house/partner-error-view";

interface PartnerErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PartnerError({ error, reset }: PartnerErrorProps) {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <PartnerErrorView
        error={error}
        reset={reset}
        title="Erreur d'accès à l'espace partenaire"
        description="Impossible de charger les affiliations à vos ateliers de pressing. Veuillez vérifier votre session ou réessayer."
      />
    </div>
  );
}
