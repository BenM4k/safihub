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
  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => { if (!open) onClose(); }}>
      <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-lg max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-2xl shadow-lift bg-card border border-border/60">
        {isOpen && (
          <ReviewFormBody
            houseId={houseId}
            houseName={houseName}
            eligibleOrders={eligibleOrders}
            onReviewSubmitted={onReviewSubmitted}
            onClose={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

interface ReviewFormBodyProps {
  houseId: string;
  houseName: string;
  eligibleOrders: EligibleOrder[];
  onReviewSubmitted: () => void;
  onClose: () => void;
}

function ReviewFormBody({
  houseId,
  houseName,
  eligibleOrders,
  onReviewSubmitted,
  onClose,
}: ReviewFormBodyProps) {
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
    <>
      <DialogHeader className="p-4 sm:p-5 pb-3 border-b border-border/60 shrink-0 pr-12 text-left font-sans">
        <DialogTitle className="text-lg font-black text-heading tracking-tight font-display">
          {t("dialogSubmitReviewTitle")}
        </DialogTitle>
        <DialogDescription className="text-xs text-slate-600 dark:text-slate-300">
          {houseName} · {t("dialogSubmitReviewDesc")}
        </DialogDescription>
      </DialogHeader>

      {isSuccess ? (
        <div className="py-10 text-center space-y-2 p-4">
          <CheckCircle2 className="size-10 text-success mx-auto" />
          <p className="text-sm font-bold text-heading">{t("reviewSuccess")}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="overflow-y-auto overflow-x-hidden flex-1 max-w-full min-w-0 p-4 sm:p-5 space-y-4 text-xs font-sans">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive font-semibold">
              {errorMessage}
            </div>
          )}

          {/* Order selector */}
          <div className="space-y-1">
            <label htmlFor="order-selector" className="font-bold text-foreground block">
              {t("orderSelectLabel")}
            </label>
            <Select
              value={selectedOrderId}
              onValueChange={(val: string) => setSelectedOrderId(val)}
            >
              <SelectTrigger
                id="order-selector"
                className="w-full h-auto p-2.5 rounded-lg bg-muted/40 border border-input text-foreground font-medium text-base sm:text-xs cursor-pointer"
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
          <div className="space-y-1.5">
            <label className="font-bold text-foreground block">
              {t("globalRatingLabel")}
            </label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  aria-label={`${t("globalRatingLabel")}: ${star} / 5`}
                  aria-pressed={star === rating}
                  className="p-1 hover:scale-110 transition cursor-pointer"
                >
                  <Star
                    aria-hidden="true"
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
          <div className="space-y-1">
            <label htmlFor="review-comment" className="font-bold text-foreground block">
              {t("commentLabel")}
            </label>
            <textarea
              id="review-comment"
              value={comment}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComment(e.target.value)}
              maxLength={1000}
              rows={3}
              placeholder={t("commentPlaceholder")}
              className="w-full p-2.5 rounded-lg bg-muted/40 border border-input text-foreground font-normal text-base sm:text-xs placeholder:text-muted-foreground focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <span className="text-[10px] text-muted-foreground float-right">
              {comment.length} / 1000
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-3 border-t border-border/60 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
              className="w-full sm:w-auto h-9 px-4 rounded-lg text-xs font-semibold"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isPending}
              className="w-full sm:w-auto h-9 px-4 rounded-lg font-bold text-xs"
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
    </>
  );
}
