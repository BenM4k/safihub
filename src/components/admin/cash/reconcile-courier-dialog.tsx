"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { confirmDailyReconciliationAction } from "@/actions/admin-cash.actions";
import { X, Scale } from "lucide-react";

interface ReconcileCourierDialogProps {
  isOpen: boolean;
  onClose: () => void;
  courier: {
    courierId: string;
    name: string | null;
    expectedCashCDF: number;
    securityDeposit: number;
  };
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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const diff = receivedAmount - courier.expectedCashCDF;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      return;
    }

    router.refresh();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2 text-heading font-bold text-sm">
            <Scale className="size-4.5 text-primary" />
            <span>{t("reconcileDialogTitle")}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-xs text-muted-foreground">
            {t("reconcileDialogDesc")} ({courier.name ?? courier.courierId} — {businessDate})
          </p>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
              {errorMsg}
            </div>
          )}

          <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1.5 border border-slate-100">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("expected")} :</span>
              <span className="font-bold">{courier.expectedCashCDF.toLocaleString()} CDF</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("deposit")} :</span>
              <span className="font-medium">{courier.securityDeposit.toLocaleString()} CDF</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">{t("receivedInputLabel")}</Label>
            <Input
              type="number"
              min={0}
              required
              value={receivedAmount}
              onChange={(e) => setReceivedAmount(Number(e.target.value))}
              className="text-sm font-semibold h-10"
            />
            {diff !== 0 && (
              <p
                className={`text-2xs font-semibold ${
                  diff < 0 ? "text-rose-600" : "text-amber-600"
                }`}
              >
                {t("difference")} : {diff > 0 ? "+" : ""}
                {diff.toLocaleString()} CDF ({diff < 0 ? t("deficit") : t("surplus")})
              </p>
            )}
          </div>

          {diff < 0 && (
            <label className="flex items-start gap-2.5 p-3 bg-amber-50/70 border border-amber-200 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={deductFromDeposit}
                onChange={(e) => setDeductFromDeposit(e.target.checked)}
                className="mt-0.5 rounded text-primary focus:ring-primary size-4"
              />
              <span className="text-2xs text-amber-950 font-medium leading-tight">
                {t("deductShortfall")} (max {Math.min(Math.abs(diff), courier.securityDeposit).toLocaleString()} CDF)
              </span>
            </label>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">{t("noteLabel")}</Label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t("reconcileNotePlaceholder")}
              className="text-xs h-9"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
              {t("cancelBtn")}
            </Button>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? "..." : t("confirmSubmit")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
