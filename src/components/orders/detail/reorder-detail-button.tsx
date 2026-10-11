"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { reorderPastOrderAction } from "@/actions/customer-order.actions";
import { formatReorderErrorMessage } from "@/components/orders/reorder-error";
import { useCartStore } from "@/lib/stores/cart-store";
import { cn } from "@/lib/utils";

export function ReorderDetailButton({
  orderId,
  isPast,
}: {
  orderId: string;
  isPast?: boolean;
}) {
  const router = useRouter();
  const t = useTranslations("orders");
  const [isReordering, setIsReordering] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const restoreCartFromOrder = useCartStore((s) => s.restoreCartFromOrder);
  const setCustomerNeighborhoodId = useCartStore((s) => s.setCustomerNeighborhoodId);

  if (!isPast) return null;

  const handleReorder = async () => {
    setIsReordering(true);
    setErrorMessage(null);

    try {
      const res = await reorderPastOrderAction(orderId);
      if (!res.success || !res.data) {
        setErrorMessage(formatReorderErrorMessage(res.errorCode || res.error, t));
        return;
      }

      restoreCartFromOrder(
        res.data.houseId,
        res.data.houseName,
        res.data.items
      );
      setCustomerNeighborhoodId(res.data.neighborhoodId);
      router.push("/cart");
    } catch {
      setErrorMessage(t("orderAgainGenericError"));
    } finally {
      setIsReordering(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        onClick={handleReorder}
        disabled={isReordering}
        className="w-full sm:w-auto font-black bg-violet-600 hover:bg-violet-700 text-white text-xs sm:text-sm flex items-center gap-2 cursor-pointer"
      >
        <RotateCcw className={cn("size-4", isReordering && "animate-spin")} />
        <span>{isReordering ? t("orderAgainLoading") : t("orderAgain")}</span>
      </Button>
      {errorMessage && (
        <p className="text-xs text-rose-600 font-medium">{errorMessage}</p>
      )}
    </div>
  );
}
