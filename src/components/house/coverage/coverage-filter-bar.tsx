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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
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
          className="pl-9 h-10 sm:h-9 text-xs bg-card rounded-xl border-input focus-visible:border-primary shadow-2xs"
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

      {/* Filter Tabs: Sleek segmented pills */}
      <div className="inline-flex items-center p-1 rounded-xl bg-muted/50 border border-border/50 gap-1 overflow-x-auto shrink-0 self-start sm:self-auto">
        <button
          type="button"
          onClick={() => onFilterStatusChange("all")}
          className={`px-3 py-1.5 text-xs whitespace-nowrap rounded-lg transition-all cursor-pointer ${
            filterStatus === "all"
              ? "bg-card text-heading font-bold shadow-2xs border border-border/60"
              : "text-muted-foreground hover:text-heading font-medium"
          }`}
        >
          {t("filterAll", { count: counts.all })}
        </button>

        <button
          type="button"
          onClick={() => onFilterStatusChange("served")}
          className={`px-3 py-1.5 text-xs whitespace-nowrap rounded-lg transition-all cursor-pointer ${
            filterStatus === "served"
              ? "bg-card text-primary font-bold shadow-2xs border border-border/60"
              : "text-muted-foreground hover:text-heading font-medium"
          }`}
        >
          {t("filterServed", { count: counts.served })}
        </button>

        <button
          type="button"
          onClick={() => onFilterStatusChange("not_served")}
          className={`px-3 py-1.5 text-xs whitespace-nowrap rounded-lg transition-all cursor-pointer ${
            filterStatus === "not_served"
              ? "bg-card text-heading font-bold shadow-2xs border border-border/60"
              : "text-muted-foreground hover:text-heading font-medium"
          }`}
        >
          {t("filterNotServed", { count: counts.notServed })}
        </button>
      </div>
    </div>
  );
}
