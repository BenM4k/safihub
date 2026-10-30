"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [prevSearch, setPrevSearch] = useState(searchQuery);

  if (prevSearch !== searchQuery) {
    setPrevSearch(searchQuery);
    setLocalSearch(searchQuery);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSearchChange(localSearch.trim());
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
      {/* Search Input with Button */}
      <form
        onSubmit={handleSearchSubmit}
        className="relative flex-1 max-w-sm flex items-center gap-1.5"
      >
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
            aria-hidden="true"
          />
          <Input
            type="text"
            value={localSearch}
            onChange={(e) => {
              const val = e.target.value;
              setLocalSearch(val);
              if (val === "" && searchQuery !== "") {
                onSearchChange("");
              }
            }}
            placeholder={t("searchPlaceholder")}
            className="pl-9 pr-8 h-10 sm:h-9 text-base sm:text-xs bg-card rounded-xl border-input focus-visible:border-primary shadow-2xs"
            aria-label={t("searchPlaceholder")}
          />
          {localSearch && (
            <button
              type="button"
              onClick={() => {
                setLocalSearch("");
                onSearchChange("");
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-heading p-1 rounded-md transition"
              aria-label={t("clearSearch")}
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
        <Button
          type="submit"
          size="sm"
          aria-label={t("searchButton")}
          className="h-10 sm:h-9 px-3 sm:px-3.5 rounded-xl text-xs font-semibold shrink-0 gap-1.5"
        >
          <Search className="size-3.5" />
          <span className="hidden sm:inline">{t("searchButton")}</span>
        </Button>
      </form>

      {/* Filter Tabs: Sleek borderless tabs */}
      <div className="inline-flex items-center gap-1 overflow-x-auto shrink-0 self-start sm:self-auto">
        <button
          type="button"
          onClick={() => onFilterStatusChange("all")}
          className={`px-3 py-1.5 text-xs whitespace-nowrap transition-all cursor-pointer bg-transparent border-0 shadow-none ${
            filterStatus === "all"
              ? "text-primary font-bold"
              : "text-muted-foreground hover:text-foreground font-medium"
          }`}
        >
          {t("filterAll", { count: counts.all })}
        </button>

        <button
          type="button"
          onClick={() => onFilterStatusChange("served")}
          className={`px-3 py-1.5 text-xs whitespace-nowrap transition-all cursor-pointer bg-transparent border-0 shadow-none ${
            filterStatus === "served"
              ? "text-primary font-bold"
              : "text-muted-foreground hover:text-foreground font-medium"
          }`}
        >
          {t("filterServed", { count: counts.served })}
        </button>

        <button
          type="button"
          onClick={() => onFilterStatusChange("not_served")}
          className={`px-3 py-1.5 text-xs whitespace-nowrap transition-all cursor-pointer bg-transparent border-0 shadow-none ${
            filterStatus === "not_served"
              ? "text-primary font-bold"
              : "text-muted-foreground hover:text-foreground font-medium"
          }`}
        >
          {t("filterNotServed", { count: counts.notServed })}
        </button>
      </div>
    </div>
  );
}
