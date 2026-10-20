"use client";

import { useState, useTransition } from "react";
import { Star, X, Loader2, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { submitReviewAction } from "@/actions/review.actions";

interface EligibleOrder {
  id: string;
  createdAt: Date;
}

interface PressingReviewFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  houseId: string;
  houseName: string;
  eligibleOrders: EligibleOrder[];
  onReviewSubmitted: () => void;
}

export function PressingReviewFormDialog({
  isOpen,
  onClose,
  houseId,
  houseName,
  eligibleOrders,
  onReviewSubmitted,
}: PressingReviewFormDialogProps) {
  const t = useTranslations("customerHouses");
  const [isPending, startTransition] = useTransition();

  const [selectedOrderId, setSelectedOrderId] = useState<string>(
    eligibleOrders[0]?.id || ""
  );
  const [rating, setRating] = useState<number>(5);
  const [ratingQuality, setRatingQuality] = useState<number>(5);
  const [ratingPunctuality, setRatingPunctuality] = useState<number>(5);
  const [ratingCare, setRatingCare] = useState<number>(5);
  const [ratingValue, setRatingValue] = useState<number>(5);
  const [comment, setComment] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedOrderId) {
      setErrorMessage("Veuillez sélectionner une commande livrée.");
      return;
    }

    startTransition(async () => {
      const res = await submitReviewAction({
        orderId: selectedOrderId,
        houseId,
        rating,
        ratingQuality,
        ratingPunctuality,
        ratingCare,
        ratingValue,
        comment: comment.trim() || null,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Une erreur est survenue.");
      } else {
        setIsSuccess(true);
        setTimeout(() => {
          onReviewSubmitted();
          onClose();
        }, 1500);
      }
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
    >
      <div className="bg-card w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-border relative max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-muted-foreground hover:text-foreground transition"
        >
          <X className="size-5" />
        </button>

        <h2 className="text-lg font-black text-heading tracking-tight mb-1">
          {t("dialogSubmitReviewTitle")}
        </h2>
        <p className="text-xs text-muted-foreground mb-5">
          {houseName} · {t("dialogSubmitReviewDesc")}
        </p>

        {isSuccess ? (
          <div className="py-10 text-center space-y-2">
            <CheckCircle2 className="size-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
            <p className="text-sm font-bold text-heading">{t("reviewSuccess")}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 font-semibold">
                {errorMessage}
              </div>
            )}

            {/* Order selector */}
            <div>
              <label className="font-bold text-foreground block mb-1">
                {t("orderSelectLabel")}
              </label>
              <select
                value={selectedOrderId}
                onChange={(e) => setSelectedOrderId(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-muted/50 border border-border text-foreground font-medium text-base"
              >
                {eligibleOrders.map((o) => (
                  <option key={o.id} value={o.id} className="bg-card text-foreground">
                    Commande du {new Date(o.createdAt).toLocaleDateString("fr-FR")}
                  </option>
                ))}
              </select>
            </div>

            {/* Global Rating (Large clickable stars) */}
            <div>
              <label className="font-bold text-foreground block mb-1.5">
                {t("globalRatingLabel")}
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition cursor-pointer"
                  >
                    <Star
                      className={`size-6 ${
                        star <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-black text-foreground ml-2">
                  {rating} / 5
                </span>
              </div>
            </div>

            {/* Optional Criteria Grid */}
            <div className="pt-2 border-t border-border space-y-2.5">
              <span className="font-bold text-muted-foreground block">
                {t("criteriaRatingsOptional")}
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { label: t("criteriaQuality"), val: ratingQuality, setVal: setRatingQuality },
                  { label: t("criteriaPunctuality"), val: ratingPunctuality, setVal: setRatingPunctuality },
                  { label: t("criteriaCare"), val: ratingCare, setVal: setRatingCare },
                  { label: t("criteriaValue"), val: ratingValue, setVal: setRatingValue },
                ].map((crit) => (
                  <div key={crit.label} className="p-2.5 rounded-xl bg-muted/50 border border-border">
                    <span className="text-[11px] font-semibold text-foreground block mb-1">
                      {crit.label}
                    </span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => crit.setVal(s)}
                          className="hover:scale-110"
                        >
                          <Star
                            className={`size-3.5 ${
                              s <= crit.val ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="font-bold text-foreground block mb-1">
                {t("commentLabel")}
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={1000}
                rows={3}
                placeholder={t("commentPlaceholder")}
                className="w-full p-2.5 rounded-xl bg-muted/50 border border-border text-foreground font-normal text-base placeholder:text-muted-foreground focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <span className="text-[10px] text-muted-foreground float-right">
                {comment.length} / 1000
              </span>
            </div>

            {/* Submit CTA */}
            <div className="pt-3">
              <Button
                type="submit"
                variant="primary"
                disabled={isPending}
                className="w-full py-3 rounded-xl font-black text-sm"
              >
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    <span>{t("submitting")}</span>
                  </>
                ) : (
                  <span>{t("submitReviewBtn")}</span>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
