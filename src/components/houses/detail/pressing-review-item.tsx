"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, ShieldCheck, Flag, MessageSquare } from "lucide-react";
import { useTranslations } from "next-intl";
import { reportReviewAction } from "@/actions/review.actions";
import type { HouseReviewItem } from "@/dal/review.dal";
import { PressingLightbox } from "./pressing-lightbox";

interface PressingReviewItemProps {
  review: HouseReviewItem;
  houseName: string;
}

export function PressingReviewItem({ review, houseName }: PressingReviewItemProps) {
  const t = useTranslations("customerHouses");
  const [isReporting, setIsReporting] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportSent, setReportSent] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason.trim()) return;

    const res = await reportReviewAction({
      reviewId: review.id,
      reason: reportReason.trim(),
    });

    if (res.success) {
      setReportSent(true);
      setIsReporting(false);
    }
  };

  const reviewDateFormatted = new Date(review.createdAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const photos = Array.isArray(review.photos) ? (review.photos as string[]) : [];

  return (
    <div className="p-5 rounded-3xl bg-card border border-border space-y-3.5 transition">
      {/* Header: Author, Rating, Date, Verified Badge */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-black text-heading">
              {review.customerFirstName} {review.customerLastInitial}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
              <ShieldCheck className="size-3" />
              <span>{t("verifiedOrder")}</span>
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1">
            {/* Stars with text alternative */}
            <div
              className="flex items-center gap-0.5 text-amber-500"
              aria-label={`${review.rating} sur 5`}
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`size-3.5 ${
                    star <= review.rating ? "fill-amber-500" : "fill-muted text-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] text-muted-foreground font-medium">
              {reviewDateFormatted}
            </span>
          </div>
        </div>

        {/* Report Button */}
        <button
          type="button"
          onClick={() => setIsReporting(!isReporting)}
          className="text-muted-foreground hover:text-foreground transition p-1 rounded-lg"
          title={t("reportReview")}
        >
          <Flag className="size-3.5" />
        </button>
      </div>

      {/* Report Form */}
      {isReporting && (
        <form onSubmit={handleReport} className="p-3 bg-muted/50 rounded-2xl border border-border space-y-2">
          <input
            type="text"
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            placeholder={t("reportReasonPlaceholder")}
            className="w-full text-base p-2.5 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsReporting(false)}
              className="text-xs text-muted-foreground hover:text-foreground font-semibold"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
            >
              Envoyer
            </button>
          </div>
        </form>
      )}

      {reportSent && (
        <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
          {t("reportSuccess")}
        </p>
      )}

      {/* Comment */}
      {review.comment && (
        <p className="text-xs sm:text-sm text-foreground leading-relaxed font-normal">
          {review.comment}
        </p>
      )}

      {/* Review Photos */}
      {photos.length > 0 && (
        <div className="flex items-center gap-2 pt-1">
          {photos.map((photoUrl, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActivePhotoIndex(idx)}
              className="relative size-14 sm:size-16 rounded-xl overflow-hidden border border-border bg-muted cursor-pointer shadow-2xs hover:opacity-90"
            >
              <Image
                src={photoUrl}
                alt={`Photo avis ${idx + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Partner Reply */}
      {review.reply && (
        <div className="mt-3 p-3.5 rounded-2xl bg-muted/40 border border-border space-y-1 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-heading">
            <MessageSquare className="size-3.5 text-primary" />
            <span>{t("partnerReplyTitle")} ({houseName})</span>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            {review.reply.text}
          </p>
        </div>
      )}

      {/* Lightbox for review photos */}
      {activePhotoIndex !== null && (
        <PressingLightbox
          photos={photos}
          currentIndex={activePhotoIndex}
          isOpen={true}
          onClose={() => setActivePhotoIndex(null)}
          onNavigate={setActivePhotoIndex}
          title={`Avis de ${review.customerFirstName}`}
        />
      )}
    </div>
  );
}
