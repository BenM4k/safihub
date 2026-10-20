"use client";

import { LegalErrorCard } from "@/components/legal/legal-error-card";

interface PrivacyErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PrivacyError({ error, reset }: PrivacyErrorProps) {
  return (
    <LegalErrorCard
      error={error}
      reset={reset}
      documentTitle="Politique de Confidentialité"
    />
  );
}
