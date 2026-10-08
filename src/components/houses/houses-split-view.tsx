"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Map, List } from "lucide-react";
import { SearchTopBar } from "./search-top-bar";
import { HousesListPanel } from "./houses-list-panel";
import { BukavuInteractiveMap } from "./bukavu-interactive-map";
import { FilterSheetDialog } from "./filter-sheet-dialog";
import { SaveSearchDialog } from "./save-search-dialog";
import type { CustomerHousesPageData } from "@/services/house/customer-search.service";

interface HousesSplitViewProps {
  initialData: CustomerHousesPageData;
}

export function HousesSplitView({ initialData }: HousesSplitViewProps) {
  const t = useTranslations("customerHouses");

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [maxTurnaround, setMaxTurnaround] = useState<number | null>(null);
  const [maxMinOrder, setMaxMinOrder] = useState<number | null>(null);
  const [currentSort, setCurrentSort] = useState<"recommended" | "turnaround" | "price" | "rating">("recommended");
  const [viewMode, setViewMode] = useState<"split" | "list" | "map">("split");
  const [hoveredHouseId, setHoveredHouseId] = useState<string | null>(null);
  const [selectedHouseId, setSelectedHouseId] = useState<string | null>(null);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isSaveSearchOpen, setIsSaveSearchOpen] = useState(false);

  // Active filter count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (openNowOnly) count++;
    if (selectedService) count++;
    if (maxTurnaround) count++;
    if (maxMinOrder) count++;
    return count;
  }, [openNowOnly, selectedService, maxTurnaround, maxMinOrder]);

  const hasActiveFilters = Boolean(
    searchQuery || openNowOnly || selectedService || maxTurnaround || maxMinOrder
  );

  const handleClearFilters = () => {
    setSearchQuery("");
    setOpenNowOnly(false);
    setSelectedService(null);
    setMaxTurnaround(null);
    setMaxMinOrder(null);
  };

  // Filter and sort houses
  const filteredHouses = useMemo(() => {
    let result = [...initialData.houses];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          h.neighborhoodName.toLowerCase().includes(q) ||
          h.zoneName.toLowerCase().includes(q) ||
          (h.addressNote && h.addressNote.toLowerCase().includes(q))
      );
    }

    if (selectedService) {
      result = result.filter((h) =>
        h.availableServices.some((s) => s.slug === selectedService)
      );
    }

    if (openNowOnly) {
      result = result.filter((h) => h.isOpenNow);
    }

    if (maxTurnaround) {
      result = result.filter((h) => h.turnaroundHours <= maxTurnaround);
    }

    if (maxMinOrder) {
      result = result.filter((h) => h.minimumOrderAmount <= maxMinOrder);
    }

    switch (currentSort) {
      case "turnaround":
        result.sort((a, b) => a.turnaroundHours - b.turnaroundHours);
        break;
      case "price":
        result.sort((a, b) => a.minItemPriceCdf - b.minItemPriceCdf);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "recommended":
      default:
        result.sort((a, b) => {
          if (a.isOpenNow && !b.isOpenNow) return -1;
          if (!a.isOpenNow && b.isOpenNow) return 1;
          return b.rating - a.rating;
        });
        break;
    }

    return result;
  }, [
    initialData.houses,
    searchQuery,
    selectedService,
    openNowOnly,
    maxTurnaround,
    maxMinOrder,
    currentSort,
  ]);

  return (
    <div className="flex flex-col h-[calc(100dvh-5rem)] bg-white overflow-hidden">
      {/* Sticky Search Top Bar */}
      <SearchTopBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        openNowOnly={openNowOnly}
        onToggleOpenNow={() => setOpenNowOnly((prev) => !prev)}
        selectedService={selectedService}
        onSelectService={setSelectedService}
        availableServices={initialData.availableServices}
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
          className={`w-full lg:w-[58%] xl:w-[52%] flex flex-col h-full bg-slate-50/50 ${
            viewMode === "map" ? "hidden lg:flex" : "flex"
          }`}
        >
          <HousesListPanel
            houses={filteredHouses}
            currentSort={currentSort}
            onSortChange={setCurrentSort}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={handleClearFilters}
            hoveredHouseId={hoveredHouseId}
            onHoverHouse={setHoveredHouseId}
            onRequestCoverage={() => setIsSaveSearchOpen(true)}
          />
        </div>

        {/* Right Column: Interactive Bukavu Map */}
        <div
          className={`flex-1 h-full border-l border-slate-200 ${
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
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 text-white font-bold text-xs shadow-xl active:scale-95 transition"
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
      />
    </div>
  );
}
