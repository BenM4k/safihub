"use client";

import { useParams } from "next/navigation";
import { PartnerErrorView } from "@/components/house/partner-error-view";

interface PartnerOrdersErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PartnerOrdersError({
  error,
  reset,
}: PartnerOrdersErrorProps) {
  const params = useParams<{ houseSlug?: string }>();
  const houseSlug = params?.houseSlug;

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
