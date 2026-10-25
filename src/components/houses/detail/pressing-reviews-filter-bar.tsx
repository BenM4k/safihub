"use client";

import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PressingReviewsFilterBarProps {
  reviewCount: number;
  selectedStarFilter: number | null;
  onSelectStarFilter: (star: number | null) => void;
  sortBy: "recent" | "highest" | "lowest";
  onSortChange: (val: "recent" | "highest" | "lowest") => void;
}

export function PressingReviewsFilterBar({
  reviewCount,
  selectedStarFilter,
  onSelectStarFilter,
  sortBy,
  onSortChange,
}: PressingReviewsFilterBarProps) {
  const t = useTranslations("customerHouses");

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => onSelectStarFilter(null)}
          className={`px-3 py-1 rounded-full text-xs font-bold transition shrink-0 cursor-pointer ${
            selectedStarFilter === null
              ? "bg-foreground text-background"
              : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
          }`}
        >
          {t("allRatings", { count: reviewCount })}
        </button>
        {[5, 4, 3, 2, 1].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onSelectStarFilter(star)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition shrink-0 cursor-pointer ${
              selectedStarFilter === star
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            }`}
          >
            {star} ★
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 text-xs">
        <span id="reviews-sort-label" className="text-muted-foreground font-medium">
          {t("sortBy")} :
        </span>
        <Select
          value={sortBy}
          onValueChange={(val: string) => onSortChange(val as typeof sortBy)}
        >
          <SelectTrigger
            aria-labelledby="reviews-sort-label"
            className="h-auto p-2 md:p-1.5 rounded-lg bg-card border border-border text-base md:text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectGroup>
              <SelectItem value="recent" className="bg-card text-foreground">{t("sortRecent")}</SelectItem>
              <SelectItem value="highest" className="bg-card text-foreground">{t("sortHighest")}</SelectItem>
              <SelectItem value="lowest" className="bg-card text-foreground">{t("sortLowest")}</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
