"use client";

import { useTranslations } from "next-intl";
import { ArrowUpDown, X } from "lucide-react";

interface HousesResultsHeaderProps {
  totalCount: number;
  currentSort: string;
  onSortChange: (sort: "recommended" | "turnaround" | "price" | "rating") => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export function HousesResultsHeader({
  totalCount,
  currentSort,
  onSortChange,
  hasActiveFilters,
  onClearFilters,
}: HousesResultsHeaderProps) {
  const t = useTranslations("customerHouses");

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          {t("pageTitle")}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          {totalCount === 1
            ? t("resultsCountSingle")
            : t("resultsCount", { count: totalCount })}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-full transition"
          >
            <X className="size-3" />
            <span>{t("clearFilters")}</span>
          </button>
        )}

        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
          <ArrowUpDown className="size-3 text-slate-400" />
          <span className="text-slate-500 font-medium">{t("sortBy")}:</span>
          <select
            value={currentSort}
            onChange={(e) =>
              onSortChange(
                e.target.value as "recommended" | "turnaround" | "price" | "rating"
              )
            }
            className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="recommended">{t("sortRecommended")}</option>
            <option value="turnaround">{t("sortTurnaround")}</option>
            <option value="price">{t("sortPrice")}</option>
            <option value="rating">{t("sortRating")}</option>
          </select>
        </div>
      </div>
    </div>
  );
}
