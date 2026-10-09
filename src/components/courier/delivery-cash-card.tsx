"use client";

import { useTranslations } from "next-intl";
import { Banknote, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";

interface DeliveryCashCardProps {
  cashCollected: string;
  currency: "CDF" | "USD";
  totalDue: number;
  onCashChange: (val: string) => void;
  onCurrencyChange: (curr: "CDF" | "USD") => void;
}

export function DeliveryCashCard({
  cashCollected,
  currency,
  totalDue,
  onCashChange,
  onCurrencyChange,
}: DeliveryCashCardProps) {
  const t = useTranslations("courier.delivery");
  const enteredCashNum = parseInt(cashCollected || "0", 10);
  const hasCashMismatch = enteredCashNum !== totalDue;

  return (
    <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2 shadow-2xs">
      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
        <Banknote className="size-3.5 text-emerald-600" />
        <span>{t("cashTitle")}</span>
      </label>
      <div className="flex gap-2">
        <Input
          type="number"
          min="0"
          value={cashCollected}
          onChange={(e) => onCashChange(e.target.value)}
          required
          className="font-mono text-base font-bold h-11 rounded-xl flex-1"
        />
        <select
          value={currency}
          onChange={(e) => onCurrencyChange(e.target.value as "CDF" | "USD")}
          className="px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700"
        >
          <option value="CDF">CDF</option>
          <option value="USD">USD</option>
        </select>
      </div>

      {hasCashMismatch && (
        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-amber-900 text-[11px]">
          <AlertTriangle className="size-3.5 text-amber-600 shrink-0 mt-0.5" />
          <span>
            {t("cashMismatch", {
              amount: totalDue.toLocaleString(),
            })}
          </span>
        </div>
      )}
    </div>
  );
}
