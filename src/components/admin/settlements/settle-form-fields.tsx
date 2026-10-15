"use client";

import { useState } from "react";
import { AlertCircle, ChevronDown, ChevronUp, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/cash-formatters";
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
      <div className="p-3 bg-surface rounded-xl border-2 border-border-strong space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-ink-700">Solde restant à régler :</span>
          <span className="font-mono text-base font-black text-heading tabular-nums">
            {formatMoney(target.balanceOwedCDF, "CDF")}
          </span>
        </div>

        {isHouse && target.grossTotalCDF !== undefined && (
          <div className="pt-2 border-t border-border-strong flex items-center justify-between text-2xs text-ink-600 font-mono">
            <span>Total brut : {formatMoney(target.grossTotalCDF, "CDF")}</span>
            <span>Commission : -{formatMoney(target.commissionTotalCDF ?? 0, "CDF")}</span>
          </div>
        )}

        {target.deliveredOrders.length > 0 && (
          <button
            type="button"
            onClick={() => setShowOrders(!showOrders)}
            className="text-2xs font-semibold text-primary hover:underline flex items-center gap-1 pt-1"
          >
            {showOrders ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
            <span>
              {target.deliveredOrders.length}{" "}
              {target.deliveredOrders.length > 1 ? "commandes incluses" : "commande incluse"}
            </span>
          </button>
        )}

        {showOrders && (
          <div className="p-2 bg-card rounded-lg border border-border-strong max-h-32 overflow-y-auto space-y-1">
            {target.deliveredOrders.map((o) => (
              <div key={o.id} className="flex justify-between font-mono text-2xs text-ink-700">
                <span>{o.code}</span>
                <span>{formatMoney(o.owedToHouse ?? o.amount ?? 0, "CDF")}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cash Discrepancy Notice for Couriers */}
      {target.cashDiscrepancyCDF !== undefined && target.cashDiscrepancyCDF !== 0 && (
        <div className="p-3 bg-warning-light border-2 border-warning-base/40 rounded-xl text-warning-base flex items-start gap-2">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold">
              Écart de caisse enregistré : {formatMoney(target.cashDiscrepancyCDF, "CDF")}
            </p>
            <p className="text-2xs text-ink-700">
              Note : cet écart issu du contrôle de caisse n&apos;est pas déduit automatiquement de
              la rémunération.
            </p>
          </div>
        </div>
      )}

      {/* Editable Amount */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="settle-amount" className="text-xs font-semibold text-heading">
            Montant à régler (CDF) *
          </Label>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onAmountChange(Math.round(target.balanceOwedCDF * 0.5))}
              className="px-2 py-0.5 bg-surface hover:bg-ink-100 rounded border border-border-strong text-2xs font-medium text-ink-700"
            >
              50 %
            </button>
            <button
              type="button"
              onClick={() => onAmountChange(target.balanceOwedCDF)}
              className="px-2 py-0.5 bg-surface hover:bg-ink-100 rounded border border-border-strong text-2xs font-semibold text-primary"
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
            className="font-mono text-sm font-bold h-10 border-border-strong pl-8"
            required
          />
          <DollarSign className="size-4 text-ink-400 absolute left-2.5 top-3 pointer-events-none" />
        </div>
      </div>

      {/* Payment Method */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-heading">Mode de règlement *</Label>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              { id: "mobile_money", label: "Mobile Money" },
              { id: "bank", label: "Banque" },
              { id: "cash", label: "Espèces" },
            ] as const
          ).map((m) => (
            <Button
              key={m.id}
              type="button"
              variant={method === m.id ? "default" : "outline"}
              size="sm"
              onClick={() => onMethodChange(m.id)}
              className={`h-9 text-xs font-semibold border-border-strong ${
                method === m.id ? "shadow-xs" : "bg-card text-ink-700 hover:bg-surface"
              }`}
            >
              {m.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Reference (required for non-cash) */}
      <div className="space-y-1.5">
        <Label htmlFor="settle-ref" className="text-xs font-semibold text-heading">
          Référence / N° de transaction {method !== "cash" && "*"}
        </Label>
        <Input
          id="settle-ref"
          value={reference}
          onChange={(e) => onReferenceChange(e.target.value)}
          placeholder={
            method === "mobile_money"
              ? "Ex. M-Pesa #MP-984210, Airtel Money ID..."
              : method === "bank"
              ? "Ex. Virement BCDC / Rawbank #VR-4029"
              : "Reçu de caisse #RC-012 (facultatif)"
          }
          className="text-xs h-9 border-border-strong"
          required={method !== "cash"}
        />
      </div>

      {/* Period & Note */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="settle-period" className="text-2xs font-semibold text-ink-700">
            Période comptable
          </Label>
          <Input
            id="settle-period"
            value={period}
            onChange={(e) => onPeriodChange(e.target.value)}
            className="text-xs h-8 border-border-strong font-mono"
            placeholder="2026-W42"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="settle-note" className="text-2xs font-semibold text-ink-700">
            Note interne (facultatif)
          </Label>
          <Input
            id="settle-note"
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            className="text-xs h-8 border-border-strong"
            placeholder="Observation comptable..."
          />
        </div>
      </div>
    </div>
  );
}
