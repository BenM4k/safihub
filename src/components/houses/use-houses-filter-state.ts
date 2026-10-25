import { useState, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { CustomerHousesPageData } from "@/services/house/customer-search.service";

export type HouseSortOption = "recommended" | "turnaround" | "price" | "rating";

export function useHousesFilterState(
  initialData: CustomerHousesPageData,
  initialNeighborhoodId?: string
) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState("");
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [maxTurnaround, setMaxTurnaround] = useState<number | null>(null);
  const [maxMinOrder, setMaxMinOrder] = useState<number | null>(null);
  const [currentSort, setCurrentSort] = useState<HouseSortOption>("recommended");
  const [viewMode, setViewMode] = useState<"split" | "list" | "map">("split");
  const [hoveredHouseId, setHoveredHouseId] = useState<string | null>(null);
  const [selectedHouseId, setSelectedHouseId] = useState<string | null>(null);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isSaveSearchOpen, setIsSaveSearchOpen] = useState(false);

  // Active neighborhood resolution
  const currentNeighborhoodId =
    searchParams.get("neighborhoodId") ?? initialNeighborhoodId ?? null;
  const activeNeighborhood = useMemo(() => {
    if (!currentNeighborhoodId) return null;
    return (
      initialData.neighborhoods.find((n) => n.id === currentNeighborhoodId) ?? null
    );
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
    activeNeighborhood ||
      searchQuery ||
      openNowOnly ||
      selectedService ||
      maxTurnaround ||
      maxMinOrder
  );

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

  return {
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
  };
}
