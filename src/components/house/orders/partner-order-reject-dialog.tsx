"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import type { PartnerOrderListItemDTO } from "@/dal/partner-order.dal";

interface PartnerOrderRejectDialogProps {
  order: PartnerOrderListItemDTO | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (orderId: string, reason: string) => Promise<void>;
}

export function PartnerOrderRejectDialog({
  order,
  isOpen,
  onClose,
  onConfirm,
}: PartnerOrderRejectDialogProps) {
  const t = useTranslations("house.orders");
  const [selectedReason, setSelectedReason] = useState("Capacité journalière atteinte");
  const [customDetails, setCustomDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !order) return null;

  const presetReasons = [
    "Capacité journalière atteinte",
    "Panne de courant ou d'eau à l'atelier",
    "Produit ou tissu non pris en charge",
    "Délai demandé trop court",
    "Autre motif exceptionnel",
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const finalReason = customDetails.trim()
      ? `${selectedReason} : ${customDetails.trim()}`
      : selectedReason;

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await onConfirm(order!.id, finalReason);
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Erreur lors du refus de la commande.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reject-dialog-title"
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
    >
      <div className="bg-card rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-border space-y-4 font-sans">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 id="reject-dialog-title" className="text-base font-bold text-heading font-display">
              {t("rejectModalTitle")} ({order.shortReference})
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {t("rejectModalDesc")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="text-muted-foreground hover:text-foreground p-1 rounded-lg"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Warning banner */}
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-900 flex items-start gap-2.5">
          <AlertTriangle className="size-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-900 dark:text-amber-200 font-medium leading-relaxed">
            {t("rejectWarningRate")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              {t("rejectReasonLabel")}
            </label>
            <div className="space-y-1.5">
              {presetReasons.map((reason) => (
                <label
                  key={reason}
                  className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-surface text-xs font-medium cursor-pointer"
                >
                  <input
                    type="radio"
                    name="rejectReason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="text-primary focus:ring-primary"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <textarea
              rows={2}
              value={customDetails}
              onChange={(e) => setCustomDetails(e.target.value)}
              placeholder="Précisions supplémentaires facultatives..."
              className="w-full text-xs rounded-xl border border-border bg-surface text-foreground p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {errorMsg && (
            <p className="text-xs text-destructive font-medium">{errorMsg}</p>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs min-h-[44px] sm:min-h-[36px]"
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="bg-destructive hover:bg-destructive/90 text-white font-bold text-xs min-h-[44px] sm:min-h-[36px]"
            >
              {isSubmitting && <Loader2 className="size-3.5 animate-spin mr-1.5" />}
              <span>{t("confirmReject")}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
