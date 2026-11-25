"use client";

import { useTranslations } from "next-intl";
import { AdminErrorView } from "@/components/admin/admin-error-view";

interface AdminCatalogueErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminCatalogueError({
  error,
  reset,
}: AdminCatalogueErrorProps) {
  const t = useTranslations("admin.catalogue");

  return (
    <AdminErrorView
      error={error}
      reset={reset}
      title={t("errorTitle")}
      description={t("errorDescription")}
    />
  );
}
