"use client";

import { CustomerErrorView } from "@/components/customer/customer-error-view";

interface PartnerApplyErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PartnerApplyError({
  error,
  reset,
}: PartnerApplyErrorProps) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <div className="h-18 border-b border-slate-200/80 bg-white" />
      <main className="flex-1 flex flex-col justify-center py-12 px-4">
        <CustomerErrorView
          error={error}
          reset={reset}
          title="Erreur lors de la candidature partenaire"
          description="Impossible de charger le formulaire de partenariat. Veuillez réessayer ou contacter le support SafiHub."
          showHousesLink={false}
        />
      </main>
    </div>
  );
}
