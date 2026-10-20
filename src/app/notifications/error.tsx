"use client";

import { useTranslations } from "next-intl";
import { CustomerErrorView } from "@/components/customer/customer-error-view";

interface NotificationsErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function NotificationsError({
  error,
  reset,
}: NotificationsErrorProps) {
  const t = useTranslations("errors");

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <div className="h-18 border-b border-slate-200/80 bg-white" />
      <main className="flex-1 flex flex-col justify-center py-12 px-4">
        <CustomerErrorView
          error={error}
          reset={reset}
          title={t("notificationsTitle")}
          description={t("notificationsDesc")}
          showHousesLink={false}
        />
      </main>
    </div>
  );
}
