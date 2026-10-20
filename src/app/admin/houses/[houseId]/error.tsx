"use client";

import { AdminErrorView } from "@/components/admin/admin-error-view";

interface AdminHouseDetailErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminHouseDetailError({
  error,
  reset,
}: AdminHouseDetailErrorProps) {
  return (
    <AdminErrorView
      error={error}
      reset={reset}
      title="Erreur de chargement du pressing"
      description="Impossible d'accéder aux informations détaillées ou à la configuration de cet atelier partenaire."
    />
  );
}
