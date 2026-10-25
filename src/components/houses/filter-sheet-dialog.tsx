"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FilterSheetSections } from "./filter-sheet-sections";
import type { NeighborhoodRecord } from "@/dal";

interface FilterSheetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  neighborhoods?: NeighborhoodRecord[];
  selectedNeighborhoodId?: string | null;
  onSelectNeighborhood?: (id: string | null) => void;
  selectedService: string | null;
  onSelectService: (slug: string | null) => void;
  availableServices: Array<{ slug: string; nameFr: string; nameSw: string }>;
  openNowOnly: boolean;
  onToggleOpenNow: () => void;
  maxTurnaround: number | null;
  onSelectTurnaround: (h: number | null) => void;
  maxMinOrder: number | null;
  onSelectMaxMinOrder: (amt: number | null) => void;
  onResetFilters: () => void;
}

export function FilterSheetDialog({
  isOpen,
  onClose,
  neighborhoods,
  selectedNeighborhoodId,
  onSelectNeighborhood,
  selectedService,
  onSelectService,
  availableServices,
  openNowOnly,
  onToggleOpenNow,
  maxTurnaround,
  onSelectTurnaround,
  maxMinOrder,
  onSelectMaxMinOrder,
  onResetFilters,
}: FilterSheetDialogProps) {
  const t = useTranslations("customerHouses");

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => { if (!open) onClose(); }}>
      <DialogContent className="w-full max-w-lg rounded-3xl bg-card border border-border shadow-2xl p-6 flex flex-col max-h-[90vh]">
        <DialogHeader className="pb-4 border-b border-border text-left">
          <DialogTitle className="text-lg font-black text-heading tracking-tight">
            {t("allFilters")}
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable Filters Body */}
        <FilterSheetSections
          neighborhoods={neighborhoods}
          selectedNeighborhoodId={selectedNeighborhoodId}
          onSelectNeighborhood={onSelectNeighborhood}
          selectedService={selectedService}
          onSelectService={onSelectService}
          availableServices={availableServices}
          openNowOnly={openNowOnly}
          onToggleOpenNow={onToggleOpenNow}
          maxTurnaround={maxTurnaround}
          onSelectTurnaround={onSelectTurnaround}
          maxMinOrder={maxMinOrder}
          onSelectMaxMinOrder={onSelectMaxMinOrder}
        />

        {/* Footer Actions */}
        <div className="pt-4 border-t border-border flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="text-xs font-bold text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
          >
            {t("clearFilters")}
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onClose}
            className="px-6 rounded-xl font-bold text-xs cursor-pointer"
          >
            {t("viewList")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
