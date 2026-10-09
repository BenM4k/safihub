"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { settleCourierAction } from "@/actions/admin-settlements.actions";
import { Bike, X } from "lucide-react";

interface SettleCourierDialogProps {
  isOpen: boolean;
  onClose: () => void;
  courier: {
    courierId: string;
    name: string | null;
    balanceOwedCDF: number;
  };
}

export function SettleCourierDialog({ isOpen, onClose, courier }: SettleCourierDialogProps) {
  const t = useTranslations("admin.settlements");
  const router = useRouter();

  const [amount, setAmount] = useState<number>(courier.balanceOwedCDF);
  const [reference, setReference] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;
    setLoading(true);
    setErrorMsg(null);

    const res = await settleCourierAction({
      courierId: courier.courierId,
      amount: Number(amount),
      currency: "CDF",
      reference: reference.trim() || undefined,
    });

    setLoading(false);
    if (!res.ok) {
      setErrorMsg(res.error || "Échec du règlement");
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
            <Bike className="size-4.5 text-emerald-600" />
            <span>{t("settleCourierDialogTitle")}</span>
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
            {t("settleCourierDialogDesc")} ({courier.name ?? courier.courierId})
          </p>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
              {errorMsg}
            </div>
          )}

          <div className="p-3 bg-slate-50 rounded-xl text-xs flex justify-between items-center border border-slate-100">
            <span className="text-muted-foreground">{t("balanceOwed")} :</span>
            <span className="text-base font-black text-heading">
              {courier.balanceOwedCDF.toLocaleString()} CDF
            </span>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">{t("payoutAmountLabel")} (CDF)</Label>
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
            <Label className="text-xs font-semibold">{t("payoutRefLabel")}</Label>
            <Input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Ex. Airtel Money #AM-55019, Espèces remise en main propre..."
              className="text-xs h-9"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
              {t("cancelBtn")}
            </Button>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? "..." : t("confirmPayout")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
