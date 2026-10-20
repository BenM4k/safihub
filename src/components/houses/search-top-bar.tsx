"use client";

import { Search, SlidersHorizontal, Map, List, Bookmark, Clock, Check, MapPin, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

interface SearchTopBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  openNowOnly: boolean;
  onToggleOpenNow: () => void;
  selectedService: string | null;
  onSelectService: (slug: string | null) => void;
  availableServices: Array<{ slug: string; nameFr: string; nameSw: string }>;
  activeNeighborhood?: { id: string; name: string } | null;
  onClearNeighborhood?: () => void;
  viewMode: "split" | "list" | "map";
  onViewModeChange: (mode: "split" | "list" | "map") => void;
  onOpenAllFilters: () => void;
  onOpenSaveSearch: () => void;
  activeFiltersCount: number;
}

export function SearchTopBar({
  searchQuery,
  onSearchChange,
  openNowOnly,
  onToggleOpenNow,
  selectedService,
  onSelectService,
  availableServices,
  activeNeighborhood,
  onClearNeighborhood,
  viewMode,
  onViewModeChange,
  onOpenAllFilters,
  onOpenSaveSearch,
  activeFiltersCount,
}: SearchTopBarProps) {
  const t = useTranslations("customerHouses");

  return (
    <div className="w-full bg-card/95 backdrop-blur-md border-b border-border px-4 sm:px-6 py-3 sticky top-0 z-30 shadow-2xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search input + Quick filter pills */}
        <div className="flex flex-1 flex-wrap items-center gap-2.5">
          {/* Main search box with min 16px font size */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full pl-9 pr-4 py-2 text-base bg-muted/60 dark:bg-card border border-border rounded-full text-foreground placeholder:text-muted-foreground focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
            />
          </div>

          {/* Active neighborhood filter badge */}
          {activeNeighborhood && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 shadow-2xs shrink-0 animate-fade-in">
              <MapPin className="size-3.5 text-primary shrink-0" />
              <span className="truncate max-w-[140px] sm:max-w-[200px]">
                {activeNeighborhood.name}
              </span>
              {onClearNeighborhood && (
                <button
                  type="button"
                  onClick={onClearNeighborhood}
                  className="size-4 rounded-full hover:bg-primary/20 flex items-center justify-center transition cursor-pointer text-primary"
                  aria-label={t("clearNeighborhoodFilter")}
                  title={t("clearNeighborhoodFilter")}
                >
                  <X className="size-3" />
                </button>
              )}
            </div>
          )}

          {/* Service filter quick pills */}
          <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto py-0.5">
            <button
              type="button"
              onClick={() => onSelectService(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer ${
                selectedService === null
                  ? "bg-slate-900 text-white border-slate-900 shadow-2xs dark:bg-primary dark:border-primary dark:text-white"
                  : "bg-card text-muted-foreground border-border hover:border-border-strong hover:text-foreground"
              }`}
            >
              {t("allServicesTab")}
            </button>
            {availableServices.map((svc) => {
              const isSelected = selectedService === svc.slug;
              return (
                <button
                  key={svc.slug}
                  type="button"
                  onClick={() => onSelectService(isSelected ? null : svc.slug)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer ${
                    isSelected
                      ? "bg-primary text-white border-primary shadow-2xs"
                      : "bg-card text-muted-foreground border-border hover:border-border-strong hover:text-foreground"
                  }`}
                >
                  {svc.nameFr}
                </button>
              );
            })}
          </div>

          {/* Open now toggle button */}
          <button
            type="button"
            onClick={onToggleOpenNow}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer ${
              openNowOnly
                ? "bg-emerald-600 dark:bg-emerald-700 text-white border-emerald-600 dark:border-emerald-700 shadow-2xs"
                : "bg-card text-foreground border-border hover:border-border-strong"
            }`}
          >
            {openNowOnly ? <Check className="size-3.5" /> : <Clock className="size-3.5 text-muted-foreground" />}
            <span>{t("filterOpenNow")}</span>
          </button>

          {/* All filters button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenAllFilters}
            className="rounded-full text-xs h-8 px-3 font-semibold gap-1.5"
          >
            <SlidersHorizontal className="size-3.5" />
            <span>{t("allFilters")}</span>
            {activeFiltersCount > 0 && (
              <span className="size-4.5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </div>

        {/* Right side: View switchers & Save Search */}
        <div className="flex items-center justify-between sm:justify-end gap-2.5">
          {/* List / Map view mode pills */}
          <div className="inline-flex p-0.5 bg-muted border border-border rounded-full">
            <button
              type="button"
              onClick={() => onViewModeChange(viewMode === "map" ? "split" : "list")}
              className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full transition cursor-pointer ${
                viewMode === "list" || viewMode === "split"
                  ? "bg-card text-heading shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="size-3.5" />
              <span>{t("viewList")}</span>
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("map")}
              className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full transition cursor-pointer ${
                viewMode === "map"
                  ? "bg-card text-heading shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Map className="size-3.5" />
              <span>{t("viewMap")}</span>
            </button>
          </div>

          {/* Save search button matching reference */}
          <Button
            type="button"
            variant="contrast"
            size="sm"
            onClick={onOpenSaveSearch}
            className="rounded-full text-xs h-8 px-3.5 font-semibold gap-1.5 shadow-2xs"
          >
            <Bookmark className="size-3.5" />
            <span>{t("saveSearch")}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
