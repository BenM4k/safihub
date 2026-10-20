"use client";

import { LegalErrorCard } from "@/components/legal/legal-error-card";

interface SecurityErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function SecurityError({ error, reset }: SecurityErrorProps) {
  return (
    <LegalErrorCard
      error={error}
      reset={reset}
      documentTitle="Sécurité & Données"
    />
  );
}
