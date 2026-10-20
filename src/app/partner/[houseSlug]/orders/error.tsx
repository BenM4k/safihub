"use client";

import { use } from "react";
import { PartnerErrorView } from "@/components/house/partner-error-view";

interface PartnerOrdersErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
  params: Promise<{ houseSlug: string }>;
}

export default function PartnerOrdersError({
  error,
  reset,
  params,
}: PartnerOrdersErrorProps) {
  const { houseSlug } = use(params);

  return (
    <PartnerErrorView
      error={error}
      reset={reset}
      title="Erreur lors de la gestion des commandes"
      description="Impossible de charger la liste des commandes de votre pressing."
      houseSlug={houseSlug}
    />
  );
}
