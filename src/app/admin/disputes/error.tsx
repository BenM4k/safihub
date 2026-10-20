"use client";

import { AdminErrorView } from "@/components/admin/admin-error-view";

interface AdminDisputesErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminDisputesError({
  error,
  reset,
}: AdminDisputesErrorProps) {
  return (
    <AdminErrorView
      error={error}
      reset={reset}
      title="Erreur du registre des litiges"
      description="Impossible de charger la liste des contestations clients ou les informations de suivi des commandes."
    />
  );
}
