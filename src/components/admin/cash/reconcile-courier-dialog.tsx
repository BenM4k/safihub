"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { confirmDailyReconciliationAction } from "@/actions/admin-cash.actions";
import { getDiscrepancyInfo } from "@/lib/cash-formatters";
import { X, Scale, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReconcileConfirmationStep } from "./reconcile-confirmation-step";
import { ReconcileFormBody } from "./reconcile-form-body";
import type { ReconcileOrder } from "./reconcile-order-breakdown";

export interface ReconcileCourierData {
  courierId: string;
  name: string | null;
  phone: string | null;
  expectedCashCDF: number;
  securityDeposit: number;
  orders?: ReconcileOrder[];
}

interface ReconcileCourierDialogProps {
  isOpen: boolean;
  onClose: () => void;
  courier: ReconcileCourierData;
  businessDate: string;
}

export function ReconcileCourierDialog({
  isOpen,
  onClose,
  courier,
  businessDate,
}: ReconcileCourierDialogProps) {
  const t = useTranslations("admin.cash");
  const router = useRouter();

  const [receivedAmount, setReceivedAmount] = useState<number>(courier.expectedCashCDF);
  const [note, setNote] = useState("");
  const [deductFromDeposit, setDeductFromDeposit] = useState(false);
  const [isReviewStep, setIsReviewStep] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const orders = courier.orders ?? [];
  const hasNoDeliveries = courier.expectedCashCDF === 0 && orders.length === 0;
  const hasZeroExpectedWithOrders = courier.expectedCashCDF === 0 && orders.length > 0;

  const diff = receivedAmount - courier.expectedCashCDF;
  const diffInfo = getDiscrepancyInfo(diff, "CDF");
  const isDiscrepancy = !diffInfo.isZero;

  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (isDiscrepancy && !note.trim()) {
      setErrorMsg(t("noteRequiredForDiscrepancy"));
      return;
    }

    if (hasZeroExpectedWithOrders && !note.trim()) {
      setErrorMsg("Une note est obligatoire lorsque le montant attendu est nul mais que des commandes existent.");
      return;
    }

    setIsReviewStep(true);
  };

  const handleFinalConfirm = async () => {
    setLoading(true);
    setErrorMsg(null);

    const res = await confirmDailyReconciliationAction({
      courierId: courier.courierId,
      businessDate,
      currency: "CDF",
      expectedAmount: courier.expectedCashCDF,
      receivedAmount: Number(receivedAmount),
      note: note.trim() || undefined,
      deductFromDeposit,
    });

    setLoading(false);
    if (!res.ok) {
      setErrorMsg(res.error || "Erreur de validation");
      setIsReviewStep(false);
      return;
    }

    router.refresh();
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reconcile-dialog-title"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        ref={dialogRef}
        className="w-full max-w-lg bg-card rounded-2xl shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-6"
      >
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-surface">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-primary-soft text-primary border border-primary/20 flex items-center justify-center">
              <Scale className="size-4.5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="reconcile-dialog-title" className="text-sm font-bold text-heading font-display">
                {isReviewStep ? t("reconcileConfirmationTitle") : t("reconcileDialogTitle")}
              </h2>
              <p className="text-2xs text-muted-foreground">
                {courier.name ?? courier.courierId} · {businessDate}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-1.5 text-ink-400 hover:text-ink-700 rounded-lg hover:bg-surface-hover transition-colors"
            aria-label="Fermer"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="p-5">
          {errorMsg && (
            <div role="alert" className="p-3 mb-4 bg-destructive-light border border-destructive-base/30 rounded-xl text-xs text-destructive-base font-medium flex items-start gap-2">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isReviewStep ? (
            <ReconcileConfirmationStep
              courierName={courier.name ?? courier.courierId}
              businessDate={businessDate}
              expectedAmount={courier.expectedCashCDF}
              receivedAmount={receivedAmount}
              deductFromDeposit={deductFromDeposit}
              note={note}
              loading={loading}
              onBack={() => setIsReviewStep(false)}
              onConfirm={handleFinalConfirm}
            />
          ) : hasNoDeliveries ? (
            <div className="p-4 bg-surface rounded-xl border border-border text-center space-y-3">
              <p className="text-xs font-semibold text-muted-foreground">
                {t("noOrdersToday")}
              </p>
              <Button type="button" variant="outline" size="sm" onClick={onClose} className="min-h-[40px]">
                Fermer
              </Button>
            </div>
          ) : (
            <ReconcileFormBody
              orders={orders}
              expectedCashCDF={courier.expectedCashCDF}
              securityDeposit={courier.securityDeposit}
              receivedAmount={receivedAmount}
              onChangeReceivedAmount={setReceivedAmount}
              note={note}
              onChangeNote={setNote}
              deductFromDeposit={deductFromDeposit}
              onChangeDeductFromDeposit={setDeductFromDeposit}
              diffInfo={diffInfo}
              hasZeroExpectedWithOrders={hasZeroExpectedWithOrders}
              loading={loading}
              onCancel={onClose}
              onSubmit={handleProceedToReview}
            />
          )}
        </div>
      </div>
    </div>
  );
}
