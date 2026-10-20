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
    <div className="bg-primary/10 rounded-3xl border border-primary/20 p-5 sm:p-6 text-foreground space-y-4">
      <div className="flex items-start gap-3">
        <Sparkles className="size-5 text-primary shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm space-y-1">
          <p className="font-bold text-heading">{t("readyForDeliveryTitle")}</p>
          <p className="text-muted-foreground leading-relaxed">
            {t("readyForDeliveryDesc")}
          </p>
        </div>
      </div>

      <div className="p-3.5 bg-card rounded-2xl border border-border flex items-center gap-3">
        <Calendar className="size-5 text-primary shrink-0" />
        <div className="text-xs">
          <span className="font-bold text-foreground block">Créneau proposé par l&apos;atelier :</span>
          <span className="text-primary font-black text-sm">
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
        <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold">
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
