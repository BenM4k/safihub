"use client";

import { Star, CheckCircle2, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PressingReviewCriteria } from "./pressing-review-criteria";
import { usePressingReviewForm, type EligibleOrder } from "./use-pressing-review-form";

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
  const {
    isPending,
    selectedOrderId,
    setSelectedOrderId,
    rating,
    setRating,
    ratingQuality,
    setRatingQuality,
    ratingPunctuality,
    setRatingPunctuality,
    ratingCare,
    setRatingCare,
    ratingValue,
    setRatingValue,
    comment,
    setComment,
    errorMessage,
    isSuccess,
    handleSubmit,
  } = usePressingReviewForm(houseId, eligibleOrders, onReviewSubmitted, onClose);

  const criteria = [
    { label: t("criteriaQuality"), val: ratingQuality, setVal: setRatingQuality },
    { label: t("criteriaPunctuality"), val: ratingPunctuality, setVal: setRatingPunctuality },
    { label: t("criteriaCare"), val: ratingCare, setVal: setRatingCare },
    { label: t("criteriaValue"), val: ratingValue, setVal: setRatingValue },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => { if (!open) onClose(); }}>
      <DialogContent className="w-full max-w-lg rounded-3xl p-6 shadow-2xl border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-2 text-left">
          <DialogTitle className="text-lg font-black text-heading tracking-tight">
            {t("dialogSubmitReviewTitle")}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {houseName} · {t("dialogSubmitReviewDesc")}
          </DialogDescription>
        </DialogHeader>

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
              <label htmlFor="order-selector" className="font-bold text-foreground block mb-1">
                {t("orderSelectLabel")}
              </label>
              <Select
                value={selectedOrderId}
                onValueChange={(val: string) => setSelectedOrderId(val)}
              >
                <SelectTrigger
                  id="order-selector"
                  className="w-full h-auto p-2.5 rounded-xl bg-muted/50 border border-border text-foreground font-medium text-base cursor-pointer"
                >
                  <SelectValue placeholder={t("orderSelectLabel")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {eligibleOrders.map((o) => (
                      <SelectItem key={o.id} value={o.id} className="bg-card text-foreground">
                        Commande du {new Date(o.createdAt).toLocaleDateString("fr-FR")}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
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
            <PressingReviewCriteria
              title={t("criteriaRatingsOptional")}
              criteria={criteria}
            />

            {/* Comment */}
            <div>
              <label htmlFor="review-comment" className="font-bold text-foreground block mb-1">
                {t("commentLabel")}
              </label>
              <textarea
                id="review-comment"
                value={comment}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComment(e.target.value)}
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
      </DialogContent>
    </Dialog>
  );
}
