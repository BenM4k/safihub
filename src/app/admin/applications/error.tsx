"use client";

import { AdminErrorView } from "@/components/admin/admin-error-view";

interface AdminApplicationsErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminApplicationsError({
  error,
  reset,
}: AdminApplicationsErrorProps) {
  return (
    <AdminErrorView
      error={error}
      reset={reset}
      title="Erreur du registre des candidatures"
      description="Impossible de charger la liste des candidatures d'ateliers partenaires ou les filtres de statut."
    />
  );
}
