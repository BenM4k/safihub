"use client";

import { use } from "react";
import { PartnerErrorView } from "@/components/house/partner-error-view";

interface PartnerOrderDetailErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
  params: Promise<{ houseSlug: string; id: string }>;
}

export default function PartnerOrderDetailError({
  error,
  reset,
  params,
}: PartnerOrderDetailErrorProps) {
  const { houseSlug } = use(params);

  return (
    <PartnerErrorView
      error={error}
      reset={reset}
      title="Erreur lors du suivi de commande pressing"
      description="Impossible de charger les détails ou le protocole de réception de cette commande."
      houseSlug={houseSlug}
    />
  );
}
