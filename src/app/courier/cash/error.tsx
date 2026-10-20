"use client";

import { CourierErrorView } from "@/components/courier/courier-error-view";

interface CourierCashErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function CourierCashError({
  error,
  reset,
}: CourierCashErrorProps) {
  return (
    <CourierErrorView
      error={error}
      reset={reset}
      title="Erreur de caisse coursier"
      description="Impossible de charger le solde de caisse et le calcul des plafonds. Veuillez réessayer."
    />
  );
}
