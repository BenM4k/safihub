"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Sparkles, Calendar, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { confirmDeliverySlotAction } from "@/actions/customer-order.actions";
import { formatBukavuDateTime } from "@/services/availability/bukavu-time";

interface DeliverySlotConfirmationCardProps {
  orderId: string;
  status: string;
  deliverySlotStart: Date | null;
  deliverySlotEnd: Date | null;
  method?: "app" | "tracking_link";
}

export function DeliverySlotConfirmationCard({
  orderId,
  status,
  deliverySlotStart,
  deliverySlotEnd,
  method = "app",
}: DeliverySlotConfirmationCardProps) {
  const t = useTranslations("orders");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status !== "ready") return null;

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      const start = deliverySlotStart ?? new Date(Date.now() + 24 * 3600 * 1000);
      const end = deliverySlotEnd ?? new Date(Date.now() + 26 * 3600 * 1000);
      const res = await confirmDeliverySlotAction(
        orderId,
        start.toISOString(),
        end.toISOString(),
        method
      );
      if (!res.success) {
        setError(res.error || "Impossible de confirmer le créneau.");
      }
    } catch {
      setError("Erreur réseau inattendue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-purple-50/90 rounded-3xl border border-purple-200 p-5 sm:p-6 text-purple-950 space-y-4">
      <div className="flex items-start gap-3">
        <Sparkles className="size-5 text-purple-600 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm space-y-1">
          <p className="font-bold text-purple-950">{t("readyForDeliveryTitle")}</p>
          <p className="text-purple-900/90 leading-relaxed">
            {t("readyForDeliveryDesc")}
          </p>
        </div>
      </div>

      <div className="p-3.5 bg-white/80 rounded-2xl border border-purple-200 flex items-center gap-3">
        <Calendar className="size-5 text-purple-600 shrink-0" />
        <div className="text-xs">
          <span className="font-bold text-slate-800 block">Créneau proposé par l&apos;atelier :</span>
          <span className="text-purple-950 font-black text-sm">
            {deliverySlotStart ? (
              <>
                {formatBukavuDateTime(deliverySlotStart)}
                {deliverySlotEnd && ` — ${new Date(deliverySlotEnd).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`}
              </>
            ) : (
              "Demain à partir de 09:00"
            )}
          </span>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-white border border-rose-300 text-rose-700 text-xs font-semibold">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 pt-1">
        <Button
          type="button"
          disabled={loading}
          onClick={handleConfirm}
          className="font-bold bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm"
        >
          {loading ? <Loader2 className="size-3.5 animate-spin mr-1.5" /> : <Check className="size-4 mr-1.5" />}
          {t("confirmSlot")}
        </Button>
      </div>
    </div>
  );
}
