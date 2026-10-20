"use client";

import { useTranslations } from "next-intl";
import { Search, X } from "lucide-react";
import type { CoverageFilterStatus } from "./types";

interface CoverageFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  filterStatus: CoverageFilterStatus;
  onFilterStatusChange: (status: CoverageFilterStatus) => void;
  counts: {
    all: number;
    served: number;
    notServed: number;
  };
}

export function CoverageFilterBar({
  searchQuery,
  onSearchChange,
  filterStatus,
  onFilterStatusChange,
  counts,
}: CoverageFilterBarProps) {
  const t = useTranslations("house.coverage");

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-3 rounded-2xl border border-border shadow-xs">
      {/* Search Input */}
      <div className="relative flex-1 min-w-0">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
          aria-hidden="true"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="w-full h-10 pl-9 pr-8 text-xs bg-surface border border-border rounded-xl text-heading placeholder:text-muted-foreground focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-heading p-1 rounded-md transition"
            aria-label="Effacer la recherche"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 shrink-0">
        <button
          type="button"
          onClick={() => onFilterStatusChange("all")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition min-h-[38px] ${
            filterStatus === "all"
              ? "bg-heading text-white shadow-xs font-bold"
              : "bg-surface hover:bg-muted text-muted-foreground border border-border"
          }`}
        >
          {t("filterAll", { count: counts.all })}
        </button>

        <button
          type="button"
          onClick={() => onFilterStatusChange("served")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition min-h-[38px] ${
            filterStatus === "served"
              ? "bg-heading text-white shadow-xs font-bold"
              : "bg-surface hover:bg-muted text-muted-foreground border border-border"
          }`}
        >
          {t("filterServed", { count: counts.served })}
        </button>

        <button
          type="button"
          onClick={() => onFilterStatusChange("not_served")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition min-h-[38px] ${
            filterStatus === "not_served"
              ? "bg-heading text-white shadow-xs font-bold"
              : "bg-surface hover:bg-muted text-muted-foreground border border-border"
          }`}
        >
          {t("filterNotServed", { count: counts.notServed })}
        </button>
      </div>
    </div>
  );
}
