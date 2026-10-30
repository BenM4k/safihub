"use client";

import { useParams } from "next/navigation";
import { PartnerErrorView } from "@/components/house/partner-error-view";

interface PartnerCatalogueErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PartnerCatalogueError({
  error,
  reset,
}: PartnerCatalogueErrorProps) {
  const params = useParams<{ houseSlug?: string }>();
  const houseSlug = params?.houseSlug;

  return (
    <PartnerErrorView
      error={error}
      reset={reset}
      title="Erreur du catalogue des prestations"
      description="Impossible de charger ou de modifier les tarifs de votre pressing."
      houseSlug={houseSlug}
    />
  );
}
