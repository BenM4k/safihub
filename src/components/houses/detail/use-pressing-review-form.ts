import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { submitReviewAction } from "@/actions/review.actions";

export interface EligibleOrder {
  id: string;
  createdAt: Date;
}

export function usePressingReviewForm(
  houseId: string,
  eligibleOrders: EligibleOrder[],
  onReviewSubmitted: () => void,
  onClose: () => void
) {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId) {
      setErrorMessage("Veuillez sélectionner une commande.");
      return;
    }

    setErrorMessage(null);
    startTransition(async () => {
      const res = await submitReviewAction({
        orderId: selectedOrderId,
        houseId,
        rating,
        ratingQuality,
        ratingPunctuality,
        ratingCare,
        ratingValue,
        comment: comment.trim() || undefined,
        photos: [],
      });

      if (!res.success) {
        setErrorMessage(res.error || "Une erreur est survenue.");
      } else {
        setIsSuccess(true);
        toast.success(t("reviewSuccess"));
        setTimeout(() => {
          onReviewSubmitted();
          onClose();
        }, 1200);
      }
    });
  };

  return {
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
  };
}
