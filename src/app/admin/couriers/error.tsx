"use client";

import { AdminErrorView } from "@/components/admin/admin-error-view";

interface AdminCouriersErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminCouriersError({
  error,
  reset,
}: AdminCouriersErrorProps) {
  return (
    <AdminErrorView
      error={error}
      reset={reset}
      title="Erreur de la flotte de coursiers"
      description="Impossible de charger les données de la flotte des coursiers ou le formulaire d'enrôlement."
    />
  );
}
