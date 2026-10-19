"use client";

import { useEffect, useState } from "react";
import { Search, Calendar, ArrowUpDown, Volume2, VolumeX, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";

interface PartnerOrdersFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  date: string;
  onDateChange: (value: string) => void;
  sort: "deadline" | "promised" | "recent";
  onSortChange: (value: "deadline" | "promised" | "recent") => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function PartnerOrdersFilterBar({
  search,
  onSearchChange,
  date,
  onDateChange,
  sort,
  onSortChange,
  soundEnabled,
  onToggleSound,
  onRefresh,
  isRefreshing,
}: PartnerOrdersFilterBarProps) {
  const t = useTranslations("house.orders");
  const [localSearch, setLocalSearch] = useState(search);
  const [prevSearch, setPrevSearch] = useState(search);

  if (prevSearch !== search) {
    setPrevSearch(search);
    setLocalSearch(search);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== search) {
        onSearchChange(localSearch);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, search, onSearchChange]);

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-3 rounded-2xl bg-card border border-border">
      {/* Search Bar */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <input
          type="search"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onSearchChange(localSearch);
            }
          }}
          placeholder={t("filterSearchPlaceholder")}
          aria-label={t("filterSearchPlaceholder")}
          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-border bg-surface text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[44px] sm:min-h-[38px]"
        />
      </div>

      {/* Date filter & Sorting */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 sm:flex-initial">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <input
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            aria-label={t("filterDateLabel")}
            className="pl-8 pr-2 py-2 text-xs rounded-xl border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[44px] sm:min-h-[38px] w-full sm:w-auto"
          />
        </div>

        <div className="relative flex-1 sm:flex-initial">
          <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as "deadline" | "promised" | "recent")}
            aria-label={t("sortBy")}
            className="pl-8 pr-8 py-2 text-xs rounded-xl border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[44px] sm:min-h-[38px] w-full sm:w-auto cursor-pointer"
          >
            <option value="promised">{t("sortPromised")}</option>
            <option value="deadline">{t("sortDeadline")}</option>
            <option value="recent">{t("sortRecent")}</option>
          </select>
        </div>

        {/* Audio chime toggle */}
        <button
          type="button"
          onClick={onToggleSound}
          title={soundEnabled ? t("soundEnabledTitle") : t("soundDisabledTitle")}
          aria-label={t("soundToggle")}
          className={`inline-flex items-center justify-center p-2 rounded-xl border min-w-[44px] min-h-[44px] sm:min-w-[38px] sm:min-h-[38px] transition-colors cursor-pointer ${
            soundEnabled
              ? "bg-primary-soft text-primary border-primary/30"
              : "bg-surface text-muted-foreground border-border hover:text-foreground"
          }`}
        >
          {soundEnabled ? (
            <Volume2 className="size-4" aria-hidden="true" />
          ) : (
            <VolumeX className="size-4" aria-hidden="true" />
          )}
        </button>

        {/* Refresh button */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          aria-label={t("refreshOrdersAria")}
          className="inline-flex items-center justify-center p-2 rounded-xl border border-border bg-surface hover:bg-card text-muted-foreground hover:text-foreground min-w-[44px] min-h-[44px] sm:min-w-[38px] sm:min-h-[38px] transition-colors cursor-pointer"
        >
          <RefreshCw className={`size-4 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
        </button>
      </div>
    </div>
  );
}
