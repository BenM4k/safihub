"use client";

import { AdminErrorView } from "@/components/admin/admin-error-view";

interface AdminNeighborhoodsErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminNeighborhoodsError({
  error,
  reset,
}: AdminNeighborhoodsErrorProps) {
  return (
    <AdminErrorView
      error={error}
      reset={reset}
      title="Erreur du registre des quartiers"
      description="Impossible de charger la cartographie des quartiers urbains et leurs assignations de zones."
    />
  );
}
