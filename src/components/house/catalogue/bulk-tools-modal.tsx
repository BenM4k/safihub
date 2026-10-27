"use client";

import { useTranslations } from "next-intl";
import { CheckCircle2, EyeOff, Info, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto font-sans p-6">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold">
            <SlidersHorizontal className="size-5" aria-hidden="true" />
            <DialogTitle className="text-base font-bold text-heading font-display">
              {t("bulkTools")}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            {t("bulkToolsDesc")}
          </DialogDescription>
        </DialogHeader>

        {/* Selection scope banner & explanation (non-card flat strip) */}
        <div className="py-2.5 px-3 bg-muted/40 rounded-xl flex flex-col gap-1.5 text-xs mt-1">
          <div className="flex items-center justify-between gap-2">
            <Badge variant="outline" className="font-mono text-[11px] px-2 py-0.5">
              {selectedArticlesCount > 0
                ? t("selectionCount", { count: selectedArticlesCount })
                : t("allActiveServiceArticles", { count: totalFilteredArticlesCount })}
            </Badge>
            {selectedArticlesCount < totalFilteredArticlesCount ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onSelectAllArticles}
                className="text-primary hover:bg-primary/10 h-6 text-xs font-semibold px-2"
              >
                {t("selectAll")}
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onDeselectAllArticles}
                className="text-muted-foreground hover:text-foreground h-6 text-xs font-semibold px-2"
              >
                {t("deselectAll")}
              </Button>
            )}
          </div>
          <div className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
            <Info className="size-3.5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
            <span>{t("bulkScopeTip")}</span>
          </div>
        </div>

        {/* Tool 1: Copy from service */}
        <div className="pt-2">
          <CopyServiceSection
            services={services}
            activeServiceId={activeServiceId}
            onCopyFromService={(srcId) => {
              onCopyFromService(srcId);
              onClose();
            }}
          />
        </div>

        <Separator />

        {/* Tool 2: Price adjustments */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-bold text-heading font-display">
            {t("bulkAdjustSectionTitle")}
          </h4>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {t("bulkAdjustSectionDesc")}
          </p>
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
        </div>

        <Separator />

        {/* Tool 3: Visibility & availability */}
        <div className="space-y-2.5">
          <div>
            <h4 className="text-xs font-bold text-heading font-display">
              {t("bulkStatusSectionTitle")}
            </h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {t("bulkStatusSectionDesc")}
            </p>
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onToggleOffered(true);
                onClose();
              }}
              className="flex-1 text-xs font-semibold rounded-xl text-success hover:bg-success-soft border-success/30 gap-1.5 h-10 sm:h-9"
            >
              <CheckCircle2 className="size-3.5" />
              <span>{t("bulkOffer")}</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onToggleOffered(false);
                onClose();
              }}
              className="flex-1 text-xs font-semibold rounded-xl text-destructive hover:bg-destructive-soft border-destructive/30 gap-1.5 h-10 sm:h-9"
            >
              <EyeOff className="size-3.5" />
              <span>{t("bulkRetire")}</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
