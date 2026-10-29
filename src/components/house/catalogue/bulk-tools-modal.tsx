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
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto font-sans p-6 rounded-2xl bg-card border border-border space-y-4">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold">
            <SlidersHorizontal className="size-5 text-primary shrink-0" aria-hidden="true" />
            <DialogTitle className="text-base sm:text-lg font-bold text-heading font-display tracking-tight">
              {t("bulkTools")}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {t("bulkToolsDesc")}
          </DialogDescription>
        </DialogHeader>

        {/* Selection scope banner & explanation */}
        <div className="py-3 px-3.5 bg-muted/40 rounded-xl border border-border/60 flex flex-col gap-2 text-xs">
          <div className="flex items-center justify-between gap-2">
            <Badge variant="outline" className="font-mono text-[11px] px-2 py-0.5 rounded-md">
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
                className="text-primary hover:bg-primary/10 h-7 text-xs font-semibold px-2 rounded-lg cursor-pointer"
              >
                {t("selectAll")}
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onDeselectAllArticles}
                className="text-muted-foreground hover:text-foreground h-7 text-xs font-semibold px-2 rounded-lg cursor-pointer"
              >
                {t("deselectAll")}
              </Button>
            )}
          </div>
          <div className="flex items-start gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
            <Info className="size-3.5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
            <span>{t("bulkScopeTip")}</span>
          </div>
        </div>

        {/* Tool 1: Copy from service */}
        <div className="pt-1">
          <CopyServiceSection
            services={services}
            activeServiceId={activeServiceId}
            onCopyFromService={(srcId) => {
              onCopyFromService(srcId);
              onClose();
            }}
          />
        </div>

        <Separator className="bg-border/60" />

        {/* Tool 2: Price adjustments */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-bold text-heading font-display">
            {t("bulkAdjustSectionTitle")}
          </h4>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
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

        <Separator className="bg-border/60" />

        {/* Tool 3: Visibility & availability */}
        <div className="space-y-2.5">
          <div>
            <h4 className="text-xs font-bold text-heading font-display">
              {t("bulkStatusSectionTitle")}
            </h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
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
              className="flex-1 text-xs font-semibold rounded-lg text-success hover:bg-success-soft border-success/30 gap-1.5 h-10 sm:h-9 cursor-pointer"
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
              className="flex-1 text-xs font-semibold rounded-lg text-destructive hover:bg-destructive-soft border-destructive/30 gap-1.5 h-10 sm:h-9 cursor-pointer"
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
