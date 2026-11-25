"use client";

import { useTranslations } from "next-intl";
import { AdminErrorView } from "@/components/admin/admin-error-view";

interface AdminCoverageErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminCoverageError({
  error,
  reset,
}: AdminCoverageErrorProps) {
  const t = useTranslations("admin.coverage");

  return (
    <AdminErrorView
      error={error}
      reset={reset}
      title={t("errorTitle")}
      description={t("errorDescription")}
    />
  );
}
