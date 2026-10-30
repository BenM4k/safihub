"use client";

import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { PartnerErrorView } from "@/components/house/partner-error-view";

interface PartnerCatalogueErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PartnerCatalogueError({
  error,
  reset,
}: PartnerCatalogueErrorProps) {
  const t = useTranslations("house.catalogue");
  const params = useParams<{ houseSlug?: string }>();
  const houseSlug = params?.houseSlug;

  return (
    <PartnerErrorView
      error={error}
      reset={reset}
      title={t("errorTitle")}
      description={t("errorDescription")}
      houseSlug={houseSlug}
    />
  );
}
