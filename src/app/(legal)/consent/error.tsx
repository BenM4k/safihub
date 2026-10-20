"use client";

import { LegalErrorCard } from "@/components/legal/legal-error-card";

interface ConsentErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ConsentError({ error, reset }: ConsentErrorProps) {
  return (
    <LegalErrorCard
      error={error}
      reset={reset}
      documentTitle="Consentement Photos"
    />
  );
}
