"use client";

import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { NeighborhoodRecord } from "@/dal";

interface HouseCreateIdentityFieldsProps {
  name: string;
  onNameChange: (val: string) => void;
  isDuplicateName: boolean;
  neighborhoodId: string;
  onNeighborhoodChange: (val: string) => void;
  neighborhoods: NeighborhoodRecord[];
  contactPhone: string;
  onPhoneChange: (val: string) => void;
}

export function HouseCreateIdentityFields({
  name,
  onNameChange,
  isDuplicateName,
  neighborhoodId,
  onNeighborhoodChange,
  neighborhoods,
  contactPhone,
  onPhoneChange,
}: HouseCreateIdentityFieldsProps) {
  return (
    <div className="space-y-4">
      {/* Name */}
      <Field>
        <FieldLabel htmlFor="create-name" className="text-xs font-semibold text-foreground">
          Nom du pressing <span className="text-destructive">*</span>
        </FieldLabel>
        <Input
          id="create-name"
          required
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="ex: Pressing du Lac"
          className={`h-9 text-xs mt-1.5 ${isDuplicateName ? "border-destructive ring-1 ring-destructive" : ""}`}
        />
        {isDuplicateName && (
          <p className="text-[11px] text-destructive font-medium mt-1">
            Un pressing porte déjà ce nom.
          </p>
        )}
      </Field>

      {/* Neighborhood */}
      <Field>
        <FieldLabel htmlFor="create-neigh" className="text-xs font-semibold text-foreground">
          Quartier <span className="text-destructive">*</span>
        </FieldLabel>
        <select
          id="create-neigh"
          required
          value={neighborhoodId}
          onChange={(e) => onNeighborhoodChange(e.target.value)}
          className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary mt-1.5"
        >
          <option value="">Sélectionner un quartier</option>
          {neighborhoods.map((n) => (
            <option key={n.id} value={n.id}>
              {n.name} ({n.zoneName})
            </option>
          ))}
        </select>
      </Field>

      {/* Contact Phone */}
      <Field>
        <FieldLabel htmlFor="create-phone" className="text-xs font-semibold text-foreground">
          Téléphone de contact
        </FieldLabel>
        <Input
          id="create-phone"
          value={contactPhone}
          onChange={(e) => onPhoneChange(e.target.value)}
          placeholder="+243 90 000 0001"
          className="h-9 text-xs mt-1.5"
        />
        <p className="text-[11px] text-muted-foreground mt-1">
          Format RDC : +243 XX XXX XXXX
        </p>
      </Field>
    </div>
  );
}
