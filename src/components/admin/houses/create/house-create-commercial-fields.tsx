"use client";

import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface HouseCreateCommercialFieldsProps {
  commissionPercent: string;
  onCommissionChange: (val: string) => void;
  defaultPercentStr: string;
  minimumOrderAmount: string;
  onMinOrderChange: (val: string) => void;
  turnaroundHours: string;
  onTurnaroundChange: (val: string) => void;
  dailyCapacity: string;
  onDailyCapacityChange: (val: string) => void;
  addressNote: string;
  onAddressNoteChange: (val: string) => void;
}

export function HouseCreateCommercialFields({
  commissionPercent,
  onCommissionChange,
  defaultPercentStr,
  minimumOrderAmount,
  onMinOrderChange,
  turnaroundHours,
  onTurnaroundChange,
  dailyCapacity,
  onDailyCapacityChange,
  addressNote,
  onAddressNoteChange,
}: HouseCreateCommercialFieldsProps) {
  return (
    <div className="space-y-4">
      {/* Commission & Min order in 2 cols */}
      <div className="grid grid-cols-2 gap-3">
        <Field>
          <FieldLabel htmlFor="create-comm" className="text-xs font-semibold text-foreground">
            Commission (%)
          </FieldLabel>
          <div className="relative mt-1.5">
            <Input
              id="create-comm"
              value={commissionPercent}
              onChange={(e) => onCommissionChange(e.target.value)}
              placeholder={defaultPercentStr}
              className="h-9 text-xs pr-7"
            />
            <span className="absolute right-2.5 top-2 text-xs font-bold text-muted-foreground pointer-events-none">
              %
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            Défaut: {defaultPercentStr} %
          </p>
        </Field>

        <Field>
          <FieldLabel htmlFor="create-min" className="text-xs font-semibold text-foreground">
            Montant min. (CDF)
          </FieldLabel>
          <div className="relative mt-1.5">
            <Input
              id="create-min"
              type="number"
              min="0"
              step="500"
              value={minimumOrderAmount}
              onChange={(e) => onMinOrderChange(e.target.value)}
              className="h-9 text-xs pr-10"
            />
            <span className="absolute right-2.5 top-2 text-[10px] font-bold text-muted-foreground pointer-events-none">
              CDF
            </span>
          </div>
        </Field>
      </div>

      {/* Turnaround & Capacity */}
      <div className="grid grid-cols-2 gap-3">
        <Field>
          <FieldLabel htmlFor="create-turn" className="text-xs font-semibold text-foreground">
            Délai de traitement
          </FieldLabel>
          <div className="relative mt-1.5">
            <Input
              id="create-turn"
              type="number"
              min="1"
              max="720"
              value={turnaroundHours}
              onChange={(e) => onTurnaroundChange(e.target.value)}
              className="h-9 text-xs pr-8"
            />
            <span className="absolute right-2.5 top-2 text-xs font-bold text-muted-foreground pointer-events-none">
              h
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">Défaut: 48h</p>
        </Field>

        <Field>
          <FieldLabel htmlFor="create-cap" className="text-xs font-semibold text-foreground">
            Capacité journalière
          </FieldLabel>
          <Input
            id="create-cap"
            type="number"
            min="1"
            value={dailyCapacity}
            onChange={(e) => onDailyCapacityChange(e.target.value)}
            placeholder="ex: 30"
            className="h-9 text-xs mt-1.5"
          />
          <p className="text-[10px] text-muted-foreground mt-1">Optionnel</p>
        </Field>
      </div>

      {/* Address Note */}
      <Field>
        <FieldLabel htmlFor="create-addr" className="text-xs font-semibold text-foreground">
          Repère pour les coursiers
        </FieldLabel>
        <Input
          id="create-addr"
          value={addressNote}
          onChange={(e) => onAddressNoteChange(e.target.value)}
          placeholder="ex: En face de la station Engen, portail bleu"
          className="h-9 text-xs mt-1.5"
        />
        <p className="text-[10px] text-muted-foreground mt-1">
          Landmark visible pour les collectes et retours
        </p>
      </Field>
    </div>
  );
}
