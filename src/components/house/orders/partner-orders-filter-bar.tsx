"use client";

import { useEffect, useState } from "react";
import { Search, Calendar, Volume2, VolumeX, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

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

/**
 * Filter bar with search, date filter, shadcn Select sort, sound toggle, and refresh.
 */
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
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-3 rounded-2xl bg-card border border-border shadow-xs font-sans">
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
          className="w-full pl-9 pr-3 py-2 text-base sm:text-xs rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[40px] sm:min-h-[36px]"
        />
      </div>

      {/* Date filter & Sorting */}
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
        <div className="relative flex-1 sm:flex-initial min-w-[130px]">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <input
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            aria-label={t("filterDateLabel")}
            className="pl-8 pr-2 py-2 text-base sm:text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[40px] sm:min-h-[36px] w-full sm:w-auto cursor-pointer"
          />
        </div>

        <Select
          value={sort}
          onValueChange={(val) =>
            onSortChange(val as "deadline" | "promised" | "recent")
          }
        >
          <SelectTrigger
            aria-label={t("sortBy")}
            className="min-h-[40px] sm:min-h-[36px] h-auto text-base sm:text-xs rounded-xl border-border bg-background px-3 flex-1 sm:flex-initial cursor-pointer"
          >
            <SelectValue placeholder={t("sortBy")} />
          </SelectTrigger>
          <SelectContent className="rounded-xl bg-card border-border shadow-lift">
            <SelectItem value="promised" className="text-xs cursor-pointer">
              {t("sortPromised")}
            </SelectItem>
            <SelectItem value="deadline" className="text-xs cursor-pointer">
              {t("sortDeadline")}
            </SelectItem>
            <SelectItem value="recent" className="text-xs cursor-pointer">
              {t("sortRecent")}
            </SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-1.5 shrink-0 ml-auto sm:ml-0">
          {/* Audio chime toggle */}
          <Button
            type="button"
            variant={soundEnabled ? "secondary" : "outline"}
            size="icon"
            onClick={onToggleSound}
            title={
              soundEnabled ? t("soundEnabledTitle") : t("soundDisabledTitle")
            }
            aria-label={t("soundToggle")}
            className={`size-10 sm:size-9 rounded-xl border cursor-pointer ${
              soundEnabled
                ? "bg-primary-soft text-primary border-primary/30"
                : "border-border text-muted-foreground"
            }`}
          >
            {soundEnabled ? (
              <Volume2 className="size-4" aria-hidden="true" />
            ) : (
              <VolumeX className="size-4" aria-hidden="true" />
            )}
          </Button>

          {/* Refresh button */}
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onRefresh}
            disabled={isRefreshing}
            aria-label={t("refreshOrdersAria")}
            className="size-10 sm:size-9 rounded-xl border-border bg-background hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <RefreshCw
              className={`size-4 ${
                isRefreshing ? "animate-spin text-primary" : ""
              }`}
            />
          </Button>
        </div>
      </div>
    </div>
  );
}
