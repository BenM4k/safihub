"use client";

import { AdminErrorView } from "@/components/admin/admin-error-view";

interface AdminCourierDetailErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminCourierDetailError({
  error,
  reset,
}: AdminCourierDetailErrorProps) {
  return (
    <AdminErrorView
      error={error}
      reset={reset}
      title="Erreur de profil coursier"
      description="Impossible de charger les détails, créneaux ou zones d'intervention de ce coursier."
    />
  );
}
