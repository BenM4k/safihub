"use client";

import { use } from "react";
import { PartnerErrorView } from "@/components/house/partner-error-view";

interface PartnerCatalogueErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
  params: Promise<{ houseSlug: string }>;
}

export default function PartnerCatalogueError({
  error,
  reset,
  params,
}: PartnerCatalogueErrorProps) {
  const { houseSlug } = use(params);

  return (
    <PartnerErrorView
      error={error}
      reset={reset}
      title="Erreur lors du chargement du catalogue"
      description="Impossible de charger les articles et la grille tarifaire de votre pressing."
      houseSlug={houseSlug}
    />
  );
}
