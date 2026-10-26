"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMoney, getDiscrepancyInfo } from "@/lib/cash-formatters";

interface ReconcileConfirmationStepProps {
  courierName: string;
  businessDate: string;
  expectedAmount: number;
  receivedAmount: number;
  deductFromDeposit: boolean;
  note: string;
  loading: boolean;
  onBack: () => void;
  onConfirm: () => void;
}

export function ReconcileConfirmationStep({
  courierName,
  businessDate,
  expectedAmount,
  receivedAmount,
  deductFromDeposit,
  note,
  loading,
  onBack,
  onConfirm,
}: ReconcileConfirmationStepProps) {
  const t = useTranslations("admin.cash");

  const diff = receivedAmount - expectedAmount;
  const diffInfo = getDiscrepancyInfo(diff, "CDF");

  return (
    <div className="space-y-4 text-xs">
      <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2 text-amber-800 dark:text-amber-300">
        <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Vérification finale avant validation comptable</p>
          <p className="text-xs text-amber-700/90 dark:text-amber-400/90 leading-relaxed">
            Cette opération créera les écritures définitives dans le grand livre de caisse
            et verrouillera cette journée pour ce coursier.
          </p>
        </div>
      </div>

      <div className="p-4 bg-muted/30 rounded-xl border border-border space-y-2.5">
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t("filterCourier")} :</span>
          <span className="font-bold text-foreground">{courierName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t("accountingDate")} :</span>
          <span className="font-mono font-medium text-foreground">{businessDate}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t("totalExpected")} :</span>
          <span className="font-mono font-medium text-foreground">{formatMoney(expectedAmount)}</span>
        </div>
        <div className="flex justify-between border-t border-border pt-2">
          <span className="text-foreground font-semibold">{t("receivedInputLabel")} :</span>
          <span className="font-mono font-bold text-foreground text-sm">
            {formatMoney(receivedAmount)}
          </span>
        </div>

        <div className="flex justify-between items-center border-t border-border pt-2">
          <span className="text-muted-foreground">{t("discrepancyBadge")} :</span>
          <div className="flex items-center gap-1.5 font-mono font-bold">
            {diffInfo.isZero ? (
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="size-3.5" /> {t("zeroDiscrepancy")} (0 CDF)
              </span>
            ) : diffInfo.isShortage ? (
              <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <ShieldAlert className="size-3.5" /> {diffInfo.formattedAmount} ({t("deficit")})
              </span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <AlertTriangle className="size-3.5" /> {diffInfo.formattedAmount} ({t("surplus")})
              </span>
            )}
          </div>
        </div>

        {deductFromDeposit && diff < 0 && (
          <div className="text-xs text-destructive bg-destructive/10 p-2 rounded-lg border border-destructive/20 font-medium">
            {t("deductFromDepositConfirmed")}
          </div>
        )}

        {note && (
          <div className="border-t border-border pt-2">
            <span className="text-muted-foreground block text-xs mb-0.5">{t("noteLabel")} :</span>
            <p className="font-medium text-foreground italic">&ldquo;{note}&rdquo;</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onBack}
          disabled={loading}
          className="h-10 px-4 text-xs font-semibold"
        >
          {t("modifyInput")}
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={onConfirm}
          disabled={loading}
          className="h-10 px-4 text-xs font-semibold"
        >
          {loading ? t("saving") : t("confirmFinal")}
        </Button>
      </div>
    </div>
  );
}
