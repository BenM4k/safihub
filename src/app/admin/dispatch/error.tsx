"use client";

import { AdminErrorView } from "@/components/admin/admin-error-view";

interface AdminDispatchErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminDispatchError({
  error,
  reset,
}: AdminDispatchErrorProps) {
  return (
    <AdminErrorView
      error={error}
      reset={reset}
      title="Erreur de la console de dispatching"
      description="Impossible de charger les missions en attente d'assignation ou la localisation de la flotte de coursiers."
    />
  );
}
