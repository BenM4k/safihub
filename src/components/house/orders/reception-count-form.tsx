"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, Check, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { submitHouseReceptionAction } from "@/actions/house.actions";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ReceptionItemRow,
  type ReceptionItemState,
} from "./reception-item-row";
import type { OrderItemRecord } from "@/dal";

interface ReceptionCountFormProps {
  orderId: string;
  houseId?: string;
  items: OrderItemRecord[];
}

/**
 * Critical 3-point count input form with discrepancy detection and price adjustment alerts.
 */
export function ReceptionCountForm({
  orderId,
  houseId,
  items,
}: ReceptionCountFormProps) {
  const t = useTranslations("house.reception");
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [itemStates, setItemStates] = useState<ReceptionItemState[]>(() =>
    items.map((it) => ({
      orderItemId: it.id,
      itemName: it.itemNameFr ?? it.customLabel ?? "Article",
      fabricName: it.fabricNameFr ?? "Standard",
      declaredQuantity: it.declaredQuantity,
      receivedQuantity:
        it.receivedQuantity !== null ? it.receivedQuantity : it.declaredQuantity,
      unitPrice: it.unitPrice,
      isExplicitlyRejected: it.status === "returned",
    }))
  );

  function handleQuantityChange(orderItemId: string, val: number) {
    setItemStates((prev) =>
      prev.map((it) =>
        it.orderItemId === orderItemId
          ? { ...it, receivedQuantity: Math.max(0, val) }
          : it
      )
    );
  }

  function handleToggleReject(orderItemId: string) {
    setItemStates((prev) =>
      prev.map((it) =>
        it.orderItemId === orderItemId
          ? { ...it, isExplicitlyRejected: !it.isExplicitlyRejected }
          : it
      )
    );
  }

  let hasDiscrepancy = false;
  let returnedCount = 0;

  for (const it of itemStates) {
    if (it.isExplicitlyRejected) {
      hasDiscrepancy = true;
      returnedCount += it.receivedQuantity;
    } else if (it.receivedQuantity !== it.declaredQuantity) {
      hasDiscrepancy = true;
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    startTransition(async () => {
      const payload = itemStates.map((it) => ({
        orderItemId: it.orderItemId,
        receivedQuantity: it.receivedQuantity,
        isExplicitlyRejectedByHouse: it.isExplicitlyRejected,
      }));

      const res = await submitHouseReceptionAction({
        orderId,
        houseId,
        itemCounts: payload,
      });

      if (!res.ok) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg(
          res.value.hasPriceAdjustment ? t("countGapAlert") : t("readySuccess")
        );
      }
    });
  }

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-xs space-y-4 p-5 sm:p-6 font-sans">
      <div className="border-b border-border pb-3">
        <h2 className="text-base font-bold text-heading">{t("title")}</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{t("subtitle")}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="divide-y divide-border border border-border rounded-xl overflow-hidden bg-card">
          {itemStates.map((item) => (
            <ReceptionItemRow
              key={item.orderItemId}
              item={item}
              onQuantityChange={(val) =>
                handleQuantityChange(item.orderItemId, val)
              }
              onToggleReject={() => handleToggleReject(item.orderItemId)}
              declaredLabel={t("declaredCol")}
              unitPriceLabel={t("unitPriceCol")}
              receivedLabel={t("receivedCol")}
              excludeLabel={t("markExcluded")}
              excludedLabel={t("returnedExcluded")}
            />
          ))}
        </div>

        {/* Live Discrepancy Alert */}
        {hasDiscrepancy ? (
          <Alert
            variant="destructive"
            className="border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200 py-3"
          >
            <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400" />
            <AlertTitle className="text-xs font-bold text-amber-900 dark:text-amber-200">
              {t("adjustmentWarning")}
            </AlertTitle>
            <AlertDescription className="text-xs mt-0.5 text-amber-800 dark:text-amber-300">
              {t("countGapAlert")}
              {returnedCount > 0 && (
                <span className="block mt-1 font-semibold">
                  {t("excludedItemAlert")}
                </span>
              )}
            </AlertDescription>
          </Alert>
        ) : (
          <Alert variant="success" className="py-3">
            <Check className="size-4" />
            <AlertDescription className="text-xs">
              {t("accepted")}
            </AlertDescription>
          </Alert>
        )}

        {errorMsg && (
          <p className="text-xs text-destructive font-semibold">{errorMsg}</p>
        )}
        {successMsg && (
          <p className="text-xs text-success font-semibold">{successMsg}</p>
        )}

        <Button
          type="submit"
          disabled={isPending}
          className="w-full bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs py-2.5 shadow-xs cursor-pointer"
        >
          {isPending && <Loader2 className="size-3.5 animate-spin mr-1.5" />}
          <span>{t("submitCount")}</span>
        </Button>
      </form>
    </div>
  );
}
