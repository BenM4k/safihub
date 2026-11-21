"use client";

import dynamic from "next/dynamic";
import { useState, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { HouseCatalogueItemRecord } from "@/dal";
import { EmptyState } from "@/components/admin/shared/empty-state";
import { buildCatalogueStructure, getTargetCatalogueCells } from "./catalogue-helpers";
import { useCatalogueState } from "./use-catalogue-state";
import { useCatalogueFilter } from "./use-catalogue-filter";
import { CatalogueHeader } from "./catalogue-header";
import { ServiceTabsBar } from "./service-tabs-bar";
import { CatalogueToolbar } from "./catalogue-toolbar";
import { DesktopPricingGrid } from "./desktop-pricing-grid";
import { MobileArticleAccordion } from "./mobile-article-accordion";
import { StickySaveBar } from "./sticky-save-bar";

const SaveConfirmDialog = dynamic(
  () => import("./save-confirm-dialog").then((m) => m.SaveConfirmDialog),
  { ssr: false }
);

const BulkToolsModal = dynamic(
  () => import("./bulk-tools-modal").then((m) => m.BulkToolsModal),
  { ssr: false }
);

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
    pendingServiceId,
    pendingService,
    isServicePending,
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
    <div className="space-y-6 sm:space-y-8 font-sans">
      <CatalogueHeader
        houseSlug={houseSlug}
        totalConfigured={totalConfigured}
        totalPossible={totalPossible}
        saveSuccessMsg={saveSuccessMsg}
        errorMsg={errorMsg}
      />

      <div className="space-y-4">
        <ServiceTabsBar
          services={services}
          activeServiceId={activeServiceId}
          pendingServiceId={pendingServiceId}
          onSelectService={handleSelectService}
        />

        <CatalogueToolbar
          filters={filters}
          onFilterChange={setFilters}
          categories={currentCategoryGroups}
          selectedArticlesCount={selectedArticleIds.size}
          totalFilteredCount={totalFilteredArticles}
          onOpenBulkTools={() => setShowBulkModal(true)}
        />

        <div className="relative" aria-busy={isServicePending}>
          {isServicePending && (
            <div
              role="status"
              aria-live="polite"
              className="mb-3 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-primary-soft/80 border border-primary/25 text-primary text-xs font-bold animate-in fade-in duration-150"
            >
              <Loader2 className="size-4 animate-spin shrink-0" aria-hidden="true" />
              <span>
                {t("switchingService", {
                  service: pendingService?.nameFr ?? "",
                })}
              </span>
            </div>
          )}

          <div
            key={activeServiceId}
            className={`transition-opacity duration-200 ${
              isServicePending
                ? "opacity-50 pointer-events-none"
                : "animate-in fade-in duration-200"
            }`}
          >
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
          </div>
        </div>
      </div>

      <StickySaveBar
        dirtyCount={diffs.length}
        isSaving={isPending}
        onCancel={handleReset}
        onSave={() => setShowConfirmModal(true)}
      />

      {showConfirmModal && (
        <SaveConfirmDialog
          isOpen={showConfirmModal}
          diffs={diffs}
          isSaving={isPending}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={() => handleBatchSave(() => setShowConfirmModal(false))}
        />
      )}

      {showBulkModal && (
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
      )}
    </div>
  );
}
