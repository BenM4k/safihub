"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import type { HouseCatalogueItemRecord } from "@/dal";
import { EmptyState } from "@/components/admin/shared/empty-state";
import { buildCatalogueStructure, getTargetCatalogueCells } from "./catalogue-helpers";
import { useCatalogueState } from "./use-catalogue-state";
import { useCatalogueFilter } from "./use-catalogue-filter";
import { CatalogueHeader } from "./catalogue-header";
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
    handleSelectService: setFilterService,
    filters,
    setFilters,
    currentCategoryGroups,
    filteredCategoryGroups,
    totalFilteredArticles,
  } = useCatalogueFilter(services, categoriesByService, edits);

  function handleSelectService(serviceId: string) {
    setSelectedArticleIds(new Set());
    setFilterService(serviceId);
  }

  function getTargetCells(): HouseCatalogueItemRecord[] {
    return getTargetCatalogueCells(
      items,
      activeServiceId,
      selectedArticleIds,
      filteredCategoryGroups
    );
  }

  return (
    <div className="space-y-6 pb-24 font-sans">
      <CatalogueHeader
        houseSlug={houseSlug}
        totalConfigured={totalConfigured}
        totalPossible={totalPossible}
        services={services}
        activeServiceId={activeServiceId}
        onSelectService={handleSelectService}
        saveSuccessMsg={saveSuccessMsg}
        errorMsg={errorMsg}
      />

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
          description={t("emptyFilterDesc")}
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
          filteredCategoryGroups.forEach((cat) => cat.articles.forEach((a) => allIds.add(a.id)));
          setSelectedArticleIds(allIds);
        }}
        onDeselectAllArticles={() => setSelectedArticleIds(new Set())}
      />
    </div>
  );
}
