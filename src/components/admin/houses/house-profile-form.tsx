"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { updateHouseProfileAction } from "@/actions/admin-house.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { HouseRecord, NeighborhoodRecord } from "@/dal";

interface HouseProfileFormProps {
  house: HouseRecord;
  neighborhoods: NeighborhoodRecord[];
}

export function HouseProfileForm({ house, neighborhoods }: HouseProfileFormProps) {
  const t = useTranslations("admin.houses");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleUpdate(formData: FormData) {
    setError(null);
    setSuccess(null);
    setLoading(true);
    const res = await updateHouseProfileAction(house.id, formData);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
    } else {
      setSuccess("Profil et paramètres mis à jour");
    }
  }

  return (
    <form action={handleUpdate} className="p-5 bg-white rounded-xl border border-border shadow-xs space-y-4">
      <div className="font-bold text-sm text-heading">{t("profileTab")}</div>
      {error && <div className="text-xs text-destructive">{error}</div>}
      {success && <div className="text-xs text-emerald-600 font-semibold">{success}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="space-y-1">
          <Label htmlFor="hpName" className="text-xs">Nom du pressing</Label>
          <Input id="hpName" name="name" defaultValue={house.name} required className="h-9 text-xs" />
        </div>

        <div className="space-y-1">
          <Label htmlFor="hpNeigh" className="text-xs">Quartier</Label>
          <select id="hpNeigh" name="neighborhoodId" defaultValue={house.neighborhoodId} required className="h-9 w-full rounded-md border border-input bg-white px-3 text-xs text-heading">
            {neighborhoods.map((n) => (
              <option key={n.id} value={n.id}>
                {n.name} ({n.zoneName})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="hpPhone" className="text-xs">Téléphone contact</Label>
          <Input id="hpPhone" name="contactPhone" defaultValue={house.contactPhone ?? ""} className="h-9 text-xs" />
        </div>

        <div className="space-y-1">
          <Label htmlFor="hpComm" className="text-xs">{t("commission")}</Label>
          <Input id="hpComm" name="commissionBps" type="number" defaultValue={house.commissionBps ?? ""} placeholder="Défaut global" className="h-9 text-xs" />
        </div>

        <div className="space-y-1">
          <Label htmlFor="hpMin" className="text-xs">{t("minOrder")}</Label>
          <Input id="hpMin" name="minimumOrderAmount" type="number" defaultValue={house.minimumOrderAmount} className="h-9 text-xs" />
        </div>

        <div className="space-y-1">
          <Label htmlFor="hpTurn" className="text-xs">{t("turnaround")}</Label>
          <Input id="hpTurn" name="turnaroundHours" type="number" defaultValue={house.turnaroundHours} className="h-9 text-xs" />
        </div>

        <div className="space-y-1">
          <Label htmlFor="hpCut" className="text-xs">{t("cutoff")}</Label>
          <Input id="hpCut" name="cutoffMinutes" type="number" defaultValue={house.cutoffMinutes} className="h-9 text-xs" />
        </div>

        <div className="space-y-1">
          <Label htmlFor="hpCap" className="text-xs">{t("capacity")}</Label>
          <Input id="hpCap" name="dailyCapacity" type="number" defaultValue={house.dailyCapacity ?? ""} placeholder="Illimité" className="h-9 text-xs" />
        </div>

        <div className="space-y-1">
          <Label htmlFor="hpDist" className="text-xs">{t("distanceOverride")}</Label>
          <Input id="hpDist" name="maxDistanceLevel" type="number" defaultValue={house.maxDistanceLevel ?? ""} placeholder="Défaut global" className="h-9 text-xs" />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="hpAddr" className="text-xs">Adresse précise / repère pour coursiers</Label>
        <Input id="hpAddr" name="addressNote" defaultValue={house.addressNote ?? ""} className="h-9 text-xs" />
      </div>

      <div className="flex items-center gap-6 pt-2">
        <label className="flex items-center gap-2 text-xs font-semibold text-heading cursor-pointer">
          <input type="checkbox" name="isActive" defaultChecked={house.isActive} value="true" className="rounded" />
          <span>Pressing actif sur la plateforme</span>
        </label>
        <label className="flex items-center gap-2 text-xs font-semibold text-amber-700 cursor-pointer">
          <input type="checkbox" name="isPaused" defaultChecked={house.isPaused} value="true" className="rounded" />
          <span>Suspendre temporairement</span>
        </label>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={loading} size="sm" className="h-9">
          {loading ? "..." : "Enregistrer les modifications"}
        </Button>
      </div>
    </form>
  );
}
