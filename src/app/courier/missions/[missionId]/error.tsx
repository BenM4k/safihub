"use client";

import { CourierErrorView } from "@/components/courier/courier-error-view";

interface CourierMissionDetailErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function CourierMissionDetailError({
  error,
  reset,
}: CourierMissionDetailErrorProps) {
  return (
    <CourierErrorView
      error={error}
      reset={reset}
      title="Erreur lors du suivi de la mission"
      description="Impossible de charger le protocole de cette mission. Vous pouvez continuer les missions enregistrées hors-ligne."
    />
  );
}
