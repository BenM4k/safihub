"use client";

import { useTranslations } from "next-intl";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2 border-b border-border">
      {/* Search Input */}
      <div className="relative flex-1 max-w-sm">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
          aria-hidden="true"
        />
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="pl-9 h-9 text-xs bg-transparent rounded-lg border-input focus-visible:border-primary"
          aria-label={t("searchPlaceholder")}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-heading p-1 rounded-md transition"
            aria-label={t("clearSearch")}
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {/* Filter Tabs: text-primary, no bg */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 shrink-0">
        <button
          type="button"
          onClick={() => onFilterStatusChange("all")}
          className={`px-2.5 py-1 text-xs whitespace-nowrap transition cursor-pointer bg-transparent border-0 ${
            filterStatus === "all"
              ? "text-primary font-bold"
              : "text-muted-foreground hover:text-heading font-medium"
          }`}
        >
          {t("filterAll", { count: counts.all })}
        </button>

        <button
          type="button"
          onClick={() => onFilterStatusChange("served")}
          className={`px-2.5 py-1 text-xs whitespace-nowrap transition cursor-pointer bg-transparent border-0 ${
            filterStatus === "served"
              ? "text-primary font-bold"
              : "text-muted-foreground hover:text-heading font-medium"
          }`}
        >
          {t("filterServed", { count: counts.served })}
        </button>

        <button
          type="button"
          onClick={() => onFilterStatusChange("not_served")}
          className={`px-2.5 py-1 text-xs whitespace-nowrap transition cursor-pointer bg-transparent border-0 ${
            filterStatus === "not_served"
              ? "text-primary font-bold"
              : "text-muted-foreground hover:text-heading font-medium"
          }`}
        >
          {t("filterNotServed", { count: counts.notServed })}
        </button>
      </div>
    </div>
  );
}
