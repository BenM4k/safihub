"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { ExternalLink, Check, AlertCircle } from "lucide-react";
import type { HouseCatalogueItemRecord } from "@/dal";
import { EmptyState } from "@/components/admin/shared/empty-state";
import { buildCatalogueStructure } from "./catalogue-helpers";
import { useCatalogueState } from "./use-catalogue-state";
import { useCatalogueFilter } from "./use-catalogue-filter";
import { ProgressCard } from "./progress-card";
import { PricingFreezeNotice } from "./pricing-freeze-notice";
import { CatalogueToolbar } from "./catalogue-toolbar";
import { DesktopPricingGrid } from "./desktop-pricing-grid";
import { MobileArticleAccordion } from "./mobile-article-accordion";
import { StickySaveBar } from "./sticky-save-bar";
import { SaveConfirmDialog } from "./save-confirm-dialog";
import { BulkToolsModal } from "./bulk-tools-modal";

interface CatalogueViewProps {
  items: HouseCatalogueItemRecord[];
  houseId: string;
  houseSlug: string;
  commissionBps?: number | null;
}

export function CatalogueView({
  items,
  houseId,
  houseSlug,
  commissionBps,
}: CatalogueViewProps) {
  const t = useTranslations("house.catalogue");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);

  const {
    edits,
    diffs,
    selectedArticleIds,
    isPending,
    errorMsg,
    saveSuccessMsg,
    handleCellChange,
    handleToggleArticleSelect,
    handleApplyPriceToAllFabrics,
    handleBatchSave,
    handleReset,
    copyServicePrices,
    adjustPercentage,
    setFixedPrice,
    toggleOffered,
    setSelectedArticleIds,
  } = useCatalogueState({ items, houseId });

  // Compute structure from items
  const { services, materials, categoriesByService, totalConfigured, totalPossible } =
    useMemo(() => buildCatalogueStructure(items, t), [items, t]);

  // Filtering and active service URL sync
  const {
    activeServiceId,
    handleSelectService,
    filters,
    setFilters,
    currentCategoryGroups,
    filteredCategoryGroups,
    totalFilteredArticles,
  } = useCatalogueFilter(services, categoriesByService, edits);

  function getTargetCells(): HouseCatalogueItemRecord[] {
    const activeItems = items.filter((i) => i.serviceId === activeServiceId);
    if (selectedArticleIds.size === 0) return activeItems;
    return activeItems.filter((i) => selectedArticleIds.has(i.itemId));
  }

  return (
    <div className="space-y-6 pb-24">
      {/* View as customer link */}
      <div className="flex justify-end">
        <a
          href={`/houses/${houseSlug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1.5 bg-card px-3 py-1.5 rounded-xl border border-border shadow-2xs"
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
        onSelectService={handleSelectService}
      />

      <PricingFreezeNotice />

      {saveSuccessMsg && (
        <div className="p-3 bg-success-light text-success-base text-xs font-bold rounded-xl border border-success-base/20 flex items-center gap-2">
          <Check className="size-4 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-destructive-light text-destructive text-xs font-bold rounded-xl border border-destructive/20 flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <CatalogueToolbar
        filters={filters}
        onFilterChange={setFilters}
        categories={currentCategoryGroups}
        selectedArticlesCount={selectedArticleIds.size}
        totalFilteredCount={totalFilteredArticles}
        onOpenBulkTools={() => setShowBulkModal(true)}
      />

      {filteredCategoryGroups.length === 0 ? (
        <EmptyState
          title={t("emptyFilter")}
          description="Essayez de modifier votre recherche ou de réinitialiser vos filtres."
        />
      ) : (
        <>
          <DesktopPricingGrid
            categories={filteredCategoryGroups}
            materials={materials}
            edits={edits}
            commissionBps={commissionBps}
            selectedArticleIds={selectedArticleIds}
            onToggleArticleSelect={handleToggleArticleSelect}
            onCellChange={handleCellChange}
            onApplyPriceToAllFabrics={handleApplyPriceToAllFabrics}
          />

          <MobileArticleAccordion
            categories={filteredCategoryGroups}
            materials={materials}
            edits={edits}
            commissionBps={commissionBps}
            selectedArticleIds={selectedArticleIds}
            onToggleArticleSelect={handleToggleArticleSelect}
            onCellChange={handleCellChange}
            onApplyPriceToAllFabrics={handleApplyPriceToAllFabrics}
          />
        </>
      )}

      <StickySaveBar
        dirtyCount={diffs.length}
        isSaving={isPending}
        onCancel={handleReset}
        onSave={() => setShowConfirmModal(true)}
      />

      <SaveConfirmDialog
        isOpen={showConfirmModal}
        diffs={diffs}
        isSaving={isPending}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={() => handleBatchSave(() => setShowConfirmModal(false))}
      />

      <BulkToolsModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        services={services}
        activeServiceId={activeServiceId}
        selectedArticlesCount={selectedArticleIds.size}
        totalFilteredArticlesCount={totalFilteredArticles}
        onCopyFromService={(srcId) => copyServicePrices(srcId, activeServiceId)}
        onAdjustPercentage={(pct) => adjustPercentage(getTargetCells(), pct)}
        onSetFixedPrice={(px) => setFixedPrice(getTargetCells(), px)}
        onToggleOffered={(offer) => toggleOffered(getTargetCells(), offer)}
        onSelectAllArticles={() => {
          const allIds = new Set<string>();
          for (const cat of filteredCategoryGroups) {
            for (const art of cat.articles) allIds.add(art.id);
          }
          setSelectedArticleIds(allIds);
        }}
        onDeselectAllArticles={() => setSelectedArticleIds(new Set())}
      />
    </div>
  );
}
