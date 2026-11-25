"use client";

import { useTranslations } from "next-intl";
import { AdminErrorView } from "@/components/admin/admin-error-view";

interface AdminNeighborhoodsErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminNeighborhoodsError({
  error,
  reset,
}: AdminNeighborhoodsErrorProps) {
  const t = useTranslations("admin.neighborhoods");

  return (
    <AdminErrorView
      error={error}
      reset={reset}
      title={t("errorTitle")}
      description={t("errorDescription")}
    />
  );
}
