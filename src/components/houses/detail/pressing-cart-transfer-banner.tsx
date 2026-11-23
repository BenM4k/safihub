"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "@ui-sdk/react/toast";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CustomerHouseCatalogueItem } from "@/dal";
import type { CartTransferResult } from "@/lib/stores/cart-store";

interface PressingCartTransferBannerProps {
  houseId: string;
  houseName: string;
  items: CustomerHouseCatalogueItem[];
  cartHouseId: string | null;
  cartItemsCount: number;
  isHydrated: boolean;
  onTransfer: (
    houseId: string,
    houseName: string,
    items: CustomerHouseCatalogueItem[]
  ) => CartTransferResult;
  onClearCart: () => void;
}

/**
 * Displays a banner when the customer has a cart from another house, allowing
 * them to transfer matching items or clear the cart with clear feedback when
 * some or all items do not match the current house's catalogue.
 */
export function PressingCartTransferBanner({
  houseId,
  houseName,
  items,
  cartHouseId,
  cartItemsCount,
  isHydrated,
  onTransfer,
  onClearCart,
}: PressingCartTransferBannerProps) {
  const t = useTranslations("customerHouses");
  const [failedTransferSnapshot, setFailedTransferSnapshot] = useState<{
    items: CustomerHouseCatalogueItem[];
    cartHouseId: string | null;
    cartItemsCount: number;
  } | null>(null);

  if (!isHydrated || !cartHouseId || cartHouseId === houseId || cartItemsCount === 0) {
    return null;
  }

  const noMatchDetected =
    failedTransferSnapshot !== null &&
    failedTransferSnapshot.items === items &&
    failedTransferSnapshot.cartHouseId === cartHouseId &&
    failedTransferSnapshot.cartItemsCount === cartItemsCount;

  const handleTransferClick = () => {
    const result = onTransfer(houseId, houseName, items);

    if (!result.transferred) {
      setFailedTransferSnapshot({ items, cartHouseId, cartItemsCount });
      toast.warning(t("cartTransferNoMatchToast", { houseName }));
      return;
    }

    setFailedTransferSnapshot(null);

    if (result.unmatchedCount > 0) {
      toast.warning(
        t("cartTransferPartialToast", {
          matched: result.matchedCount,
          unmatched: result.unmatchedCount,
          houseName,
        })
      );
      return;
    }

    toast.success(
      t("cartTransferSuccessToast", {
        count: result.matchedCount,
        houseName,
      })
    );
  };

  if (noMatchDetected) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <div
          role="alert"
          className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-foreground"
        >
          <div className="flex items-start gap-2.5 text-xs sm:text-sm">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-heading">
                {t("cartTransferNoMatchTitle", { houseName })}
              </p>
              <p className="text-muted-foreground mt-0.5">
                {t("cartTransferNoMatchDescription", { count: cartItemsCount })}
              </p>
            </div>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="font-bold border-amber-500/40 hover:bg-amber-500/15 shrink-0 rounded-lg"
            onClick={() => {
              setFailedTransferSnapshot(null);
              onClearCart();
            }}
          >
            {t("cartTransferClearButton")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
      <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-foreground">
        <div className="text-xs sm:text-sm">
          <span className="font-bold text-heading">
            {t("cartTransferTitle", { count: cartItemsCount })}
          </span>{" "}
          {t("cartTransferDescription", { houseName })}
        </div>
        <Button
          type="button"
          size="sm"
          className="font-bold bg-primary hover:bg-primary/90 text-primary-foreground shrink-0 rounded-lg"
          onClick={handleTransferClick}
        >
          {t("cartTransferButton")}
        </Button>
      </div>
    </div>
  );
}
