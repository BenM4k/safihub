"use client";

import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { PartnerOrderListItemDTO } from "@/dal/partner-order.dal";

interface PartnerOrderRejectDialogProps {
  order: PartnerOrderListItemDTO | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (orderId: string, reason: string) => Promise<void>;
}

const PRESET_REASONS = [
  "Capacité journalière atteinte",
  "Panne de courant ou d'eau à l'atelier",
  "Produit ou tissu non pris en charge",
  "Délai demandé trop court",
  "Autre motif exceptionnel",
];

/**
 * Dialog for rejecting an order with preset reasons using shadcn Dialog and Textarea.
 */
export function PartnerOrderRejectDialog({
  order,
  isOpen,
  onClose,
  onConfirm,
}: PartnerOrderRejectDialogProps) {
  const t = useTranslations("house.orders");
  const [selectedReason, setSelectedReason] = useState(PRESET_REASONS[0]);
  const [customDetails, setCustomDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [prevOrderId, setPrevOrderId] = useState(order?.id);
  if (order?.id !== prevOrderId) {
    setPrevOrderId(order?.id);
    setSelectedReason(PRESET_REASONS[0]);
    setCustomDetails("");
    setErrorMsg(null);
  }

  function handleClose() {
    setSelectedReason(PRESET_REASONS[0]);
    setCustomDetails("");
    setErrorMsg(null);
    onClose();
  }

  if (!order) return null;

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
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Erreur lors du refus de la commande."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl bg-card border border-border p-6 space-y-4 font-sans">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <DialogTitle className="font-display font-bold text-base sm:text-lg text-heading text-left tracking-tight">
                {t("rejectModalTitle")} ({order.shortReference})
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 text-left leading-relaxed">
                {t("rejectModalDesc")}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs leading-relaxed">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-heading block">
              {t("rejectReasonLabel")}
            </Label>
            <div className="grid gap-2">
              {PRESET_REASONS.map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center gap-2.5 p-2.5 rounded-lg text-xs font-medium cursor-pointer transition ${
                    selectedReason === reason
                      ? "bg-primary/10 text-heading font-semibold"
                      : "text-foreground hover:bg-surface"
                  }`}
                >
                  <input
                    type="radio"
                    name="reject_reason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={() => setSelectedReason(reason)}
                    className="accent-primary size-4 cursor-pointer"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            <Textarea
              value={customDetails}
              onChange={(e) => setCustomDetails(e.target.value)}
              placeholder={t("optionalDetailsPlaceholder")}
              rows={2}
              className="w-full mt-2 text-base sm:text-xs rounded-xl border border-border"
            />
          </div>

          <DialogFooter className="flex flex-row items-center justify-end gap-2.5 pt-3 border-t border-border sm:space-x-0">
            <Button
              type="button"
              variant="ghost"
              disabled={isSubmitting}
              onClick={handleClose}
              className="flex-1 sm:flex-initial text-xs font-semibold cursor-pointer h-10 sm:h-9 rounded-lg"
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={isSubmitting}
              className="flex-1 sm:flex-initial text-xs font-bold text-white min-w-[130px] cursor-pointer h-10 sm:h-9 rounded-lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                  {t("rejecting")}
                </>
              ) : (
                t("confirmReject")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
