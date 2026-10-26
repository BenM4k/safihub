"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export interface ReceptionItemState {
  orderItemId: string;
  itemName: string;
  fabricName: string;
  declaredQuantity: number;
  receivedQuantity: number;
  unitPrice: number;
  isExplicitlyRejected: boolean;
}

interface ReceptionItemRowProps {
  item: ReceptionItemState;
  onQuantityChange: (val: number) => void;
  onToggleReject: () => void;
  declaredLabel?: string;
  unitPriceLabel?: string;
  receivedLabel?: string;
  excludeLabel?: string;
  excludedLabel?: string;
}

/**
 * Item row in the 3-point reception counting form with quantity adjustment and AC 10 exclusion.
 */
export function ReceptionItemRow({
  item,
  onQuantityChange,
  onToggleReject,
  declaredLabel = "Déclaré",
  unitPriceLabel = "Prix unitaire",
  receivedLabel = "Reçu",
  excludeLabel = "Exclure (AC 10)",
  excludedLabel = "Exclu (Retour)",
}: ReceptionItemRowProps) {
  return (
    <div
      className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
        item.isExplicitlyRejected ? "bg-destructive/10" : "hover:bg-muted/30"
      }`}
    >
      <div className="space-y-0.5">
        <div className="flex items-center gap-2">
          <span className="font-bold text-xs text-heading">
            {item.itemName} ({item.fabricName})
          </span>
          {item.isExplicitlyRejected && (
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
              {excludedLabel}
            </Badge>
          )}
        </div>
        <span className="text-[11px] text-muted-foreground">
          {declaredLabel}: <strong>{item.declaredQuantity}</strong> •{" "}
          {unitPriceLabel}:{" "}
          <strong>{item.unitPrice.toLocaleString()} CDF</strong>
        </span>
      </div>

      <div className="flex items-center gap-3 self-end sm:self-auto">
        <div className="flex items-center gap-1.5">
          <label className="text-xs font-semibold text-foreground">
            {receivedLabel}:
          </label>
          <Input
            type="number"
            min={0}
            value={item.receivedQuantity}
            onChange={(e) => onQuantityChange(parseInt(e.target.value) || 0)}
            className="w-16 h-8 text-center text-xs font-bold rounded-lg"
          />
        </div>

        <Button
          type="button"
          size="sm"
          variant={item.isExplicitlyRejected ? "destructive" : "secondary"}
          onClick={onToggleReject}
          className="text-xs font-semibold h-8 gap-1 cursor-pointer"
        >
          <RotateCcw className="size-3" />
          <span>
            {item.isExplicitlyRejected ? excludedLabel : excludeLabel}
          </span>
        </Button>
      </div>
    </div>
  );
}
