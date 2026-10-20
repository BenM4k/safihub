"use client";

import { CourierErrorView } from "@/components/courier/courier-error-view";

interface CourierHistoryErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function CourierHistoryError({
  error,
  reset,
}: CourierHistoryErrorProps) {
  return (
    <CourierErrorView
      error={error}
      reset={reset}
      title="Erreur d'historique de courses"
      description="Impossible de charger l'historique complet de vos missions et gains cumulés."
    />
  );
}
