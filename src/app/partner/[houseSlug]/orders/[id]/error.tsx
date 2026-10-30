"use client";

import { useParams } from "next/navigation";
import { PartnerErrorView } from "@/components/house/partner-error-view";

interface PartnerOrderDetailErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PartnerOrderDetailError({
  error,
  reset,
}: PartnerOrderDetailErrorProps) {
  const params = useParams<{ houseSlug?: string }>();
  const houseSlug = params?.houseSlug;

  return (
    <PartnerErrorView
      error={error}
      reset={reset}
      title="Erreur lors du chargement de la commande"
      description="Impossible d'afficher les détails ou les pièces de cette commande."
      houseSlug={houseSlug}
    />
  );
}
