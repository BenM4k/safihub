"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Bike, X, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { settleHouseAction, settleCourierAction } from "@/actions/admin-settlements.actions";
import { SettleFormFields } from "./settle-form-fields";
import { SettleConfirmReview } from "./settle-confirm-review";
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
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [amount, setAmount] = useState<number>(target?.balanceOwedCDF ?? 0);
  const [method, setMethod] = useState<"mobile_money" | "bank" | "cash">("mobile_money");
  const [reference, setReference] = useState("");
  const [period, setPeriod] = useState(defaultPeriod);
  const [note, setNote] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !target) return null;

  const isHouse = target.type === "house";
  const title = isHouse ? "Régler le pressing" : "Payer le coursier";
  const Icon = isHouse ? Building2 : Bike;

  const handleNextToConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (amount <= 0) {
      setErrorMsg("Le montant doit être supérieur à zéro");
      return;
    }
    if (amount > target.balanceOwedCDF) {
      setErrorMsg(`Le montant ne peut pas dépasser ${target.balanceOwedCDF.toLocaleString()} CDF`);
      return;
    }
    if (method !== "cash" && !reference.trim()) {
      setErrorMsg("Une référence de transaction est obligatoire pour ce mode");
      return;
    }

    setStep(2);
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        amount,
        currency: "CDF" as const,
        method,
        reference: reference.trim() || undefined,
        period: period.trim() || undefined,
        note: note.trim() || undefined,
      };

      const res = isHouse
        ? await settleHouseAction({ ...payload, houseId: target.id })
        : await settleCourierAction({ ...payload, courierId: target.id });

      if (!res.ok) {
        setErrorMsg(res.error || "Échec de l'enregistrement du règlement");
        setStep(1);
        return;
      }

      const receipt: SettlementReceiptData = {
        settlementId: res.value.settlementId,
        payeeName: target.name,
        payeeType: target.type,
        payeeSubtitle: target.subtitle,
        amount,
        currency: "CDF",
        method,
        reference: reference.trim() || undefined,
        period: period.trim() || undefined,
        note: note.trim() || undefined,
        createdAt: new Date(),
        newBalanceCDF: res.value.newBalanceCDF,
      };

      router.refresh();
      onClose();
      onSettlementSuccess(receipt);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Une erreur inattendue est survenue"
      );
      setStep(1);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-lg bg-card rounded-2xl shadow-2xl border-2 border-border-strong overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b-2 border-border-strong flex items-center justify-between bg-surface">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
              <Icon className="size-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-heading">
                {title} · {target.name}
              </h2>
              <p className="text-xs text-muted-foreground">{target.subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-ink-500 hover:text-ink-800 rounded-lg hover:bg-ink-100 transition-colors"
            aria-label="Fermer"
          >
            <X className="size-4.5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-5 flex-1">
          {errorMsg && (
            <div className="mb-4 p-3 bg-destructive-light border-2 border-destructive-base/30 rounded-xl text-xs text-destructive-base font-medium">
              {errorMsg}
            </div>
          )}

          {step === 1 ? (
            <form id="settle-form" onSubmit={handleNextToConfirm}>
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
            </form>
          ) : (
            <SettleConfirmReview
              target={target}
              amount={amount}
              method={method}
              reference={reference}
              period={period}
              note={note}
            />
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t-2 border-border-strong bg-surface flex items-center justify-between gap-3">
          {step === 1 ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                className="min-h-[40px] px-4 font-semibold text-xs border-border-strong text-ink-700"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                form="settle-form"
                size="sm"
                className="min-h-[40px] px-4 font-semibold text-xs gap-1.5"
              >
                <span>Vérifier</span>
                <ArrowRight className="size-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStep(1)}
                disabled={isSubmitting}
                className="min-h-[40px] px-3 font-semibold text-xs border-border-strong text-ink-700 gap-1"
              >
                <ArrowLeft className="size-4" />
                <span>Modifier</span>
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="min-h-[40px] px-4 font-semibold text-xs gap-1.5 shadow-xs"
              >
                <CheckCircle2 className="size-4" />
                <span>{isSubmitting ? "Enregistrement..." : "Confirmer le décaissement"}</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
