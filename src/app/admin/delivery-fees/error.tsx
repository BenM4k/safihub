"use client";

import { useTranslations } from "next-intl";
import { AdminErrorView } from "@/components/admin/admin-error-view";

interface AdminDeliveryFeesErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminDeliveryFeesError({
  error,
  reset,
}: AdminDeliveryFeesErrorProps) {
  const t = useTranslations("admin.deliveryFees");

  return (
    <AdminErrorView
      error={error}
      reset={reset}
      title={t("errorTitle")}
      description={t("errorDescription")}
    />
  );
}
