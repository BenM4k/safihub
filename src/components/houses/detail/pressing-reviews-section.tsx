"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquarePlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { PressingReviewItem } from "./pressing-review-item";
import { PressingReviewsSummary } from "./pressing-reviews-summary";
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
    <section id="avis" className="bg-white rounded-3xl border border-slate-200/90 p-6 space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            {t("reviewsTitle")}
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
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
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-center justify-between animate-in fade-in">
          <span>{eligibilityNotice}</span>
          <button
            type="button"
            onClick={() => setEligibilityNotice(null)}
            className="text-amber-800 hover:text-amber-950 font-bold ml-2 text-sm"
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedStarFilter(null)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition shrink-0 ${
              selectedStarFilter === null
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {t("allRatings", { count: reviewCount })}
          </button>
          {[5, 4, 3, 2, 1].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setSelectedStarFilter(star)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition shrink-0 ${
                selectedStarFilter === star
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {star} ★
            </button>
          ))}
        </div>

        {/* Sort select */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Trier par :</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800"
          >
            <option value="recent">{t("sortRecent")}</option>
            <option value="highest">{t("sortHighest")}</option>
            <option value="lowest">{t("sortLowest")}</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      {visibleReviews.length === 0 ? (
        <div className="py-12 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
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
