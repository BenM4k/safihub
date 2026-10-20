"use client";

import { useTranslations } from "next-intl";
import { ArrowUpDown, X, MapPin } from "lucide-react";

interface HousesResultsHeaderProps {
  totalCount: number;
  currentSort: string;
  onSortChange: (sort: "recommended" | "turnaround" | "price" | "rating") => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  activeNeighborhood?: { id: string; name: string } | null;
  onClearNeighborhood?: () => void;
}

export function HousesResultsHeader({
  totalCount,
  currentSort,
  onSortChange,
  hasActiveFilters,
  onClearFilters,
  activeNeighborhood,
  onClearNeighborhood,
}: HousesResultsHeaderProps) {
  const t = useTranslations("customerHouses");

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-border">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-heading tracking-tight">
          {t("pageTitle")}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5 flex-wrap">
          <span>
            {totalCount === 1
              ? t("resultsCountSingle")
              : t("resultsCount", { count: totalCount })}
          </span>
          {activeNeighborhood && (
            <>
              <span className="text-muted-foreground">•</span>
              <span className="inline-flex items-center gap-1 font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full text-xs">
                <MapPin className="size-3 shrink-0" />
                <span>{activeNeighborhood.name}</span>
                {onClearNeighborhood && (
                  <button
                    type="button"
                    onClick={onClearNeighborhood}
                    className="hover:text-primary-hover p-0.5 rounded-full hover:bg-primary/20 transition cursor-pointer"
                    aria-label={t("clearNeighborhoodFilter")}
                    title={t("clearNeighborhoodFilter")}
                  >
                    <X className="size-3" />
                  </button>
                )}
              </span>
            </>
          )}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 bg-rose-500/10 hover:bg-rose-500/20 rounded-full transition cursor-pointer"
          >
            <X className="size-3" />
            <span>{t("clearFilters")}</span>
          </button>
        )}

        <div className="flex items-center gap-1.5 bg-muted/60 border border-border rounded-xl px-2.5 py-1 text-xs">
          <ArrowUpDown className="size-3 text-muted-foreground" />
          <span className="text-muted-foreground font-medium">{t("sortBy")}:</span>
          <select
            value={currentSort}
            onChange={(e) =>
              onSortChange(
                e.target.value as "recommended" | "turnaround" | "price" | "rating"
              )
            }
            className="bg-transparent font-bold text-foreground text-base sm:text-xs focus:outline-none cursor-pointer"
          >
            <option value="recommended" className="bg-card text-foreground">{t("sortRecommended")}</option>
            <option value="turnaround" className="bg-card text-foreground">{t("sortTurnaround")}</option>
            <option value="price" className="bg-card text-foreground">{t("sortPrice")}</option>
            <option value="rating" className="bg-card text-foreground">{t("sortRating")}</option>
          </select>
        </div>
      </div>
    </div>
  );
}
