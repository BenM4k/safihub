"use client";

import { AlertCircle, Check, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ProgressCard } from "./progress-card";
import { PricingFreezeNotice } from "./pricing-freeze-notice";
import type { CatalogueServiceTab } from "./types";

interface CatalogueHeaderProps {
  houseSlug: string;
  totalConfigured: number;
  totalPossible: number;
  services: CatalogueServiceTab[];
  activeServiceId: string;
  onSelectService: (serviceId: string) => void;
  saveSuccessMsg: string | null;
  errorMsg: string | null;
}

export function CatalogueHeader({
  houseSlug,
  totalConfigured,
  totalPossible,
  services,
  activeServiceId,
  onSelectService,
  saveSuccessMsg,
  errorMsg,
}: CatalogueHeaderProps) {
  const t = useTranslations("house.catalogue");

  return (
    <div className="space-y-7 sm:space-y-8">
      {/* View as customer link */}
      <div className="flex justify-end">
        <a
          href={`/houses/${houseSlug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1.5 px-2 py-1 transition"
        >
          <ExternalLink className="size-3.5" aria-hidden="true" />
          <span>{t("viewAsCustomer")}</span>
        </a>
      </div>

      <ProgressCard
        totalConfigured={totalConfigured}
        totalPossible={totalPossible}
        services={services}
        activeServiceId={activeServiceId}
        onSelectService={onSelectService}
      />

      <PricingFreezeNotice />

      {saveSuccessMsg && (
        <Alert className="bg-success-soft text-success border-success/30 text-xs py-2.5">
          <Check className="size-4 text-success" />
          <AlertDescription className="text-xs font-bold text-success">
            {saveSuccessMsg}
          </AlertDescription>
        </Alert>
      )}

      {errorMsg && (
        <Alert variant="destructive" className="bg-destructive-soft text-destructive border-destructive/30 text-xs py-2.5">
          <AlertCircle className="size-4 text-destructive" />
          <AlertDescription className="text-xs font-bold text-destructive">
            {errorMsg}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
