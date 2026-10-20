"use client";

import { AdminErrorView } from "@/components/admin/admin-error-view";

interface AdminErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminError({ error, reset }: AdminErrorProps) {
  return (
    <AdminErrorView
      error={error}
      reset={reset}
      title="Erreur de la console d'opérations"
      description="Impossible de charger les métriques et les indicateurs opérationnels. Veuillez réessayer."
    />
  );
}
