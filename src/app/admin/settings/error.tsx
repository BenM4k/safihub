"use client";

import { useTranslations } from "next-intl";
import { AdminErrorView } from "@/components/admin/admin-error-view";

interface AdminSettingsErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminSettingsError({
  error,
  reset,
}: AdminSettingsErrorProps) {
  const t = useTranslations("admin.settings");

  return (
    <AdminErrorView
      error={error}
      reset={reset}
      title={t("errorTitle")}
      description={t("errorDescription")}
    />
  );
}
