"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface SettlePaymentMethodFieldsProps {
  method: "mobile_money" | "bank" | "cash";
  onMethodChange: (method: "mobile_money" | "bank" | "cash") => void;
  reference: string;
  onReferenceChange: (val: string) => void;
  period: string;
  onPeriodChange: (val: string) => void;
  note: string;
  onNoteChange: (val: string) => void;
}

export function SettlePaymentMethodFields({
  method,
  onMethodChange,
  reference,
  onReferenceChange,
  period,
  onPeriodChange,
  note,
  onNoteChange,
}: SettlePaymentMethodFieldsProps) {
  return (
    <div className="space-y-4 text-xs">
      {/* Payment Method */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-foreground">Mode de règlement *</Label>
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
              className="h-9 text-xs font-semibold"
            >
              {m.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Reference (required for non-cash) */}
      <div className="space-y-1.5">
        <Label htmlFor="settle-ref" className="text-xs font-semibold text-foreground">
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
          className="text-xs h-9"
          required={method !== "cash"}
        />
      </div>

      {/* Period & Note */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="settle-period" className="text-2xs font-semibold text-muted-foreground">
            Période comptable
          </Label>
          <Input
            id="settle-period"
            value={period}
            onChange={(e) => onPeriodChange(e.target.value)}
            className="text-xs h-9 font-mono"
            placeholder="2026-W42"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="settle-note" className="text-2xs font-semibold text-muted-foreground">
            Note interne (facultatif)
          </Label>
          <Input
            id="settle-note"
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            className="text-xs h-9"
            placeholder="Observation comptable..."
          />
        </div>
      </div>
    </div>
  );
}
