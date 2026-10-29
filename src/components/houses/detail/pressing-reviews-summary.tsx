import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import type { HouseReviewStatsData } from "@/dal/review.dal";

interface PressingReviewsSummaryProps {
  stats: HouseReviewStatsData;
  selectedStarFilter: number | null;
  onSelectStarFilter: (star: number | null) => void;
}

export function PressingReviewsSummary({
  stats,
  selectedStarFilter,
  onSelectStarFilter,
}: PressingReviewsSummaryProps) {
  const t = useTranslations("customerHouses");
  const reviewCount = stats.reviewCount;
  const isNew = reviewCount < 3;
  const averageRating = isNew || !stats.averageRating ? null : stats.averageRating;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 rounded-2xl bg-muted/40">
      {/* Large Score */}
      <div className="flex flex-col items-center justify-center text-center p-3 sm:border-r border-border/60">
        {averageRating !== null ? (
          <>
            <span className="text-4xl sm:text-5xl font-black text-heading tabular-nums">
              {averageRating.toFixed(1)}
            </span>
            <div className="flex items-center gap-1 my-1.5 text-amber-500">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`size-4 ${
                    s <= Math.round(averageRating) ? "fill-amber-500" : "fill-muted text-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
              {t("ratingSummaryText", { count: reviewCount })}
            </span>
          </>
        ) : (
          <div className="space-y-1">
            <span className="inline-block px-3 py-1 rounded-full bg-success-soft/30 border border-success/20 text-success text-sm font-black">
              {t("newBadge")}
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
              Moins de 3 avis pour établir une moyenne
            </p>
          </div>
        )}
      </div>

      {/* Distribution Bars */}
      <div className="md:col-span-2 space-y-1.5 flex flex-col justify-center">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = stats.distribution[String(star)] || 0;
          const percent = reviewCount > 0 ? Math.round((count / reviewCount) * 100) : 0;
          const isSelected = selectedStarFilter === star;

          return (
            <button
              key={star}
              type="button"
              onClick={() => onSelectStarFilter(isSelected ? null : star)}
              className={`flex items-center gap-2.5 text-xs font-semibold w-full text-left p-1 rounded-lg transition cursor-pointer hover:bg-muted ${
                isSelected ? "bg-muted ring-1 ring-border-strong" : ""
              }`}
            >
              <span className="w-6 text-muted-foreground shrink-0 font-bold">{star} ★</span>
              <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span className="w-8 text-right text-muted-foreground/70 tabular-nums text-[11px]">
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
