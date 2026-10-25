"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquarePlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { PressingReviewItem } from "./pressing-review-item";
import { PressingReviewsSummary } from "./pressing-reviews-summary";
import { PressingReviewsFilterBar } from "./pressing-reviews-filter-bar";
import { PressingReviewFormDialog } from "./pressing-review-form-dialog";
import type { HouseReviewItem, HouseReviewStatsData } from "@/dal/review.dal";

interface PressingReviewsSectionProps {
  houseId: string;
  houseName: string;
  initialReviews: HouseReviewItem[];
  stats: HouseReviewStatsData;
  eligibleOrders: Array<{ id: string; createdAt: Date }>;
  isAuthenticated: boolean;
}

export function PressingReviewsSection({
  houseId,
  houseName,
  initialReviews,
  stats,
  eligibleOrders,
  isAuthenticated,
}: PressingReviewsSectionProps) {
  const t = useTranslations("customerHouses");
  const router = useRouter();
  const [reviews] = useState<HouseReviewItem[]>(initialReviews);
  const [selectedStarFilter, setSelectedStarFilter] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"recent" | "highest" | "lowest">("recent");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [displayCount, setDisplayCount] = useState(5);
  const [eligibilityNotice, setEligibilityNotice] = useState<string | null>(null);

  const reviewCount = stats.reviewCount;

  const handleWriteReviewClick = () => {
    if (!isAuthenticated) {
      const returnUrl = typeof window !== "undefined" ? encodeURIComponent(window.location.pathname) : "";
      router.push(`/login?callbackUrl=${returnUrl}`);
      return;
    }
    if (eligibleOrders.length === 0) {
      setEligibilityNotice(
        "Vous pourrez laisser un avis dès que votre première commande auprès de ce pressing sera livrée."
      );
      return;
    }
    setIsDialogOpen(true);
  };

  // Filter & sort reviews locally for smooth interaction
  const filteredReviews = reviews
    .filter((r) => (selectedStarFilter ? r.rating === selectedStarFilter : true))
    .sort((a, b) => {
      if (sortBy === "highest") return b.rating - a.rating;
      if (sortBy === "lowest") return a.rating - b.rating;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const visibleReviews = filteredReviews.slice(0, displayCount);

  return (
    <section id="avis" className="bg-card rounded-3xl border border-border p-6 space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h2 className="text-xl font-black text-heading tracking-tight">
            {t("reviewsTitle")}
          </h2>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">
            Retours d&apos;expérience vérifiés des clients SafiHub à Bukavu.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleWriteReviewClick}
          className="font-bold text-xs gap-1.5 shrink-0 border-primary/40 text-primary hover:bg-primary/5 cursor-pointer"
        >
          <MessageSquarePlus className="size-3.5" />
          <span>{t("writeReview")}</span>
        </Button>
      </div>

      {eligibilityNotice && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-medium flex items-center justify-between animate-in fade-in">
          <span>{eligibilityNotice}</span>
          <button
            type="button"
            onClick={() => setEligibilityNotice(null)}
            className="text-amber-700 hover:text-amber-800 dark:text-amber-300 dark:hover:text-amber-100 font-bold ml-2 text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* Overview Block: Large average + Interactive distribution bars */}
      <PressingReviewsSummary
        stats={stats}
        selectedStarFilter={selectedStarFilter}
        onSelectStarFilter={setSelectedStarFilter}
      />

      {/* Filter and Sort controls */}
      <PressingReviewsFilterBar
        reviewCount={reviewCount}
        selectedStarFilter={selectedStarFilter}
        onSelectStarFilter={setSelectedStarFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* Reviews List */}
      {visibleReviews.length === 0 ? (
        <div className="py-12 text-center bg-muted/30 rounded-2xl border border-dashed border-border">
          <p className="text-xs sm:text-sm text-muted-foreground font-medium">
            {t("noReviewsYet")}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleReviews.map((rev) => (
            <PressingReviewItem
              key={rev.id}
              review={rev}
              houseName={houseName}
            />
          ))}

          {filteredReviews.length > displayCount && (
            <div className="text-center pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDisplayCount((prev) => prev + 5)}
                className="font-bold text-xs"
              >
                {t("loadMoreReviews")}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Review Dialog */}
      <PressingReviewFormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        houseId={houseId}
        houseName={houseName}
        eligibleOrders={eligibleOrders}
        onReviewSubmitted={() => {
          // Re-fetch or refresh
          router.refresh();
        }}
      />
    </section>
  );
}
