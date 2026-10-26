"use client";

import { useState } from "react";
import { AlertCircle, ChevronDown, ChevronUp, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatMoney } from "@/lib/cash-formatters";
import { SettlePaymentMethodFields } from "./settle-payment-method-fields";
import type { PayeeSettlementTarget } from "./types";

interface SettleFormFieldsProps {
  target: PayeeSettlementTarget;
  amount: number;
  onAmountChange: (amount: number) => void;
  method: "mobile_money" | "bank" | "cash";
  onMethodChange: (method: "mobile_money" | "bank" | "cash") => void;
  reference: string;
  onReferenceChange: (val: string) => void;
  note: string;
  onNoteChange: (val: string) => void;
  period: string;
  onPeriodChange: (val: string) => void;
}

export function SettleFormFields({
  target,
  amount,
  onAmountChange,
  method,
  onMethodChange,
  reference,
  onReferenceChange,
  note,
  onNoteChange,
  period,
  onPeriodChange,
}: SettleFormFieldsProps) {
  const [showOrders, setShowOrders] = useState(false);
  const isHouse = target.type === "house";

  return (
    <div className="space-y-4 text-xs">
      {/* Payee summary & balance */}
      <div className="p-3 bg-muted/40 rounded-xl border border-border space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-foreground">Solde restant à régler :</span>
          <span className="font-mono text-base font-black text-foreground tabular-nums">
            {formatMoney(target.balanceOwedCDF, "CDF")}
          </span>
        </div>

        {isHouse && target.grossTotalCDF !== undefined && (
          <div className="pt-2 border-t border-border flex items-center justify-between text-2xs text-muted-foreground font-mono">
            <span>Total brut : {formatMoney(target.grossTotalCDF, "CDF")}</span>
            <span>Commission : -{formatMoney(target.commissionTotalCDF ?? 0, "CDF")}</span>
          </div>
        )}

        {target.deliveredOrders.length > 0 && (
          <button
            type="button"
            onClick={() => setShowOrders(!showOrders)}
            className="text-2xs font-semibold text-primary hover:underline flex items-center gap-1 pt-1 cursor-pointer"
          >
            {showOrders ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
            <span>
              {target.deliveredOrders.length}{" "}
              {target.deliveredOrders.length > 1 ? "commandes incluses" : "commande incluse"}
            </span>
          </button>
        )}

        {showOrders && (
          <div className="p-2 bg-card rounded-lg border border-border max-h-32 overflow-y-auto space-y-1">
            {target.deliveredOrders.map((o) => (
              <div key={o.id} className="flex justify-between font-mono text-2xs text-muted-foreground">
                <span>{o.code}</span>
                <span>{formatMoney(o.owedToHouse ?? o.amount ?? 0, "CDF")}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cash Discrepancy Notice for Couriers */}
      {target.cashDiscrepancyCDF !== undefined && target.cashDiscrepancyCDF !== 0 && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-700 dark:text-amber-400 flex items-start gap-2">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold">
              Écart de caisse enregistré : {formatMoney(target.cashDiscrepancyCDF, "CDF")}
            </p>
            <p className="text-2xs text-foreground/80">
              Note : cet écart issu du contrôle de caisse n&apos;est pas déduit automatiquement de
              la rémunération.
            </p>
          </div>
        </div>
      )}

      {/* Editable Amount */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="settle-amount" className="text-xs font-semibold text-foreground">
            Montant à régler (CDF) *
          </Label>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onAmountChange(Math.round(target.balanceOwedCDF * 0.5))}
              className="px-2 py-0.5 bg-muted hover:bg-muted/80 rounded border border-border text-2xs font-medium text-foreground cursor-pointer"
            >
              50 %
            </button>
            <button
              type="button"
              onClick={() => onAmountChange(target.balanceOwedCDF)}
              className="px-2 py-0.5 bg-muted hover:bg-muted/80 rounded border border-border text-2xs font-semibold text-primary cursor-pointer"
            >
              Totalité
            </button>
          </div>
        </div>
        <div className="relative">
          <Input
            id="settle-amount"
            type="number"
            min={1}
            max={target.balanceOwedCDF}
            value={amount || ""}
            onChange={(e) => onAmountChange(Number(e.target.value))}
            className="font-mono text-sm font-bold h-10 pl-8"
            required
          />
          <DollarSign className="size-4 text-muted-foreground absolute left-2.5 top-3 pointer-events-none" />
        </div>
      </div>

      <SettlePaymentMethodFields
        method={method}
        onMethodChange={onMethodChange}
        reference={reference}
        onReferenceChange={onReferenceChange}
        period={period}
        onPeriodChange={onPeriodChange}
        note={note}
        onNoteChange={onNoteChange}
      />
    </div>
  );
}
