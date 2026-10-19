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
    <div className="p-5 rounded-3xl bg-slate-50/70 border border-slate-200/80 space-y-3.5 transition">
      {/* Header: Author, Rating, Date, Verified Badge */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-black text-slate-900">
              {review.customerFirstName} {review.customerLastInitial}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
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
                    star <= review.rating ? "fill-amber-500" : "fill-slate-200 text-slate-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              {reviewDateFormatted}
            </span>
          </div>
        </div>

        {/* Report Button */}
        <button
          type="button"
          onClick={() => setIsReporting(!isReporting)}
          className="text-slate-400 hover:text-slate-600 transition p-1 rounded-lg"
          title={t("reportReview")}
        >
          <Flag className="size-3.5" />
        </button>
      </div>

      {/* Report Form */}
      {isReporting && (
        <form onSubmit={handleReport} className="p-3 bg-white rounded-2xl border border-slate-200 space-y-2">
          <input
            type="text"
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            placeholder={t("reportReasonPlaceholder")}
            className="w-full text-xs p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsReporting(false)}
              className="text-xs text-slate-500 font-semibold"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-3 py-1 rounded-lg bg-rose-600 text-white text-xs font-bold"
            >
              Envoyer
            </button>
          </div>
        </form>
      )}

      {reportSent && (
        <p className="text-[11px] text-emerald-700 font-semibold">
          {t("reportSuccess")}
        </p>
      )}

      {/* Comment */}
      {review.comment && (
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
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
              className="relative size-14 sm:size-16 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer shadow-2xs hover:opacity-90"
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
        <div className="mt-3 p-3.5 rounded-2xl bg-white border border-slate-200/80 space-y-1 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-900">
            <MessageSquare className="size-3.5 text-primary" />
            <span>{t("partnerReplyTitle")} ({houseName})</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
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
