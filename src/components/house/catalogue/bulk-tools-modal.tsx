"use client";

import { useTranslations } from "next-intl";
import { X, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CatalogueServiceTab } from "./types";
import { CopyServiceSection } from "./copy-service-section";
import { PricingAdjustSection } from "./pricing-adjust-section";

interface BulkToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: CatalogueServiceTab[];
  activeServiceId: string;
  selectedArticlesCount: number;
  totalFilteredArticlesCount: number;
  onCopyFromService: (sourceServiceId: string) => void;
  onAdjustPercentage: (percent: number) => void;
  onSetFixedPrice: (price: number) => void;
  onToggleOffered: (offer: boolean) => void;
  onSelectAllArticles: () => void;
  onDeselectAllArticles: () => void;
}

export function BulkToolsModal({
  isOpen,
  onClose,
  services,
  activeServiceId,
  selectedArticlesCount,
  totalFilteredArticlesCount,
  onCopyFromService,
  onAdjustPercentage,
  onSetFixedPrice,
  onToggleOffered,
  onSelectAllArticles,
  onDeselectAllArticles,
}: BulkToolsModalProps) {
  const t = useTranslations("house.catalogue");

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="bulk-dialog-title"
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
    >
      <div className="bg-card w-full max-w-lg rounded-2xl border border-border p-5 sm:p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
          <div className="flex items-center gap-2 text-primary font-bold">
            <SlidersHorizontal className="size-5" aria-hidden="true" />
            <h3 id="bulk-dialog-title" className="text-sm sm:text-base font-bold text-heading font-display">
              {t("bulkTools")}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-heading p-1 rounded-lg"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Selection helper bar */}
        <div className="p-3 bg-surface rounded-xl border border-border flex items-center justify-between text-xs">
          <span className="font-semibold text-heading">
            {selectedArticlesCount > 0
              ? t("selectionCount", { count: selectedArticlesCount })
              : t("allActiveServiceArticles", { count: totalFilteredArticlesCount })}
          </span>
          <div className="flex items-center gap-2">
            {selectedArticlesCount < totalFilteredArticlesCount ? (
              <button
                type="button"
                onClick={onSelectAllArticles}
                className="text-primary hover:underline font-semibold text-[11px]"
              >
                {t("selectAll")}
              </button>
            ) : (
              <button
                type="button"
                onClick={onDeselectAllArticles}
                className="text-muted-foreground hover:underline font-semibold text-[11px]"
              >
                {t("deselectAll")}
              </button>
            )}
          </div>
        </div>

        {/* Tool 1: Copy from service */}
        <CopyServiceSection
          services={services}
          activeServiceId={activeServiceId}
          onCopyFromService={(srcId) => {
            onCopyFromService(srcId);
            onClose();
          }}
        />

        {/* Tool 2 & 3: Percentage and Fixed Price */}
        <PricingAdjustSection
          onAdjustPercentage={(pct) => {
            onAdjustPercentage(pct);
            onClose();
          }}
          onSetFixedPrice={(px) => {
            onSetFixedPrice(px);
            onClose();
          }}
        />

        {/* Tool 4: Bulk offer / retire */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-border">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              onToggleOffered(true);
              onClose();
            }}
            className="flex-1 text-xs font-semibold rounded-xl text-success-base hover:bg-success-light border-success-base/30"
          >
            {t("bulkOffer")}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              onToggleOffered(false);
              onClose();
            }}
            className="flex-1 text-xs font-semibold rounded-xl text-destructive hover:bg-destructive-light border-destructive/30"
          >
            {t("bulkRetire")}
          </Button>
        </div>
      </div>
    </div>
  );
}
