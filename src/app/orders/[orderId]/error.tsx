"use client";

import { CustomerErrorView } from "@/components/customer/customer-error-view";

interface OrderDetailErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function OrderDetailError({
  error,
  reset,
}: OrderDetailErrorProps) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <div className="h-18 border-b border-slate-200/80 bg-white" />
      <main className="flex-1 flex flex-col justify-center py-12 px-4">
        <CustomerErrorView
          error={error}
          reset={reset}
          title="Erreur lors du suivi de votre commande"
          description="Impossible de charger les détails et l'avancement de cette commande. Veuillez réessayer."
          showHousesLink={false}
        />
      </main>
    </div>
  );
}
