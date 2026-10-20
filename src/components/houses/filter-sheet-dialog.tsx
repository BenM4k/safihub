"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    dialogRef.current?.focus();
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="filter-sheet-title"
      ref={dialogRef}
      tabIndex={-1}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in outline-hidden"
    >
      <div className="w-full max-w-lg rounded-3xl bg-card border border-border shadow-2xl p-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <h3 id="filter-sheet-title" className="text-lg font-black text-heading tracking-tight">
            {t("allFilters")}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

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
      </div>
    </div>
  );
}
