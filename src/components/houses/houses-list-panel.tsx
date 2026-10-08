"use client";

import { useTranslations } from "next-intl";
import { MapPin, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HouseCard } from "./house-card";
import { HousesResultsHeader } from "./houses-results-header";
import type { CustomerHouseSummary } from "@/dal";

interface HousesListPanelProps {
  houses: CustomerHouseSummary[];
  currentSort: string;
  onSortChange: (sort: "recommended" | "turnaround" | "price" | "rating") => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  hoveredHouseId: string | null;
  onHoverHouse: (id: string | null) => void;
  onRequestCoverage: () => void;
}

export function HousesListPanel({
  houses,
  currentSort,
  onSortChange,
  hasActiveFilters,
  onClearFilters,
  hoveredHouseId,
  onHoverHouse,
  onRequestCoverage,
}: HousesListPanelProps) {
  const t = useTranslations("customerHouses");

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto px-4 sm:px-6 py-5">
      <HousesResultsHeader
        totalCount={houses.length}
        currentSort={currentSort}
        onSortChange={onSortChange}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={onClearFilters}
      />

      {houses.length === 0 ? (
        <div className="my-auto py-12 px-4 text-center max-w-md mx-auto">
          <div className="size-16 rounded-2xl bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <SearchX className="size-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            {t("noResultsTitle")}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-12">
          {houses.map((house) => (
            <HouseCard
              key={house.id}
              house={house}
              isHighlighted={hoveredHouseId === house.id}
              onHover={onHoverHouse}
            />
          ))}
        </div>
      )}
    </div>
  );
}
