"use client";

import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupText } from "@/components/ui/input-group";

interface HouseTabSettingsFieldsProps {
  name: string;
  setName: (v: string) => void;
  commissionPercent: string;
  setCommissionPercent: (v: string) => void;
  defaultPercentStr: string;
  minimumOrderAmount: string;
  setMinimumOrderAmount: (v: string) => void;
  turnaroundHours: string;
  setTurnaroundHours: (v: string) => void;
  cutoffMinutes: string;
  setCutoffMinutes: (v: string) => void;
  dailyCapacity: string;
  setDailyCapacity: (v: string) => void;
  addressNote: string;
  setAddressNote: (v: string) => void;
}

export function HouseTabSettingsFields({
  name,
  setName,
  commissionPercent,
  setCommissionPercent,
  defaultPercentStr,
  minimumOrderAmount,
  setMinimumOrderAmount,
  turnaroundHours,
  setTurnaroundHours,
  cutoffMinutes,
  setCutoffMinutes,
  dailyCapacity,
  setDailyCapacity,
  addressNote,
  setAddressNote,
}: HouseTabSettingsFieldsProps) {
  return (
    <div className="space-y-4">
      {/* Name */}
      <Field className="space-y-1.5">
        <FieldLabel htmlFor="tab-name" className="text-xs font-semibold text-foreground">
          Nom du pressing
        </FieldLabel>
        <Input
          id="tab-name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-9 text-xs"
        />
      </Field>

      {/* Commission & Min order in 2 cols */}
      <div className="grid grid-cols-2 gap-3">
        <Field className="space-y-1.5">
          <FieldLabel htmlFor="tab-comm" className="text-xs font-semibold text-foreground">
            Commission (%)
          </FieldLabel>
          <InputGroup>
            <Input
              id="tab-comm"
              value={commissionPercent}
              onChange={(e) => setCommissionPercent(e.target.value)}
              placeholder={defaultPercentStr}
              className="h-9 text-xs"
            />
            <InputGroupText className="text-xs font-semibold">%</InputGroupText>
          </InputGroup>
          <p className="text-[10px] text-muted-foreground">Vide = défaut ({defaultPercentStr} %)</p>
        </Field>

        <Field className="space-y-1.5">
          <FieldLabel htmlFor="tab-min" className="text-xs font-semibold text-foreground">
            Montant min. (CDF)
          </FieldLabel>
          <InputGroup>
            <Input
              id="tab-min"
              type="number"
              min="0"
              step="500"
              value={minimumOrderAmount}
              onChange={(e) => setMinimumOrderAmount(e.target.value)}
              className="h-9 text-xs"
            />
            <InputGroupText className="text-xs font-semibold">CDF</InputGroupText>
          </InputGroup>
        </Field>
      </div>

      {/* Turnaround & Cutoff */}
      <div className="grid grid-cols-2 gap-3">
        <Field className="space-y-1.5">
          <FieldLabel htmlFor="tab-turn" className="text-xs font-semibold text-foreground">
            Délai traitement
          </FieldLabel>
          <InputGroup>
            <Input
              id="tab-turn"
              type="number"
              min="1"
              max="720"
              value={turnaroundHours}
              onChange={(e) => setTurnaroundHours(e.target.value)}
              className="h-9 text-xs"
            />
            <InputGroupText className="text-xs font-semibold">h</InputGroupText>
          </InputGroup>
        </Field>

        <Field className="space-y-1.5">
          <FieldLabel htmlFor="tab-cut" className="text-xs font-semibold text-foreground">
            Délai fermeture
          </FieldLabel>
          <InputGroup>
            <Input
              id="tab-cut"
              type="number"
              min="0"
              value={cutoffMinutes}
              onChange={(e) => setCutoffMinutes(e.target.value)}
              className="h-9 text-xs"
            />
            <InputGroupText className="text-xs font-semibold">min</InputGroupText>
          </InputGroup>
        </Field>
      </div>

      {/* Daily Capacity & Address */}
      <Field className="space-y-1.5">
        <FieldLabel htmlFor="tab-cap" className="text-xs font-semibold text-foreground">
          Capacité journalière (commandes / jour)
        </FieldLabel>
        <Input
          id="tab-cap"
          type="number"
          min="1"
          placeholder="Illimitée"
          value={dailyCapacity}
          onChange={(e) => setDailyCapacity(e.target.value)}
          className="h-9 text-xs"
        />
      </Field>

      <Field className="space-y-1.5">
        <FieldLabel htmlFor="tab-addr" className="text-xs font-semibold text-foreground">
          Adresse précise / repère coursiers
        </FieldLabel>
        <Input
          id="tab-addr"
          value={addressNote}
          onChange={(e) => setAddressNote(e.target.value)}
          className="h-9 text-xs"
        />
      </Field>
    </div>
  );
}
