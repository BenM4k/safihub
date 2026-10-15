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
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-amber-900">
        <AlertTriangle className="size-4 text-warning-base shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Vérification finale avant validation comptable</p>
          <p className="text-xs text-amber-800 leading-relaxed">
            Cette opération créera les écritures définitives dans le grand livre de caisse
            et verrouillera cette journée pour ce coursier.
          </p>
        </div>
      </div>

      <div className="p-4 bg-surface rounded-xl border border-border space-y-2.5">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Coursier :</span>
          <span className="font-bold text-heading">{courierName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Date d&apos;activité :</span>
          <span className="font-mono font-medium text-heading">{businessDate}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Montant attendu :</span>
          <span className="font-mono font-medium">{formatMoney(expectedAmount)}</span>
        </div>
        <div className="flex justify-between border-t border-border pt-2">
          <span className="text-heading font-semibold">Montant physique remis :</span>
          <span className="font-mono font-bold text-heading text-sm">
            {formatMoney(receivedAmount)}
          </span>
        </div>

        <div className="flex justify-between items-center border-t border-border pt-2">
          <span className="text-muted-foreground">Écart constaté :</span>
          <div className="flex items-center gap-1.5 font-mono font-bold">
            {diffInfo.isZero ? (
              <span className="text-success-base flex items-center gap-1">
                <CheckCircle2 className="size-3.5" /> Aucun écart (0 CDF)
              </span>
            ) : diffInfo.isShortage ? (
              <span className="text-destructive-base flex items-center gap-1">
                <ShieldAlert className="size-3.5" /> {diffInfo.formattedAmount} (Manquant)
              </span>
            ) : (
              <span className="text-warning-base flex items-center gap-1">
                <AlertTriangle className="size-3.5" /> {diffInfo.formattedAmount} (Excédent)
              </span>
            )}
          </div>
        </div>

        {deductFromDeposit && diff < 0 && (
          <div className="text-xs text-destructive-base bg-destructive-light p-2 rounded border border-destructive-base/20 font-medium">
            Déduction automatique du déficit sur la caution du coursier autorisée.
          </div>
        )}

        {note && (
          <div className="border-t border-border pt-2">
            <span className="text-muted-foreground block text-xs mb-0.5">Note enregistrée :</span>
            <p className="font-medium text-heading italic">&ldquo;{note}&rdquo;</p>
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
          className="min-h-[40px] px-4 text-xs font-semibold"
        >
          {t("modifyInput")}
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={onConfirm}
          disabled={loading}
          className="min-h-[40px] px-4 text-xs font-semibold bg-primary hover:bg-primary-hover text-white"
        >
          {loading ? "Enregistrement..." : t("confirmFinal")}
        </Button>
      </div>
    </div>
  );
}
