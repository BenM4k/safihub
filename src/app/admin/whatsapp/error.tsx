"use client";

import { useTranslations } from "next-intl";
import { AdminErrorView } from "@/components/admin/admin-error-view";

interface AdminWhatsAppErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminWhatsAppError({
  error,
  reset,
}: AdminWhatsAppErrorProps) {
  const t = useTranslations("admin.whatsapp");

  return (
    <AdminErrorView
      error={error}
      reset={reset}
      title={t("errorTitle")}
      description={t("errorDescription")}
    />
  );
}
