"use client";

import { useTranslations } from "next-intl";
import { CustomerErrorView } from "@/components/customer/customer-error-view";

interface CartErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function CartError({ error, reset }: CartErrorProps) {
  const t = useTranslations("errors");

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <div className="h-18 border-b border-slate-200/80 bg-white" />
      <main className="flex-1 flex flex-col justify-center py-12 px-4">
        <CustomerErrorView
          error={error}
          reset={reset}
          title={t("cartTitle")}
          description={t("cartDesc")}
          showHousesLink={true}
        />
      </main>
    </div>
  );
}
