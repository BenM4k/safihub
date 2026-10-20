"use client";

import { AdminErrorView } from "@/components/admin/admin-error-view";

interface AdminCatalogueErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminCatalogueError({
  error,
  reset,
}: AdminCatalogueErrorProps) {
  return (
    <AdminErrorView
      error={error}
      reset={reset}
      title="Erreur du catalogue maître"
      description="Impossible d'accéder au référentiel des articles, tissus et services de blanchisserie."
    />
  );
}
