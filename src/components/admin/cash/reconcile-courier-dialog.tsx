"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { confirmDailyReconciliationAction } from "@/actions/admin-cash.actions";
import { getDiscrepancyInfo } from "@/lib/cash-formatters";
import { Scale, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && !loading && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
              <Scale className="size-4.5" aria-hidden="true" />
            </div>
            <div>
              <DialogTitle className="text-sm font-bold font-display">
                {isReviewStep ? t("reconcileConfirmationTitle") : t("reconcileDialogTitle")}
              </DialogTitle>
              <DialogDescription className="text-2xs text-muted-foreground">
                {courier.name ?? courier.courierId} · {businessDate}
              </DialogDescription>
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
            <div className="p-4 bg-muted/40 rounded-xl border border-border text-center space-y-3">
              <p className="text-xs font-semibold text-muted-foreground">
                {t("noOrdersToday")}
              </p>
              <Button type="button" variant="outline" size="sm" onClick={onClose} className="h-9">
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
      </DialogContent>
    </Dialog>
  );
}
