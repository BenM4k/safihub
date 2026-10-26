"use client";

import { useTranslations } from "next-intl";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { HouseRecord, NeighborhoodRecord } from "@/dal";

interface ManualOrderHouseFieldProps {
  neighborhoodId: string;
  onNeighborhoodChange: (id: string) => void;
  neighborhoods: NeighborhoodRecord[];
  landmark: string;
  onLandmarkChange: (landmark: string) => void;
  houseId: string;
  onHouseChange: (id: string) => void;
  houses: HouseRecord[];
  slotStart: string;
  onSlotStartChange: (slot: string) => void;
  slotEnd: string;
  onSlotEndChange: (slot: string) => void;
}

export function ManualOrderHouseField({
  neighborhoodId,
  onNeighborhoodChange,
  neighborhoods,
  landmark,
  onLandmarkChange,
  houseId,
  onHouseChange,
  houses,
  slotStart,
  onSlotStartChange,
  slotEnd,
  onSlotEndChange,
}: ManualOrderHouseFieldProps) {
  const t = useTranslations("admin.orders.manualForm");

  return (
    <div className="space-y-4 pt-2 border-t border-border">
      <h2 className="text-sm font-bold text-foreground">{t("locationAndHouse")}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Field>
          <FieldLabel className="text-xs font-semibold">{t("neighborhood")}</FieldLabel>
          <select
            value={neighborhoodId}
            onChange={(e) => onNeighborhoodChange(e.target.value)}
            className="h-9 w-full rounded-md border border-border bg-background px-3 text-xs text-foreground font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
          >
            {neighborhoods.map((n) => (
              <option key={n.id} value={n.id}>
                {n.name} ({n.zoneName})
              </option>
            ))}
          </select>
        </Field>

        <Field>
          <FieldLabel className="text-xs font-semibold">
            {t("landmark")} <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            required
            value={landmark}
            onChange={(e) => onLandmarkChange(e.target.value)}
            placeholder={t("landmarkPlaceholder")}
            className="h-9 text-xs"
          />
        </Field>

        <Field>
          <FieldLabel className="text-xs font-semibold">{t("house")}</FieldLabel>
          <select
            value={houseId}
            onChange={(e) => onHouseChange(e.target.value)}
            className="h-9 w-full rounded-md border border-border bg-background px-3 text-xs text-foreground font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
          >
            {houses.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </Field>

        <Field>
          <FieldLabel className="text-xs font-semibold">{t("slotStart")}</FieldLabel>
          <Input
            type="datetime-local"
            value={slotStart}
            onChange={(e) => onSlotStartChange(e.target.value)}
            className="h-9 text-xs font-mono"
          />
        </Field>

        <Field>
          <FieldLabel className="text-xs font-semibold">{t("slotEnd")}</FieldLabel>
          <Input
            type="datetime-local"
            value={slotEnd}
            onChange={(e) => onSlotEndChange(e.target.value)}
            className="h-9 text-xs font-mono"
          />
        </Field>
      </div>
    </div>
  );
}
