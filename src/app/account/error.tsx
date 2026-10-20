"use client";

import { CustomerErrorView } from "@/components/customer/customer-error-view";

interface AccountErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AccountError({ error, reset }: AccountErrorProps) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <div className="h-18 border-b border-slate-200/80 bg-white" />
      <main className="flex-1 flex flex-col justify-center py-12 px-4">
        <CustomerErrorView
          error={error}
          reset={reset}
          title="Erreur lors de l'accès à votre compte"
          description="Impossible de charger votre profil et vos adresses de livraison. Veuillez réessayer."
          showHousesLink={false}
        />
      </main>
    </div>
  );
}
