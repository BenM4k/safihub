"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, Check, Loader2, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { submitHouseReceptionAction } from "@/actions/house.actions";
import { Button } from "@/components/ui/button";
import type { OrderItemRecord } from "@/dal";

interface ItemState {
  orderItemId: string;
  itemName: string;
  fabricName: string;
  declaredQuantity: number;
  receivedQuantity: number;
  unitPrice: number;
  isExplicitlyRejected: boolean;
}

export function ReceptionCountForm({
  orderId,
  houseId,
  items,
}: {
  orderId: string;
  houseId?: string;
  items: OrderItemRecord[];
}) {
  const t = useTranslations("house.reception");
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [itemStates, setItemStates] = useState<ItemState[]>(() =>
    items.map((it) => ({
      orderItemId: it.id,
      itemName: it.itemNameFr ?? it.customLabel ?? "Article",
      fabricName: it.fabricNameFr ?? "Standard",
      declaredQuantity: it.declaredQuantity,
      receivedQuantity: it.receivedQuantity !== null ? it.receivedQuantity : it.declaredQuantity,
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

  // Calculate discrepancies
  let hasDiscrepancy = false;
  let returnedCount = 0;

  for (const it of itemStates) {
    if (it.isExplicitlyRejected) {
      hasDiscrepancy = true;
      returnedCount += it.receivedQuantity;
      // Excluded item is 0 CDF in cleaning total!
    } else {
      if (it.receivedQuantity !== it.declaredQuantity) {
        hasDiscrepancy = true;
      }
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
          res.value.hasPriceAdjustment
            ? "Comptage validé avec ajustement de prix (en attente d'approbation client)."
            : "Comptage conforme validé ! Lavage en cours."
        );
      }
    });
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-4 p-5 sm:p-6">
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-base font-bold text-slate-900">{t("title")}</h2>
        <p className="text-xs text-slate-500 mt-0.5">{t("subtitle")}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
          {itemStates.map((item) => (
            <div
              key={item.orderItemId}
              className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                item.isExplicitlyRejected ? "bg-rose-50/40" : "hover:bg-slate-50/50"
              }`}
            >
              <div className="space-y-0.5">
                <span className="font-bold text-xs text-slate-900 block">
                  {item.itemName} ({item.fabricName})
                </span>
                <span className="text-[11px] text-slate-500">
                  Déclaré: <strong>{item.declaredQuantity}</strong> • Prix unitaire:{" "}
                  <strong>{item.unitPrice.toLocaleString()} CDF</strong>
                </span>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                <div className="flex items-center gap-1.5">
                  <label className="text-xs font-semibold text-slate-600">Reçu:</label>
                  <input
                    type="number"
                    min={0}
                    value={item.receivedQuantity}
                    onChange={(e) =>
                      handleQuantityChange(item.orderItemId, parseInt(e.target.value) || 0)
                    }
                    className="w-16 h-8 text-center text-xs font-bold rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600"
                  />
                </div>

                {/* AC 10 exclusion toggle button */}
                <button
                  type="button"
                  onClick={() => handleToggleReject(item.orderItemId)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                    item.isExplicitlyRejected
                      ? "bg-rose-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <RotateCcw className="size-3" />
                  <span>{item.isExplicitlyRejected ? "Exclu (Retour)" : "Exclure (AC 10)"}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Live Discrepancy Alert */}
        {hasDiscrepancy ? (
          <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2.5 text-xs text-amber-800">
            <AlertTriangle className="size-4 shrink-0 mt-0.5 text-amber-600" />
            <div>
              <p className="font-bold">{t("adjustmentWarning")}</p>
              <p className="mt-0.5">{t("countGapAlert")}</p>
              {returnedCount > 0 && <p className="mt-1 font-semibold">{t("excludedItemAlert")}</p>}
            </div>
          </div>
        ) : (
          <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-800">
            <Check className="size-4 text-emerald-600" />
            <span>Comptage conforme aux pièces déclarées. Aucun ajustement de prix nécessaire.</span>
          </div>
        )}

        {errorMsg && (
          <p className="text-xs text-rose-600 font-semibold">{errorMsg}</p>
        )}
        {successMsg && (
          <p className="text-xs text-emerald-600 font-semibold">{successMsg}</p>
        )}

        <Button
          type="submit"
          disabled={isPending}
          className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs py-2.5 shadow-xs"
        >
          {isPending ? <Loader2 className="size-3.5 animate-spin mr-1.5" /> : null}
          <span>{t("submitCount")}</span>
        </Button>
      </form>
    </div>
  );
}
