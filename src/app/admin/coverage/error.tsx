"use client";

import { AdminErrorView } from "@/components/admin/admin-error-view";

interface AdminCoverageErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminCoverageError({
  error,
  reset,
}: AdminCoverageErrorProps) {
  return (
    <AdminErrorView
      error={error}
      reset={reset}
      title="Erreur de la couverture géographique"
      description="Impossible de charger les paramètres de distance et l'état des zones de livraison."
    />
  );
}
