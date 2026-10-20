"use client";

import { AdminErrorView } from "@/components/admin/admin-error-view";

interface AdminOrderDetailErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminOrderDetailError({
  error,
  reset,
}: AdminOrderDetailErrorProps) {
  return (
    <AdminErrorView
      error={error}
      reset={reset}
      title="Erreur lors de l'accès au dossier de commande"
      description="Impossible de charger les détails, les pièces déclarées ou le journal des transitions d'état."
    />
  );
}
