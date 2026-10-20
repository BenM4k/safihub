"use client";

import { use } from "react";
import { PartnerErrorView } from "@/components/house/partner-error-view";

interface PartnerHoursErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
  params: Promise<{ houseSlug: string }>;
}

export default function PartnerHoursError({
  error,
  reset,
  params,
}: PartnerHoursErrorProps) {
  const { houseSlug } = use(params);

  return (
    <PartnerErrorView
      error={error}
      reset={reset}
      title="Erreur des horaires et fermetures"
      description="Impossible de charger ou de modifier les plages d'ouverture hebdomadaires."
      houseSlug={houseSlug}
    />
  );
}
