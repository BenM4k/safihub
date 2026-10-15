"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatMoney, type DiscrepancyInfo } from "@/lib/cash-formatters";
import { CheckCircle2, ShieldAlert, AlertCircle } from "lucide-react";
import { ReconcileOrderBreakdown, type ReconcileOrder } from "./reconcile-order-breakdown";

interface ReconcileFormBodyProps {
  orders: ReconcileOrder[];
  expectedCashCDF: number;
  securityDeposit: number;
  receivedAmount: number;
  onChangeReceivedAmount: (val: number) => void;
  note: string;
  onChangeNote: (val: string) => void;
  deductFromDeposit: boolean;
  onChangeDeductFromDeposit: (val: boolean) => void;
  diffInfo: DiscrepancyInfo;
  hasZeroExpectedWithOrders: boolean;
  loading: boolean;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function ReconcileFormBody({
  orders,
  expectedCashCDF,
  securityDeposit,
  receivedAmount,
  onChangeReceivedAmount,
  note,
  onChangeNote,
  deductFromDeposit,
  onChangeDeductFromDeposit,
  diffInfo,
  hasZeroExpectedWithOrders,
  loading,
  onCancel,
  onSubmit,
}: ReconcileFormBodyProps) {
  const t = useTranslations("admin.cash");
  const isDiscrepancy = !diffInfo.isZero;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {hasZeroExpectedWithOrders && (
        <div className="p-3 bg-warning-light border border-warning-base/30 rounded-xl text-xs text-warning-base flex items-start gap-2">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span>{t("ordersExistZeroExpected")}</span>
        </div>
      )}

      <ReconcileOrderBreakdown orders={orders} expectedCashCDF={expectedCashCDF} />

      <div className="space-y-1.5">
        <Label htmlFor="received-amount-input" className="text-xs font-semibold text-heading">
          {t("receivedInputLabel")} <span className="text-destructive-base">*</span>
        </Label>
        <Input
          id="received-amount-input"
          type="number"
          min={0}
          step={1}
          required
          value={receivedAmount}
          onChange={(e) => onChangeReceivedAmount(Math.max(0, parseInt(e.target.value, 10) || 0))}
          className="font-mono text-base font-bold h-11 min-h-[40px]"
        />
      </div>

      {/* Live computed discrepancy */}
      <div className={`p-3 rounded-xl border flex items-center justify-between text-xs font-semibold ${diffInfo.bgClass} ${diffInfo.borderClass}`}>
        <div className="flex items-center gap-1.5">
          {diffInfo.isZero ? (
            <CheckCircle2 className="size-4 text-success-base" />
          ) : diffInfo.isShortage ? (
            <ShieldAlert className="size-4 text-destructive-base" />
          ) : (
            <AlertCircle className="size-4 text-warning-base" />
          )}
          <span>Écart de versement :</span>
        </div>
        <span className={`font-mono text-sm font-bold ${diffInfo.colorClass}`}>
          {diffInfo.formattedAmount} ({diffInfo.label})
        </span>
      </div>

      {diffInfo.isShortage && securityDeposit > 0 && (
        <label className="flex items-start gap-2.5 p-3 bg-warning-light/40 border border-warning-base/30 rounded-xl cursor-pointer">
          <input
            type="checkbox"
            checked={deductFromDeposit}
            onChange={(e) => onChangeDeductFromDeposit(e.target.checked)}
            className="mt-0.5 rounded text-primary focus:ring-primary size-4"
          />
          <span className="text-xs text-ink-800 font-medium leading-tight">
            {t("deductShortfall")} (caution disponible : {formatMoney(securityDeposit)})
          </span>
        </label>
      )}

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="reconcile-note-input" className="text-xs font-semibold text-heading">
            {t("noteLabel")} {isDiscrepancy && <span className="text-destructive-base">*</span>}
          </Label>
          {isDiscrepancy && (
            <span className="text-xs font-semibold text-destructive-base">Obligatoire si écart</span>
          )}
        </div>
        <Input
          id="reconcile-note-input"
          value={note}
          required={isDiscrepancy}
          onChange={(e) => onChangeNote(e.target.value)}
          placeholder={t("reconcileNotePlaceholder")}
          className="text-xs h-10 min-h-[40px]"
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={loading}
          className="min-h-[40px] px-4 text-xs font-semibold"
        >
          {t("cancelBtn")}
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={loading || (isDiscrepancy && !note.trim())}
          className="min-h-[40px] px-4 text-xs font-semibold bg-primary hover:bg-primary-hover text-white"
        >
          {t("confirmSubmit")}
        </Button>
      </div>
    </form>
  );
}
