"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { MapPin, SearchX, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HouseCard } from "./house-card";
import { HousesResultsHeader } from "./houses-results-header";
import type { CustomerHouseSummary } from "@/dal";

const ITEMS_PER_PAGE = 8;

interface HousesListPanelProps {
  houses: CustomerHouseSummary[];
  currentSort: string;
  onSortChange: (sort: "recommended" | "turnaround" | "price" | "rating") => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  activeNeighborhood?: { id: string; name: string } | null;
  onClearNeighborhood?: () => void;
  hoveredHouseId: string | null;
  onHoverHouse: (id: string | null) => void;
  onRequestCoverage: () => void;
  isRefetching?: boolean;
}

export function HousesListPanel({
  houses,
  currentSort,
  onSortChange,
  hasActiveFilters,
  onClearFilters,
  activeNeighborhood,
  onClearNeighborhood,
  hoveredHouseId,
  onHoverHouse,
  onRequestCoverage,
  isRefetching,
}: HousesListPanelProps) {
  const t = useTranslations("customerHouses");
  const tMap = useTranslations("mapLocation");

  // Track previous houses to reset pagination during render without an extra effect cycle
  const [prevHouses, setPrevHouses] = useState(houses);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  if (houses !== prevHouses) {
    setPrevHouses(houses);
    setVisibleCount(ITEMS_PER_PAGE);
  }

  // Derive effective visible count: if a marker on the map is hovered beyond visible window, dynamically include it
  const hoveredIndex = hoveredHouseId
    ? houses.findIndex((h) => h.id === hoveredHouseId)
    : -1;

  const effectiveVisibleCount =
    hoveredIndex >= visibleCount ? hoveredIndex + 1 : visibleCount;

  const hasMore = effectiveVisibleCount < houses.length;
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Infinite scroll intersection observer (asynchronous browser callback)
  useEffect(() => {
    if (!hasMore) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, houses.length));
        }
      },
      { rootMargin: "250px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, houses.length]);

  const visibleHouses = houses.slice(0, effectiveVisibleCount);

  return (
    <div
      data-pending={isRefetching ? "" : undefined}
      aria-busy={isRefetching || undefined}
      className="group/houses flex-1 flex flex-col h-full overflow-y-auto px-4 sm:px-6 py-5 relative"
    >
      <HousesResultsHeader
        totalCount={houses.length}
        currentSort={currentSort}
        onSortChange={onSortChange}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={onClearFilters}
        activeNeighborhood={activeNeighborhood}
        onClearNeighborhood={onClearNeighborhood}
      />

      {isRefetching && (
        <div
          className="mb-3 inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold animate-fade-in"
          role="status"
          aria-live="polite"
        >
          <Loader2 className="size-3.5 animate-spin shrink-0" />
          <span>{tMap("refetchingHouses")}</span>
        </div>
      )}

      {houses.length === 0 ? (
        <div className="my-auto py-12 px-4 text-center max-w-md mx-auto transition-opacity duration-200 group-data-[pending]/houses:opacity-60 group-data-[pending]/houses:pointer-events-none">
          <div className="size-16 rounded-2xl bg-muted border border-border text-muted-foreground flex items-center justify-center mx-auto mb-4">
            <SearchX className="size-8" />
          </div>
          <h3 className="text-lg font-bold text-heading mb-1">
            {t("noResultsTitle")}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mb-6 leading-relaxed">
            {t("noResultsText")}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
            {hasActiveFilters && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClearFilters}
                className="w-full sm:w-auto text-xs rounded-xl"
              >
                {t("clearFilters")}
              </Button>
            )}
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={onRequestCoverage}
              className="w-full sm:w-auto text-xs rounded-xl gap-1.5"
            >
              <MapPin className="size-3.5" />
              <span>{t("requestCoverage")}</span>
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 transition-opacity duration-200 group-data-[pending]/houses:opacity-60 group-data-[pending]/houses:pointer-events-none">
            {visibleHouses.map((house, idx) => (
              <HouseCard
                key={house.id}
                house={house}
                priority={idx === 0}
                isHighlighted={hoveredHouseId === house.id}
                onHover={onHoverHouse}
              />
            ))}
          </div>

          {/* Infinite Scroll Sentinel & Loader */}
          {hasMore && (
            <div
              ref={sentinelRef}
              className="py-8 flex flex-col items-center justify-center gap-2 text-muted-foreground"
              aria-live="polite"
            >
              <Loader2 className="size-5 animate-spin text-primary" />
              <span className="text-xs font-semibold">{t("loadingMore")}</span>
            </div>
          )}

          {/* End of list confirmation */}
          {!hasMore && houses.length > ITEMS_PER_PAGE && (
            <div className="py-8 text-center text-xs text-muted-foreground border-t border-border/40 mt-4">
              {t("allHousesLoaded")}
            </div>
          )}
        </>
      )}
    </div>
  );
}
