"use client";

import { useMemo, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  initialNeighborhoodId?: string;
}

export function HousesSplitView({ initialData, initialNeighborhoodId }: HousesSplitViewProps) {
  const t = useTranslations("customerHouses");
  const router = useRouter();
  const searchParams = useSearchParams();

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

  // Active neighborhood resolution
  const currentNeighborhoodId = searchParams.get("neighborhoodId") ?? initialNeighborhoodId ?? null;
  const activeNeighborhood = useMemo(() => {
    if (!currentNeighborhoodId) return null;
    return initialData.neighborhoods.find((n) => n.id === currentNeighborhoodId) ?? null;
  }, [currentNeighborhoodId, initialData.neighborhoods]);

  const handleClearNeighborhood = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("neighborhoodId");
    const qs = params.toString();
    router.push(qs ? `/houses?${qs}` : "/houses");
  }, [router, searchParams]);

  const handleSelectNeighborhood = useCallback(
    (neighborhoodId: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (neighborhoodId) {
        params.set("neighborhoodId", neighborhoodId);
      } else {
        params.delete("neighborhoodId");
      }
      const qs = params.toString();
      router.push(qs ? `/houses?${qs}` : "/houses");
    },
    [router, searchParams]
  );

  const handleClearFilters = useCallback(() => {
    setSearchQuery("");
    setOpenNowOnly(false);
    setSelectedService(null);
    setMaxTurnaround(null);
    setMaxMinOrder(null);
    if (currentNeighborhoodId) {
      handleClearNeighborhood();
    }
  }, [currentNeighborhoodId, handleClearNeighborhood]);

  // Active filter count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (activeNeighborhood) count++;
    if (openNowOnly) count++;
    if (selectedService) count++;
    if (maxTurnaround) count++;
    if (maxMinOrder) count++;
    return count;
  }, [activeNeighborhood, openNowOnly, selectedService, maxTurnaround, maxMinOrder]);

  const hasActiveFilters = Boolean(
    activeNeighborhood || searchQuery || openNowOnly || selectedService || maxTurnaround || maxMinOrder
  );

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
        result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case "recommended":
      default:
        result.sort((a, b) => {
          if (a.isOpenNow && !b.isOpenNow) return -1;
          if (!a.isOpenNow && b.isOpenNow) return 1;
          return (b.rating ?? 0) - (a.rating ?? 0);
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
      />
    </div>
  );
}
