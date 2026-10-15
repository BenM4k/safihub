"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  holdCourierDepositAction,
  releaseCourierDepositAction,
  issueCourierFloatAction,
  returnCourierFloatAction,
} from "@/actions/admin-cash.actions";
import { Coins, X, AlertCircle } from "lucide-react";

interface DepositFloatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  courier: {
    courierId: string;
    name: string | null;
    securityDeposit: number;
    changeFloat: number;
  };
}

export function DepositFloatDialog({ isOpen, onClose, courier }: DepositFloatDialogProps) {
  const t = useTranslations("admin.cash");
  const router = useRouter();

  const [operation, setOperation] = useState<"hold_deposit" | "release_deposit" | "issue_float" | "return_float">("issue_float");
  const [amount, setAmount] = useState<number>(10000);
  const [note, setNote] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;
    setLoading(true);
    setErrorMsg(null);

    const payload = {
      courierId: courier.courierId,
      amount: Number(amount),
      currency: "CDF" as const,
      note: note.trim() || undefined,
    };

    let res;
    if (operation === "hold_deposit") res = await holdCourierDepositAction(payload);
    else if (operation === "release_deposit") res = await releaseCourierDepositAction(payload);
    else if (operation === "issue_float") res = await issueCourierFloatAction(payload);
    else res = await returnCourierFloatAction(payload);

    setLoading(false);
    if (!res.ok) {
      setErrorMsg(res.error || "Erreur de validation");
      return;
    }

    router.refresh();
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="deposit-float-dialog-title"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="w-full max-w-md bg-card rounded-2xl shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-border flex items-center justify-between bg-surface">
          <div className="flex items-center gap-2 text-heading font-bold text-sm">
            <Coins className="size-4.5 text-primary" aria-hidden="true" />
            <span id="deposit-float-dialog-title">{t("depositFloatDialogTitle")}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-ink-400 hover:text-ink-700 rounded-lg hover:bg-surface-hover transition-colors"
            aria-label="Fermer"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t("depositFloatDialogDesc")} ({courier.name ?? courier.courierId})
          </p>

          {errorMsg && (
            <div role="alert" className="p-3 bg-destructive-light border border-destructive-base/30 rounded-xl text-xs text-destructive-base font-medium flex items-start gap-2">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="p-3 bg-surface rounded-xl text-xs space-y-1.5 border border-border">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("deposit")} :</span>
              <span className="font-bold font-mono text-heading">{courier.securityDeposit.toLocaleString("fr-FR")} CDF</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("float")} :</span>
              <span className="font-bold font-mono text-heading">{courier.changeFloat.toLocaleString("fr-FR")} CDF</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="operation-type-select" className="text-xs font-semibold text-heading">
              {t("operationType")}
            </Label>
            <select
              id="operation-type-select"
              value={operation}
              onChange={(e) => setOperation(e.target.value as "hold_deposit" | "release_deposit" | "issue_float" | "return_float")}
              className="w-full h-10 min-h-[40px] px-3 text-xs rounded-xl border border-input bg-card font-medium focus:outline-hidden focus:ring-2 focus:ring-primary/20 text-heading"
            >
              <option value="issue_float">{t("opIssueFloat")}</option>
              <option value="return_float">{t("opReturnFloat")}</option>
              <option value="hold_deposit">{t("opHoldDeposit")}</option>
              <option value="release_deposit">{t("opReleaseDeposit")}</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="deposit-amount-input" className="text-xs font-semibold text-heading">
              {t("amountLabel")} (CDF)
            </Label>
            <Input
              id="deposit-amount-input"
              type="number"
              min={1}
              required
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="text-sm font-semibold h-10 min-h-[40px] font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="deposit-note-input" className="text-xs font-semibold text-heading">
              {t("noteLabel")}
            </Label>
            <Input
              id="deposit-note-input"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t("notePlaceholder")}
              className="text-xs h-10 min-h-[40px]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={loading}
              className="min-h-[40px] px-4 text-xs font-semibold"
            >
              {t("cancelBtn")}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading}
              className="min-h-[40px] px-4 text-xs font-semibold bg-primary hover:bg-primary-hover text-white"
            >
              {loading ? "Enregistrement..." : t("submitBtn")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
