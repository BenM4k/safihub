"use client";

import { useParams } from "next/navigation";
import { PartnerErrorView } from "@/components/house/partner-error-view";

interface PartnerCoverageErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PartnerCoverageError({
  error,
  reset,
}: PartnerCoverageErrorProps) {
  const params = useParams<{ houseSlug?: string }>();
  const houseSlug = params?.houseSlug;

  return (
    <PartnerErrorView
      error={error}
      reset={reset}
      title="Erreur de la couverture de livraison"
      description="Impossible de charger ou de modifier les quartiers desservis par votre pressing."
      houseSlug={houseSlug}
    />
  );
}
