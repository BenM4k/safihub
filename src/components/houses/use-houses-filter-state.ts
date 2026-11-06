import {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useDeferredValue,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import {
  DEFAULT_NEARBY_RADIUS_KM,
  type LatLng,
} from "@/lib/validations/location";
import {
  getCachedUserCoords,
  getSavedRadiusKm,
  isRadiusFilterSavedActive,
  saveCachedUserCoords,
  setRadiusFilterSavedActive,
  setSavedRadiusKm,
} from "./location-permission-modal";
import type {
  CustomerHouseSearchFilter,
  CustomerHousesPageData,
} from "@/services/house/customer-search.service";

export type HouseSortOption = "recommended" | "turnaround" | "price" | "rating";

export interface HousesUrlParamsShape {
  query?: string | null;
  neighborhoodId?: string | null;
  service?: string | null;
  openNow?: boolean | null;
  maxTurnaround?: number | null;
  maxMinOrder?: number | null;
  lat?: number | null;
  lng?: number | null;
  radiusKm?: number | null;
  sort?: HouseSortOption | null;
}

export function buildHousesFilterUrl(
  baseQueryString: string,
  updates: Partial<HousesUrlParamsShape>
): string {
  const params = new URLSearchParams(baseQueryString);

  const setOrDelete = (key: string, val: string | number | undefined | null) => {
    if (val !== undefined && val !== null && String(val).trim() !== "") {
      params.set(key, String(val));
    } else {
      params.delete(key);
    }
  };

  if ("query" in updates) {
    setOrDelete("query", updates.query?.trim() || null);
  }
  if ("neighborhoodId" in updates) {
    setOrDelete("neighborhoodId", updates.neighborhoodId);
  }
  if ("service" in updates) {
    setOrDelete("service", updates.service);
  }
  if ("openNow" in updates) {
    setOrDelete("openNow", updates.openNow ? "1" : null);
  }
  if ("maxTurnaround" in updates) {
    setOrDelete("maxTurnaround", updates.maxTurnaround);
  }
  if ("maxMinOrder" in updates) {
    setOrDelete("maxMinOrder", updates.maxMinOrder);
  }
  if ("lat" in updates) {
    setOrDelete(
      "lat",
      typeof updates.lat === "number" ? Number(updates.lat.toFixed(6)) : null
    );
  }
  if ("lng" in updates) {
    setOrDelete(
      "lng",
      typeof updates.lng === "number" ? Number(updates.lng.toFixed(6)) : null
    );
  }
  if ("radiusKm" in updates) {
    setOrDelete("radiusKm", updates.radiusKm);
  }
  if ("sort" in updates) {
    setOrDelete(
      "sort",
      updates.sort && updates.sort !== "recommended" ? updates.sort : null
    );
  }

  const qs = params.toString();
  return qs ? `/houses?${qs}` : "/houses";
}

export function useHousesFilterState(
  initialData: CustomerHousesPageData,
  initialNeighborhoodId?: string,
  initialFilter?: CustomerHouseSearchFilter
) {
  const router = useRouter();
  const [isRefetching, startTransition] = useTransition();

  const [searchQuery, setSearchQueryState] = useState(
    initialFilter?.query ?? ""
  );
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const [currentNeighborhoodId, setCurrentNeighborhoodId] = useState<
    string | null
  >(initialFilter?.neighborhoodId ?? initialNeighborhoodId ?? null);
  const [openNowOnly, setOpenNowOnly] = useState(
    Boolean(initialFilter?.openNow)
  );
  const [selectedService, setSelectedService] = useState<string | null>(
    initialFilter?.serviceSlug ?? null
  );
  const [maxTurnaround, setMaxTurnaround] = useState<number | null>(
    initialFilter?.maxTurnaround ?? null
  );
  const [maxMinOrder, setMaxMinOrder] = useState<number | null>(
    initialFilter?.maxMinOrder ?? null
  );
  const [userLocation, setUserLocation] = useState<LatLng | null>(() => {
    if (
      typeof initialFilter?.lat === "number" &&
      typeof initialFilter?.lng === "number"
    ) {
      return { lat: initialFilter.lat, lng: initialFilter.lng };
    }
    return getCachedUserCoords();
  });
  const [radiusKm, setRadiusKm] = useState<number | null>(() => {
    if (typeof initialFilter?.radiusKm === "number") {
      return initialFilter.radiusKm;
    }
    if (getCachedUserCoords() && isRadiusFilterSavedActive()) {
      return getSavedRadiusKm() ?? DEFAULT_NEARBY_RADIUS_KM;
    }
    return null;
  });
  const [currentSort, setCurrentSort] = useState<HouseSortOption>(
    initialFilter?.sort ?? "recommended"
  );

  // Sync local filter state when the server re-renders with updated initialFilter from URL params
  const [prevInitialFilter, setPrevInitialFilter] = useState(initialFilter);
  if (initialFilter !== prevInitialFilter) {
    setPrevInitialFilter(initialFilter);
    setCurrentNeighborhoodId(
      initialFilter?.neighborhoodId ?? initialNeighborhoodId ?? null
    );
    setOpenNowOnly(Boolean(initialFilter?.openNow));
    setSelectedService(initialFilter?.serviceSlug ?? null);
    setMaxTurnaround(initialFilter?.maxTurnaround ?? null);
    setMaxMinOrder(initialFilter?.maxMinOrder ?? null);
    setCurrentSort(initialFilter?.sort ?? "recommended");
    if (
      typeof initialFilter?.lat === "number" &&
      typeof initialFilter?.lng === "number" &&
      typeof initialFilter?.radiusKm === "number"
    ) {
      setUserLocation({ lat: initialFilter.lat, lng: initialFilter.lng });
      setRadiusKm(initialFilter.radiusKm);
    } else {
      setRadiusKm(null);
    }
  }

  const [viewMode, setViewMode] = useState<"split" | "list" | "map">("split");
  const [hoveredHouseId, setHoveredHouseId] = useState<string | null>(null);
  const [selectedHouseId, setSelectedHouseId] = useState<string | null>(null);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isSaveSearchOpen, setIsSaveSearchOpen] = useState(false);

  const navigateWithFilters = useCallback(
    (updates: Partial<HousesUrlParamsShape>) => {
      if (typeof window === "undefined") return;
      const nextUrl = buildHousesFilterUrl(window.location.search, updates);
      startTransition(() => {
        router.replace(nextUrl, { scroll: false });
      });
    },
    [router]
  );

  // If the user previously consented to location in this session and navigated back to
  // bare `/houses` without URL coordinates, restore their saved radius filter in the URL.
  useEffect(() => {
    if (
      typeof initialFilter?.radiusKm !== "number" &&
      isRadiusFilterSavedActive()
    ) {
      const savedCoords = getCachedUserCoords();
      const savedRadius = getSavedRadiusKm() ?? DEFAULT_NEARBY_RADIUS_KM;
      if (savedCoords) {
        navigateWithFilters({
          lat: savedCoords.lat,
          lng: savedCoords.lng,
          radiusKm: savedRadius,
        });
      }
    }
  }, [initialFilter?.radiusKm, navigateWithFilters]);

  // Debounce text search query synchronization to URL params
  useEffect(() => {
    const currentUrlQuery = initialFilter?.query ?? "";
    if (searchQuery.trim() === currentUrlQuery.trim()) return;

    const timer = window.setTimeout(() => {
      navigateWithFilters({ query: searchQuery.trim() || null });
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchQuery, initialFilter?.query, navigateWithFilters]);

  const setSearchQuery = useCallback((nextQuery: string) => {
    setSearchQueryState(nextQuery);
  }, []);

  const activeNeighborhood = useMemo(() => {
    if (!currentNeighborhoodId) return null;
    return (
      initialData.neighborhoods.find((n) => n.id === currentNeighborhoodId) ??
      null
    );
  }, [currentNeighborhoodId, initialData.neighborhoods]);

  const handleSelectNeighborhood = useCallback(
    (neighborhoodId: string | null) => {
      setCurrentNeighborhoodId(neighborhoodId);
      navigateWithFilters({ neighborhoodId });
    },
    [navigateWithFilters]
  );

  const handleClearNeighborhood = useCallback(() => {
    setCurrentNeighborhoodId(null);
    navigateWithFilters({ neighborhoodId: null });
  }, [navigateWithFilters]);

  const handleToggleOpenNow = useCallback(() => {
    setOpenNowOnly((prev) => {
      const next = !prev;
      navigateWithFilters({ openNow: next });
      return next;
    });
  }, [navigateWithFilters]);

  const handleSelectService = useCallback(
    (slug: string | null) => {
      setSelectedService(slug);
      navigateWithFilters({ service: slug });
    },
    [navigateWithFilters]
  );

  const handleSelectTurnaround = useCallback(
    (hours: number | null) => {
      setMaxTurnaround(hours);
      navigateWithFilters({ maxTurnaround: hours });
    },
    [navigateWithFilters]
  );

  const handleSelectMaxMinOrder = useCallback(
    (amount: number | null) => {
      setMaxMinOrder(amount);
      navigateWithFilters({ maxMinOrder: amount });
    },
    [navigateWithFilters]
  );

  const handleSelectSort = useCallback(
    (sort: HouseSortOption) => {
      setCurrentSort(sort);
      navigateWithFilters({ sort });
    },
    [navigateWithFilters]
  );

  const handleApplyNearbyRadius = useCallback(
    (coords: LatLng, customRadiusKm: number = DEFAULT_NEARBY_RADIUS_KM) => {
      setUserLocation(coords);
      setRadiusKm(customRadiusKm);
      setRadiusFilterSavedActive(true);
      setSavedRadiusKm(customRadiusKm);
      navigateWithFilters({
        lat: coords.lat,
        lng: coords.lng,
        radiusKm: customRadiusKm,
      });
    },
    [navigateWithFilters]
  );

  const handleSelectRadiusKm = useCallback(
    (nextRadiusKm: number | null) => {
      if (nextRadiusKm === null) {
        setRadiusKm(null);
        setRadiusFilterSavedActive(false);
        setSavedRadiusKm(null);
        navigateWithFilters({
          lat: null,
          lng: null,
          radiusKm: null,
        });
        return;
      }

      const applyWithCoords = (coords: LatLng) => {
        setUserLocation(coords);
        setRadiusKm(nextRadiusKm);
        setRadiusFilterSavedActive(true);
        setSavedRadiusKm(nextRadiusKm);
        navigateWithFilters({
          lat: coords.lat,
          lng: coords.lng,
          radiusKm: nextRadiusKm,
        });
      };

      const existingCoords = userLocation ?? getCachedUserCoords();
      if (existingCoords) {
        applyWithCoords(existingCoords);
        return;
      }

      if (typeof navigator !== "undefined" && "geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const coords = {
              lat: Number(pos.coords.latitude.toFixed(6)),
              lng: Number(pos.coords.longitude.toFixed(6)),
            };
            saveCachedUserCoords(coords);
            applyWithCoords(coords);
          },
          () => {
            // Leave unchanged if browser denies geolocation
          },
          { enableHighAccuracy: false, timeout: 6000, maximumAge: 300000 }
        );
      }
    },
    [userLocation, navigateWithFilters]
  );

  const handleClearRadiusFilter = useCallback(() => {
    setRadiusKm(null);
    setRadiusFilterSavedActive(false);
    setSavedRadiusKm(null);
    navigateWithFilters({
      lat: null,
      lng: null,
      radiusKm: null,
    });
  }, [navigateWithFilters]);

  const handleClearFilters = useCallback(() => {
    setSearchQueryState("");
    setCurrentNeighborhoodId(null);
    setOpenNowOnly(false);
    setSelectedService(null);
    setMaxTurnaround(null);
    setMaxMinOrder(null);
    setRadiusKm(null);
    setCurrentSort("recommended");
    setRadiusFilterSavedActive(false);
    setSavedRadiusKm(null);
    navigateWithFilters({
      query: null,
      neighborhoodId: null,
      service: null,
      openNow: null,
      maxTurnaround: null,
      maxMinOrder: null,
      lat: null,
      lng: null,
      radiusKm: null,
      sort: null,
    });
  }, [navigateWithFilters]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (activeNeighborhood) count++;
    if (radiusKm !== null) count++;
    if (openNowOnly) count++;
    if (selectedService) count++;
    if (maxTurnaround) count++;
    if (maxMinOrder) count++;
    return count;
  }, [
    activeNeighborhood,
    radiusKm,
    openNowOnly,
    selectedService,
    maxTurnaround,
    maxMinOrder,
  ]);

  const hasActiveFilters = Boolean(
    activeNeighborhood ||
      radiusKm !== null ||
      searchQuery.trim() ||
      openNowOnly ||
      selectedService ||
      maxTurnaround ||
      maxMinOrder
  );

  // `initialData.houses` is already filtered & sorted on the server (including PostGIS `ST_DWithin` + `ST_Distance`).
  // We only apply instant client-side text search filtering while the 300ms URL debounce is in flight.
  const filteredHouses = useMemo(() => {
    const serverHouses = initialData.houses;
    const q = deferredSearchQuery.toLowerCase().trim();
    const serverQuery = (initialFilter?.query ?? "").toLowerCase().trim();

    if (!q || q === serverQuery) {
      return serverHouses;
    }

    return serverHouses.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        h.neighborhoodName.toLowerCase().includes(q) ||
        h.zoneName.toLowerCase().includes(q) ||
        (h.addressNote && h.addressNote.toLowerCase().includes(q))
    );
  }, [initialData.houses, deferredSearchQuery, initialFilter?.query]);

  return {
    searchQuery,
    setSearchQuery,
    openNowOnly,
    handleToggleOpenNow,
    selectedService,
    handleSelectService,
    maxTurnaround,
    handleSelectTurnaround,
    maxMinOrder,
    handleSelectMaxMinOrder,
    userLocation,
    radiusKm,
    handleApplyNearbyRadius,
    handleSelectRadiusKm,
    handleClearRadiusFilter,
    currentSort,
    handleSelectSort,
    isRefetching,
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
