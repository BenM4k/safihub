"use client";

import { AdminErrorView } from "@/components/admin/admin-error-view";

interface AdminDeliveryFeesErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminDeliveryFeesError({
  error,
  reset,
}: AdminDeliveryFeesErrorProps) {
  return (
    <AdminErrorView
      error={error}
      reset={reset}
      title="Erreur des tarifs de livraison"
      description="Impossible de charger la matrice des frais interzones ou le formulaire de tarification."
    />
  );
}
