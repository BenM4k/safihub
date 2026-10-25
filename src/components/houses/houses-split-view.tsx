"use client";

import { useTranslations } from "next-intl";
import { Map, List } from "lucide-react";
import { SearchTopBar } from "./search-top-bar";
import { HousesListPanel } from "./houses-list-panel";
import { BukavuInteractiveMap } from "./bukavu-interactive-map";
import { FilterSheetDialog } from "./filter-sheet-dialog";
import { SaveSearchDialog } from "./save-search-dialog";
import { useHousesFilterState } from "./use-houses-filter-state";
import type { CustomerHousesPageData } from "@/services/house/customer-search.service";

interface HousesSplitViewProps {
  initialData: CustomerHousesPageData;
  initialNeighborhoodId?: string;
}

export function HousesSplitView({ initialData, initialNeighborhoodId }: HousesSplitViewProps) {
  const t = useTranslations("customerHouses");
  const {
    searchQuery,
    setSearchQuery,
    openNowOnly,
    setOpenNowOnly,
    selectedService,
    setSelectedService,
    maxTurnaround,
    setMaxTurnaround,
    maxMinOrder,
    setMaxMinOrder,
    currentSort,
    setCurrentSort,
    viewMode,
    setViewMode,
    hoveredHouseId,
    setHoveredHouseId,
    selectedHouseId,
    setSelectedHouseId,
    isFilterSheetOpen,
    setIsFilterSheetOpen,
    isSaveSearchOpen,
    setIsSaveSearchOpen,
    currentNeighborhoodId,
    activeNeighborhood,
    handleSelectNeighborhood,
    handleClearNeighborhood,
    handleClearFilters,
    activeFiltersCount,
    hasActiveFilters,
    filteredHouses,
  } = useHousesFilterState(initialData, initialNeighborhoodId);

  return (
    <div className="flex flex-col h-[calc(100dvh-5rem)] bg-background overflow-hidden">
      {/* Sticky Search Top Bar */}
      <SearchTopBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        openNowOnly={openNowOnly}
        onToggleOpenNow={() => setOpenNowOnly((prev) => !prev)}
        selectedService={selectedService}
        onSelectService={setSelectedService}
        availableServices={initialData.availableServices}
        activeNeighborhood={activeNeighborhood}
        onClearNeighborhood={handleClearNeighborhood}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenAllFilters={() => setIsFilterSheetOpen(true)}
        onOpenSaveSearch={() => setIsSaveSearchOpen(true)}
        activeFiltersCount={activeFiltersCount}
      />

      {/* Main Split Layout: Cards on Left, Map on Right */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Column: House Cards List */}
        <div
          className={`w-full lg:w-[58%] xl:w-[52%] flex flex-col h-full bg-background dark:bg-card/20 ${
            viewMode === "map" ? "hidden lg:flex" : "flex"
          }`}
        >
          <HousesListPanel
            houses={filteredHouses}
            currentSort={currentSort}
            onSortChange={setCurrentSort}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={handleClearFilters}
            activeNeighborhood={activeNeighborhood}
            onClearNeighborhood={handleClearNeighborhood}
            hoveredHouseId={hoveredHouseId}
            onHoverHouse={setHoveredHouseId}
            onRequestCoverage={() => setIsSaveSearchOpen(true)}
          />
        </div>

        {/* Right Column: Interactive Bukavu Map */}
        <div
          className={`flex-1 h-full border-l border-border ${
            viewMode === "list" ? "hidden lg:flex" : "flex"
          }`}
        >
          <BukavuInteractiveMap
            houses={filteredHouses}
            hoveredHouseId={hoveredHouseId}
            onHoverHouse={setHoveredHouseId}
            selectedHouseId={selectedHouseId}
            onSelectHouse={setSelectedHouseId}
          />
        </div>

        {/* Floating Mobile Toggle (Airbnb/Zillow style) */}
        <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
          <button
            type="button"
            onClick={() => setViewMode((m) => (m === "map" ? "list" : "map"))}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 dark:bg-primary text-white font-bold text-xs shadow-xl active:scale-95 transition cursor-pointer"
          >
            {viewMode === "map" ? (
              <>
                <List className="size-4" />
                <span>{t("showList")}</span>
              </>
            ) : (
              <>
                <Map className="size-4" />
                <span>{t("showMap")}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filter and Save Search Dialogs */}
      <FilterSheetDialog
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        neighborhoods={initialData.neighborhoods}
        selectedNeighborhoodId={currentNeighborhoodId}
        onSelectNeighborhood={handleSelectNeighborhood}
        selectedService={selectedService}
        onSelectService={setSelectedService}
        availableServices={initialData.availableServices}
        openNowOnly={openNowOnly}
        onToggleOpenNow={() => setOpenNowOnly((prev) => !prev)}
        maxTurnaround={maxTurnaround}
        onSelectTurnaround={setMaxTurnaround}
        maxMinOrder={maxMinOrder}
        onSelectMaxMinOrder={setMaxMinOrder}
        onResetFilters={handleClearFilters}
      />

      <SaveSearchDialog
        isOpen={isSaveSearchOpen}
        onClose={() => setIsSaveSearchOpen(false)}
        neighborhoods={initialData.neighborhoods}
        selectedNeighborhoodId={currentNeighborhoodId}
      />
    </div>
  );
}
