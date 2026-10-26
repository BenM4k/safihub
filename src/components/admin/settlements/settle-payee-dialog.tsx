"use client";

import { Building2, Bike, AlertCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SettleFormFields } from "./settle-form-fields";
import { SettleConfirmReview } from "./settle-confirm-review";
import { useSettlePayee } from "./use-settle-payee";
import type { PayeeSettlementTarget, SettlementReceiptData } from "./types";

interface SettlePayeeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  target: PayeeSettlementTarget | null;
  defaultPeriod?: string;
  onSettlementSuccess: (receipt: SettlementReceiptData) => void;
}

export function SettlePayeeDialog({
  isOpen,
  onClose,
  target,
  defaultPeriod = "",
  onSettlementSuccess,
}: SettlePayeeDialogProps) {
  const {
    step,
    setStep,
    amount,
    setAmount,
    method,
    setMethod,
    reference,
    setReference,
    period,
    setPeriod,
    note,
    setNote,
    errorMsg,
    isSubmitting,
    handleNextToConfirm,
    handleFinalSubmit,
  } = useSettlePayee({
    target,
    defaultPeriod,
    onSettlementSuccess,
    onClose,
  });

  if (!target) return null;

  const isHouse = target.type === "house";
  const title = isHouse ? "Régler le pressing" : "Payer le coursier";
  const Icon = isHouse ? Building2 : Bike;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Icon className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-sm font-bold text-foreground">
                {title} · {target.name}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">{target.subtitle}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {errorMsg && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
            </Alert>
          )}

          {step === 1 ? (
            <form id="settle-form" onSubmit={handleNextToConfirm} className="space-y-4">
              <SettleFormFields
                target={target}
                amount={amount}
                onAmountChange={setAmount}
                method={method}
                onMethodChange={setMethod}
                reference={reference}
                onReferenceChange={setReference}
                note={note}
                onNoteChange={setNote}
                period={period}
                onPeriodChange={setPeriod}
              />
              <DialogFooter className="gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  className="h-10 px-4 text-xs font-semibold"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="h-10 px-4 text-xs font-semibold gap-1.5"
                >
                  <span>Continuer</span>
                  <ArrowRight className="size-3.5" />
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <div className="space-y-4">
              <SettleConfirmReview
                target={target}
                amount={amount}
                method={method}
                reference={reference}
                period={period}
                note={note}
              />
              <DialogFooter className="gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setStep(1)}
                  disabled={isSubmitting}
                  className="h-10 px-3 text-xs font-semibold gap-1"
                >
                  <ArrowLeft className="size-3.5" />
                  <span>Modifier</span>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting}
                  className="h-10 px-4 text-xs font-semibold"
                >
                  {isSubmitting ? "Enregistrement..." : "Confirmer le paiement"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
