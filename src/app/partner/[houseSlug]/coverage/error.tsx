"use client";

import { use } from "react";
import { PartnerErrorView } from "@/components/house/partner-error-view";

interface PartnerCoverageErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
  params: Promise<{ houseSlug: string }>;
}

export default function PartnerCoverageError({
  error,
  reset,
  params,
}: PartnerCoverageErrorProps) {
  const { houseSlug } = use(params);

  return (
    <PartnerErrorView
      error={error}
      reset={reset}
      title="Erreur de zones couvertes"
      description="Impossible de charger le gestionnaire de couverture géographique et les quartiers desservis."
      houseSlug={houseSlug}
    />
  );
}
