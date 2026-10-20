"use client";

import { use } from "react";
import { PartnerErrorView } from "@/components/house/partner-error-view";

interface PartnerSettingsErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
  params: Promise<{ houseSlug: string }>;
}

export default function PartnerSettingsError({
  error,
  reset,
  params,
}: PartnerSettingsErrorProps) {
  const { houseSlug } = use(params);

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
