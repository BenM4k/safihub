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
  trackingToken?: string;
}

export function PriceAdjustmentCard({
  orderId,
  status,
  totalDue,
  items,
  method = "app",
  trackingToken,
}: PriceAdjustmentCardProps) {
  const t = useTranslations("orders");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status !== "price_adjusted") return null;

  const handleApprove = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await approvePriceAdjustmentAction(orderId, method, trackingToken);
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
        "Ajustement refusé par le client",
        trackingToken
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
    <div className="bg-orange-500/10 rounded-3xl border border-orange-500/20 p-5 sm:p-6 text-orange-700 dark:text-orange-300 space-y-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="size-5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm space-y-1">
          <p className="font-bold text-orange-700 dark:text-orange-300">{t("priceAdjustmentTitle")}</p>
          <p className="text-orange-600/90 dark:text-orange-400/90 leading-relaxed">
            {t("priceAdjustmentDesc", { amount: totalDue.toLocaleString() })}
          </p>
        </div>
      </div>

      {discrepancies.length > 0 && (
        <div className="p-3 bg-card rounded-2xl border border-border space-y-1.5 text-xs">
          <span className="font-bold text-heading block">Détails constatés à l&apos;atelier :</span>
          {discrepancies.map((it) => (
            <div key={it.id} className="flex justify-between text-muted-foreground">
              <span>{it.itemNameFr || "Article"} :</span>
              <span className="font-medium text-foreground">
                {it.status === "returned"
                  ? "Non accepté (sera retourné)"
                  : `Quantité : ${it.receivedQuantity} reçu(s) (déclaré: ${it.declaredQuantity})`}
              </span>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-card border border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs font-semibold">
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
          className="border-orange-500/30 text-orange-700 dark:text-orange-300 hover:bg-orange-500/10 text-xs sm:text-sm"
        >
          <X className="size-4 mr-1.5" />
          {t("declineAdjustment")}
        </Button>
      </div>
    </div>
  );
}
