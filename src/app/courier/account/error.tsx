"use client";

import { CourierErrorView } from "@/components/courier/courier-error-view";

interface CourierAccountErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function CourierAccountError({
  error,
  reset,
}: CourierAccountErrorProps) {
  return (
    <CourierErrorView
      error={error}
      reset={reset}
      title="Erreur de compte coursier"
      description="Impossible de charger les données de votre profil coursier. Veuillez réessayer."
    />
  );
}
