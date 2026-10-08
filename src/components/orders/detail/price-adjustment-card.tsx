"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  approvePriceAdjustmentAction,
  declinePriceAdjustmentAction,
} from "@/actions/customer-order.actions";
import type { OrderItemRecord } from "@/dal";

interface PriceAdjustmentCardProps {
  orderId: string;
  status: string;
  totalDue: number;
  items: OrderItemRecord[];
  method?: "app" | "tracking_link";
}

export function PriceAdjustmentCard({
  orderId,
  status,
  totalDue,
  items,
  method = "app",
}: PriceAdjustmentCardProps) {
  const t = useTranslations("orders");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status !== "price_adjusted") return null;

  const handleApprove = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await approvePriceAdjustmentAction(orderId, method);
      if (!res.success) {
        setError(res.error || "Impossible de valider l'ajustement.");
      }
    } catch {
      setError("Erreur réseau inattendue.");
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await declinePriceAdjustmentAction(
        orderId,
        method,
        "Ajustement refusé par le client"
      );
      if (!res.success) {
        setError(res.error || "Impossible de refuser l'ajustement.");
      }
    } catch {
      setError("Erreur réseau inattendue.");
    } finally {
      setLoading(false);
    }
  };

  const discrepancies = items.filter(
    (it) =>
      it.isFlagged ||
      it.status === "returned" ||
      (it.receivedQuantity !== null && it.receivedQuantity !== it.declaredQuantity)
  );

  return (
    <div className="bg-orange-50/90 rounded-3xl border border-orange-200 p-5 sm:p-6 text-orange-950 space-y-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="size-5 text-orange-600 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm space-y-1">
          <p className="font-bold text-orange-950">{t("priceAdjustmentTitle")}</p>
          <p className="text-orange-900/90 leading-relaxed">
            {t("priceAdjustmentDesc", { amount: totalDue.toLocaleString() })}
          </p>
        </div>
      </div>

      {discrepancies.length > 0 && (
        <div className="p-3 bg-white/80 rounded-2xl border border-orange-200/80 space-y-1.5 text-xs">
          <span className="font-bold text-orange-950 block">Détails constatés à l&apos;atelier :</span>
          {discrepancies.map((it) => (
            <div key={it.id} className="flex justify-between text-orange-900">
              <span>{it.itemNameFr || "Article"} :</span>
              <span className="font-medium">
                {it.status === "returned"
                  ? "Non accepté (sera retourné)"
                  : `Quantité : ${it.receivedQuantity} reçu(s) (déclaré: ${it.declaredQuantity})`}
              </span>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-white border border-rose-300 text-rose-700 text-xs font-semibold">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 pt-1">
        <Button
          type="button"
          disabled={loading}
          onClick={handleApprove}
          className="font-bold bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm"
        >
          {loading ? <Loader2 className="size-3.5 animate-spin mr-1.5" /> : <Check className="size-4 mr-1.5" />}
          {t("approveAdjustment")}
        </Button>

        <Button
          type="button"
          variant="outline"
          disabled={loading}
          onClick={handleDecline}
          className="border-orange-300 text-orange-900 hover:bg-orange-100 text-xs sm:text-sm"
        >
          <X className="size-4 mr-1.5" />
          {t("declineAdjustment")}
        </Button>
      </div>
    </div>
  );
}
