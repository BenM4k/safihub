"use client";

import { AlertCircle, Check, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
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
    <div className="space-y-6 sm:space-y-8">
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
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-950 dark:text-emerald-200 flex items-start gap-3">
          <Check className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
          <p className="text-xs font-bold">
            {saveSuccessMsg}
          </p>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive flex items-start gap-3">
          <AlertCircle className="size-4 shrink-0 text-destructive mt-0.5" />
          <p className="text-xs font-bold">
            {errorMsg}
          </p>
        </div>
      )}
    </div>
  );
}
