"use client";

import { useParams } from "next/navigation";
import { PartnerErrorView } from "@/components/house/partner-error-view";

interface PartnerHoursErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PartnerHoursError({
  error,
  reset,
}: PartnerHoursErrorProps) {
  const params = useParams<{ houseSlug?: string }>();
  const houseSlug = params?.houseSlug;

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
