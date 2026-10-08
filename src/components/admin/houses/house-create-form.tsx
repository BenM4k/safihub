"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createHouseAction } from "@/actions/admin-house.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { NeighborhoodRecord } from "@/dal";

interface HouseCreateFormProps {
  neighborhoods: NeighborhoodRecord[];
}

export function HouseCreateForm({ neighborhoods }: HouseCreateFormProps) {
  const t = useTranslations("admin.houses");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCreate(formData: FormData) {
    setError(null);
    setLoading(true);
    const res = await createHouseAction(formData);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
    } else {
      (document.getElementById("house-form-el") as HTMLFormElement)?.reset();
    }
  }

  return (
    <form
      id="house-form-el"
      action={handleCreate}
      className="p-5 bg-white rounded-xl border border-border shadow-xs space-y-4"
    >
      <div className="font-bold text-sm text-heading">{t("addHouse")}</div>
      {error && <div className="text-xs text-destructive">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1">
          <Label htmlFor="hName" className="text-xs">Nom du pressing</Label>
          <Input id="hName" name="name" required placeholder="ex: Pressing du Kivu" className="h-9 text-xs" />
        </div>

        <div className="space-y-1">
          <Label htmlFor="hNeigh" className="text-xs">Quartier</Label>
          <select id="hNeigh" name="neighborhoodId" required className="h-9 w-full rounded-md border border-input bg-white px-3 text-xs text-heading">
            <option value="">-- Choisir quartier --</option>
            {neighborhoods.map((n) => (
              <option key={n.id} value={n.id}>
                {n.name} ({n.zoneName})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="hPhone" className="text-xs">Téléphone contact</Label>
          <Input id="hPhone" name="contactPhone" placeholder="+243..." className="h-9 text-xs" />
        </div>

        <div className="space-y-1">
          <Label htmlFor="hComm" className="text-xs">{t("commission")}</Label>
          <Input id="hComm" name="commissionBps" type="number" placeholder="2000 (vide = défaut)" className="h-9 text-xs" />
        </div>

        <div className="space-y-1">
          <Label htmlFor="hMin" className="text-xs">{t("minOrder")}</Label>
          <Input id="hMin" name="minimumOrderAmount" type="number" defaultValue="5000" className="h-9 text-xs" />
        </div>

        <div className="space-y-1">
          <Label htmlFor="hTurn" className="text-xs">{t("turnaround")}</Label>
          <Input id="hTurn" name="turnaroundHours" type="number" defaultValue="48" className="h-9 text-xs" />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading} size="sm" className="h-9">
          {loading ? "..." : t("addHouse")}
        </Button>
      </div>
    </form>
  );
}
