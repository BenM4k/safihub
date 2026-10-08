"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { cancelOrderAction } from "@/actions/customer-order.actions";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";

interface OrderCancelCardProps {
  orderId: string;
  status: string;
}

export function OrderCancelCard({ orderId, status }: OrderCancelCardProps) {
  const t = useTranslations("orders");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  if (status !== "created") return null;

  const handleCancel = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await cancelOrderAction(orderId, "Annulation demandée par le client avant prise en charge");
      if (!res.success) {
        setError(res.error || "Une erreur est survenue lors de l'annulation.");
      }
    } catch {
      setError("Erreur réseau inattendue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-rose-50/60 rounded-3xl border border-rose-200/80 p-5 sm:p-6 text-rose-950 space-y-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="size-5 text-rose-600 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm">
          <p className="font-bold text-rose-900">Annulation de commande</p>
          <p className="text-rose-700/90 mt-0.5 leading-relaxed">
            {t("cancelConfirm")}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-white border border-rose-300 text-rose-700 text-xs font-semibold">
          {error}
        </div>
      )}

      {showConfirm ? (
        <div className="flex items-center gap-3 pt-1">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={loading}
            onClick={handleCancel}
            className="font-bold text-xs"
          >
            {loading ? <Loader2 className="size-3.5 animate-spin mr-1.5" /> : null}
            Confirmer l&apos;annulation
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={() => setShowConfirm(false)}
            className="text-xs"
          >
            Retour
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowConfirm(true)}
          className="bg-white text-rose-700 border-rose-300 hover:bg-rose-100 font-bold text-xs"
        >
          {t("cancelOrder")}
        </Button>
      )}
    </div>
  );
}
