"use client";

import { AdminErrorView } from "@/components/admin/admin-error-view";

interface AdminOrdersErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminOrdersError({
  error,
  reset,
}: AdminOrdersErrorProps) {
  return (
    <AdminErrorView
      error={error}
      reset={reset}
      title="Erreur du registre des commandes"
      description="Impossible de charger la liste globale des commandes et leurs états de traitement."
    />
  );
}
