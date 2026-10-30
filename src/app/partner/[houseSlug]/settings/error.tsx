"use client";

import { useParams } from "next/navigation";
import { PartnerErrorView } from "@/components/house/partner-error-view";

interface PartnerSettingsErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PartnerSettingsError({
  error,
  reset,
}: PartnerSettingsErrorProps) {
  const params = useParams<{ houseSlug?: string }>();
  const houseSlug = params?.houseSlug;

  return (
    <PartnerErrorView
      error={error}
      reset={reset}
      title="Erreur des paramètres de l'atelier"
      description="Impossible de charger ou de modifier les configurations de votre pressing."
      houseSlug={houseSlug}
    />
  );
}
