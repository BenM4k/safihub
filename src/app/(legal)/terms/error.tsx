"use client";

import { LegalErrorCard } from "@/components/legal/legal-error-card";

interface TermsErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function TermsError({ error, reset }: TermsErrorProps) {
  return (
    <LegalErrorCard
      error={error}
      reset={reset}
      documentTitle="Conditions Générales"
    />
  );
}
