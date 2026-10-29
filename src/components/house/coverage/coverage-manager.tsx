"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle, Check, RotateCcw } from "lucide-react";
import type { HouseCoverageWithLimitsData } from "@/dal";
import { EmptyState } from "@/components/admin/shared/empty-state";
import { Button } from "@/components/ui/button";
import { CoverageHeader } from "./coverage-header";
import { DeliveryPerimeterCard } from "./delivery-perimeter-card";
import { CoverageFilterBar } from "./coverage-filter-bar";
import { CommuneGroupCard } from "./commune-group-card";
import { CoverageSaveBar } from "./coverage-save-bar";
import { DeselectImpactDialog } from "./deselect-impact-dialog";
import { ZeroCoverageDialog } from "./zero-coverage-dialog";
import { CoverageExtensionTicketDialog } from "./coverage-extension-ticket-dialog";
import { useCoverageState } from "./use-coverage-state";
import { useCoverageFilters } from "./use-coverage-filters";

interface CoverageManagerProps {
  coverageData: HouseCoverageWithLimitsData;
}

export function CoverageManager({ coverageData }: CoverageManagerProps) {
  const t = useTranslations("house.coverage");
  const [isExtensionDialogOpen, setIsExtensionDialogOpen] = useState(false);

  const {
    coveredMap,
    diffs,
    dirtyIds,
    totalCoveredCount,
    isSaving,
    errorMsg,
    saveSuccessMsg,
    impactTarget,
    showZeroModal,
    setShowZeroModal,
    handleToggle,
    confirmImpactDeselect,
    cancelImpactDeselect,
    handleGroupToggle,
    getGroupTriState,
    handleReset,
    triggerSave,
  } = useCoverageState({
    items: coverageData.items,
    houseId: coverageData.houseId,
  });

  const {
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    groupedZones,
    filterCounts,
  } = useCoverageFilters({
    items: coverageData.items,
    coveredMap,
  });

  return (
    <div className="space-y-6">
      {/* 1. Header with live count */}
      <CoverageHeader
        coveredCount={totalCoveredCount}
        totalCount={coverageData.items.length}
      />

      {/* 2. Perimeter Information Card */}
      <DeliveryPerimeterCard
        effectiveMaxDistance={coverageData.effectiveMaxDistanceLevel}
        houseName={coverageData.houseName}
        onRequestExtension={() => setIsExtensionDialogOpen(true)}
      />

      {/* Success Banner */}
      {saveSuccessMsg && (
        <div className="rounded-xl border border-success/30 bg-success-soft/30 p-3 text-xs font-bold text-success flex items-center gap-2">
          <Check className="size-4 text-success shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Error Banner with Retry */}
      {errorMsg && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs font-semibold text-destructive flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 text-destructive shrink-0" />
            <span>{errorMsg}</span>
          </div>
          {diffs.length > 0 && (
            <Button
              type="button"
              size="sm"
              variant="destructive"
              disabled={isSaving}
              onClick={() => triggerSave()}
              className="h-8 text-xs font-bold gap-1 px-3 rounded-lg cursor-pointer"
            >
              <RotateCcw className="size-3" aria-hidden="true" />
              <span>{t("retry")}</span>
            </Button>
          )}
        </div>
      )}

      {/* 3. Filter Bar */}
      {coverageData.items.length > 0 && (
        <CoverageFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterStatus={filterStatus}
          onFilterStatusChange={setFilterStatus}
          counts={filterCounts}
        />
      )}

      {/* 4. Groups or Empty State */}
      {coverageData.items.length === 0 ? (
        <EmptyState
          title={t("emptyStateTitle")}
          description={t("emptyStateDesc")}
        />
      ) : groupedZones.length === 0 ? (
        <EmptyState
          title={t("noResultsTitle")}
          description={t("noFilterResults")}
        />
      ) : (
        <div className="space-y-4">
          {groupedZones.map(([zoneName, zoneItems]) => (
            <CommuneGroupCard
              key={zoneName}
              zoneName={zoneName}
              items={zoneItems}
              coveredMap={coveredMap}
              dirtyIds={dirtyIds}
              disabled={isSaving}
              effectiveMaxDistance={coverageData.effectiveMaxDistanceLevel}
              triState={getGroupTriState(zoneItems)}
              onToggleQuartier={handleToggle}
              onToggleGroup={handleGroupToggle}
            />
          ))}
        </div>
      )}

      {/* 5. Sticky Save Bar */}
      <CoverageSaveBar
        dirtyCount={diffs.length}
        isSaving={isSaving}
        onCancel={handleReset}
        onSave={() => triggerSave(false)}
      />

      {/* 6. Active Orders Safeguard Dialog */}
      <DeselectImpactDialog
        isOpen={impactTarget !== null}
        neighborhoodName={impactTarget?.neighborhoodName ?? ""}
        activeOrdersCount={impactTarget?.activeOrdersCount ?? 0}
        onConfirm={confirmImpactDeselect}
        onCancel={cancelImpactDeselect}
      />

      {/* 7. Zero Coverage Warning Dialog */}
      <ZeroCoverageDialog
        isOpen={showZeroModal}
        isSaving={isSaving}
        onConfirm={() => triggerSave(true)}
        onCancel={() => setShowZeroModal(false)}
      />

      {/* 8. Internal Coverage Extension Support Ticket Dialog */}
      <CoverageExtensionTicketDialog
        isOpen={isExtensionDialogOpen}
        effectiveMaxDistance={coverageData.effectiveMaxDistanceLevel}
        houseId={coverageData.houseId}
        onClose={() => setIsExtensionDialogOpen(false)}
      />
    </div>
  );
}
