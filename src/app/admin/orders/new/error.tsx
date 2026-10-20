"use client";

import { AdminErrorView } from "@/components/admin/admin-error-view";

interface AdminNewOrderErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminNewOrderError({
  error,
  reset,
}: AdminNewOrderErrorProps) {
  return (
    <AdminErrorView
      error={error}
      reset={reset}
      title="Erreur du formulaire de commande manuelle"
      description="Impossible de charger les pressings actifs, le catalogue ou les quartiers éligibles."
    />
  );
}
