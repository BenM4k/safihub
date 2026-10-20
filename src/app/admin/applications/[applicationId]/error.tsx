"use client";

import { AdminErrorView } from "@/components/admin/admin-error-view";

interface AdminApplicationDetailErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminApplicationDetailError({
  error,
  reset,
}: AdminApplicationDetailErrorProps) {
  return (
    <AdminErrorView
      error={error}
      reset={reset}
      title="Erreur de la candidature partenaire"
      description="Impossible de charger le dossier complet du postulant ou le formulaire d'évaluation."
    />
  );
}
