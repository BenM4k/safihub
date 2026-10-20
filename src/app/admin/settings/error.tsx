"use client";

import { AdminErrorView } from "@/components/admin/admin-error-view";

interface AdminSettingsErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminSettingsError({
  error,
  reset,
}: AdminSettingsErrorProps) {
  return (
    <AdminErrorView
      error={error}
      reset={reset}
      title="Erreur des paramètres de la plateforme"
      description="Impossible de charger les paramètres opérationnels globaux, les taux de change ou les utilitaires d'export."
    />
  );
}
