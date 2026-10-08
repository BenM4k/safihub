"use client";

import { Search, SlidersHorizontal, Map, List, Bookmark, Clock, Check } from "lucide-react";
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
  viewMode,
  onViewModeChange,
  onOpenAllFilters,
  onOpenSaveSearch,
  activeFiltersCount,
}: SearchTopBarProps) {
  const t = useTranslations("customerHouses");

  return (
    <div className="w-full bg-white border-b border-slate-200 px-4 sm:px-6 py-3 sticky top-0 z-30 shadow-2xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search input + Quick filter pills */}
        <div className="flex flex-1 flex-wrap items-center gap-2.5">
          {/* Main search box */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-full focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
            />
          </div>

          {/* Service filter quick pills */}
          <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto py-0.5">
            <button
              type="button"
              onClick={() => onSelectService(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                selectedService === null
                  ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
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
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                    isSelected
                      ? "bg-primary text-white border-primary shadow-2xs"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
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
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
              openNowOnly
                ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
            }`}
          >
            {openNowOnly ? <Check className="size-3.5" /> : <Clock className="size-3.5 text-slate-400" />}
            <span>{t("filterOpenNow")}</span>
          </button>

          {/* All filters button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenAllFilters}
            className="rounded-full text-xs h-8 px-3 border-slate-200 text-slate-700 font-semibold gap-1.5 hover:bg-slate-50"
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
          <div className="inline-flex p-0.5 bg-slate-100 border border-slate-200/80 rounded-full">
            <button
              type="button"
              onClick={() => onViewModeChange(viewMode === "map" ? "split" : "list")}
              className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full transition ${
                viewMode === "list" || viewMode === "split"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <List className="size-3.5" />
              <span>{t("viewList")}</span>
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("map")}
              className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full transition ${
                viewMode === "map"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Map className="size-3.5" />
              <span>{t("viewMap")}</span>
            </button>
          </div>

          {/* Save search button matching reference */}
          <Button
            type="button"
            size="sm"
            onClick={onOpenSaveSearch}
            className="rounded-full text-xs h-8 px-3.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold gap-1.5 shadow-2xs"
          >
            <Bookmark className="size-3.5" />
            <span>{t("saveSearch")}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
