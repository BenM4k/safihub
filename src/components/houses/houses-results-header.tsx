"use client";

import { useTranslations } from "next-intl";
import { ArrowUpDown, X, MapPin } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

        <Select
          value={currentSort}
          onValueChange={(val: string) =>
            onSortChange(
              val as "recommended" | "turnaround" | "price" | "rating"
            )
          }
        >
          <SelectTrigger className="h-auto bg-muted/60 border border-border rounded-xl px-2.5 py-1 text-xs font-bold text-foreground shadow-none gap-1.5 cursor-pointer focus:ring-0 focus-visible:ring-0 dark:bg-muted/60">
            <ArrowUpDown className="size-3 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground font-medium">{t("sortBy")}:</span>
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectGroup>
              <SelectItem value="recommended">{t("sortRecommended")}</SelectItem>
              <SelectItem value="turnaround">{t("sortTurnaround")}</SelectItem>
              <SelectItem value="price">{t("sortPrice")}</SelectItem>
              <SelectItem value="rating">{t("sortRating")}</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
