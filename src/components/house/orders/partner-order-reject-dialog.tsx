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
import { Alert, AlertDescription } from "@/components/ui/alert";
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
      <DialogContent className="sm:max-w-md rounded-3xl bg-card border-border p-6 space-y-4">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-2xl bg-destructive-soft text-destructive flex items-center justify-center shrink-0">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <DialogTitle className="font-display font-black text-base text-heading text-left">
                {t("rejectModalTitle")} ({order.shortReference})
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground text-left">
                {t("rejectModalDesc")}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {errorMsg && (
          <Alert variant="destructive" className="py-2.5">
            <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-bold text-heading block">
              {t("rejectReasonLabel")}
            </Label>
            <div className="grid gap-2">
              {PRESET_REASONS.map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-medium cursor-pointer transition ${
                    selectedReason === reason
                      ? "bg-primary-soft border-primary text-heading font-semibold"
                      : "border-border text-foreground hover:bg-surface"
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
              className="w-full mt-2 text-xs"
            />
          </div>

          <DialogFooter className="flex items-center justify-end gap-2 pt-2 border-t border-border sm:space-x-0">
            <Button
              type="button"
              variant="ghost"
              disabled={isSubmitting}
              onClick={handleClose}
              className="text-xs font-semibold cursor-pointer"
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="text-xs font-bold bg-destructive hover:bg-destructive/90 text-destructive-foreground min-w-[120px] cursor-pointer"
            >
              {isSubmitting && (
                <Loader2 className="size-3.5 mr-1.5 animate-spin" />
              )}
              {t("confirmReject")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
