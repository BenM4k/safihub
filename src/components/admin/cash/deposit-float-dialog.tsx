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
import { Coins, X } from "lucide-react";

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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2 text-heading font-bold text-sm">
            <Coins className="size-4.5 text-primary" />
            <span>{t("depositFloatDialogTitle")}</span>
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
            {t("depositFloatDialogDesc")} ({courier.name ?? courier.courierId})
          </p>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
              {errorMsg}
            </div>
          )}

          <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1.5 border border-slate-100">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("deposit")} :</span>
              <span className="font-bold">{courier.securityDeposit.toLocaleString()} CDF</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("float")} :</span>
              <span className="font-bold">{courier.changeFloat.toLocaleString()} CDF</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">{t("operationType")}</Label>
            <select
              value={operation}
              onChange={(e) => setOperation(e.target.value as "hold_deposit" | "release_deposit" | "issue_float" | "return_float")}
              className="w-full h-9 px-3 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:outline-hidden focus:ring-2 focus:ring-primary/20"
            >
              <option value="issue_float">{t("opIssueFloat")}</option>
              <option value="return_float">{t("opReturnFloat")}</option>
              <option value="hold_deposit">{t("opHoldDeposit")}</option>
              <option value="release_deposit">{t("opReleaseDeposit")}</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">{t("amountLabel")} (CDF)</Label>
            <Input
              type="number"
              min={1}
              required
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="text-sm font-semibold h-10"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">{t("noteLabel")}</Label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex. Fond initial de 10 000 CDF en petites coupures"
              className="text-xs h-9"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
              {t("cancelBtn")}
            </Button>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? "..." : t("submitBtn")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
