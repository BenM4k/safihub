"use client";

import { CourierErrorView } from "@/components/courier/courier-error-view";

interface CourierGroupErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function CourierGroupError({
  error,
  reset,
}: CourierGroupErrorProps) {
  return (
    <CourierErrorView
      error={error}
      reset={reset}
      title="Erreur de l'application coursier"
      description="Une anomalie s'est produite dans l'interface coursier. Vos données locales sont préservées."
    />
  );
}
