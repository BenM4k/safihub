"use client";

import { CustomerErrorView } from "@/components/customer/customer-error-view";

interface NotificationsErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function NotificationsError({
  error,
  reset,
}: NotificationsErrorProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <div className="h-18 border-b border-slate-200/80 bg-white" />
      <main className="flex-1 flex flex-col justify-center py-12 px-4">
        <CustomerErrorView
          error={error}
          reset={reset}
          title="Erreur lors de l'accès aux notifications"
          description="Impossible de charger vos alertes et notifications en temps réel. Veuillez réessayer."
          showHousesLink={false}
        />
      </main>
    </div>
  );
}
