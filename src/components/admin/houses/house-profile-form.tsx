"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { updateHouseProfileAction } from "@/actions/admin-house.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Field, FieldLabel } from "@/components/ui/field";
import { AlertCircle, Check } from "lucide-react";
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
    <form action={handleUpdate} className="space-y-5">
      <div className="font-bold text-sm text-foreground">{t("profileTab")}</div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-emerald-500/30 text-emerald-700 dark:text-emerald-400 bg-emerald-500/10">
          <Check className="size-4" />
          <AlertDescription className="font-semibold">{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <Field className="space-y-1">
          <FieldLabel htmlFor="hpName" className="text-xs font-semibold text-foreground">
            Nom du pressing
          </FieldLabel>
          <Input id="hpName" name="name" defaultValue={house.name} required className="h-9 text-xs" />
        </Field>

        <Field className="space-y-1">
          <FieldLabel htmlFor="hpNeigh" className="text-xs font-semibold text-foreground">
            Quartier
          </FieldLabel>
          <select
            id="hpNeigh"
            name="neighborhoodId"
            defaultValue={house.neighborhoodId}
            required
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs text-foreground ring-offset-background"
          >
            {neighborhoods.map((n) => (
              <option key={n.id} value={n.id}>
                {n.name} ({n.zoneName})
              </option>
            ))}
          </select>
        </Field>

        <Field className="space-y-1">
          <FieldLabel htmlFor="hpPhone" className="text-xs font-semibold text-foreground">
            Téléphone contact
          </FieldLabel>
          <Input id="hpPhone" name="contactPhone" defaultValue={house.contactPhone ?? ""} className="h-9 text-xs" />
        </Field>

        <Field className="space-y-1">
          <FieldLabel htmlFor="hpComm" className="text-xs font-semibold text-foreground">
            {t("commission")}
          </FieldLabel>
          <Input id="hpComm" name="commissionBps" type="number" defaultValue={house.commissionBps ?? ""} placeholder="Défaut global" className="h-9 text-xs" />
        </Field>

        <Field className="space-y-1">
          <FieldLabel htmlFor="hpMin" className="text-xs font-semibold text-foreground">
            {t("minOrder")}
          </FieldLabel>
          <Input id="hpMin" name="minimumOrderAmount" type="number" defaultValue={house.minimumOrderAmount} className="h-9 text-xs" />
        </Field>

        <Field className="space-y-1">
          <FieldLabel htmlFor="hpTurn" className="text-xs font-semibold text-foreground">
            {t("turnaround")}
          </FieldLabel>
          <Input id="hpTurn" name="turnaroundHours" type="number" defaultValue={house.turnaroundHours} className="h-9 text-xs" />
        </Field>

        <Field className="space-y-1">
          <FieldLabel htmlFor="hpCut" className="text-xs font-semibold text-foreground">
            {t("cutoff")}
          </FieldLabel>
          <Input id="hpCut" name="cutoffMinutes" type="number" defaultValue={house.cutoffMinutes} className="h-9 text-xs" />
        </Field>

        <Field className="space-y-1">
          <FieldLabel htmlFor="hpCap" className="text-xs font-semibold text-foreground">
            {t("capacity")}
          </FieldLabel>
          <Input id="hpCap" name="dailyCapacity" type="number" defaultValue={house.dailyCapacity ?? ""} placeholder="Illimité" className="h-9 text-xs" />
        </Field>

        <Field className="space-y-1">
          <FieldLabel htmlFor="hpDist" className="text-xs font-semibold text-foreground">
            {t("distanceOverride")}
          </FieldLabel>
          <Input id="hpDist" name="maxDistanceLevel" type="number" defaultValue={house.maxDistanceLevel ?? ""} placeholder="Défaut global" className="h-9 text-xs" />
        </Field>
      </div>

      <Field className="space-y-1">
        <FieldLabel htmlFor="hpAddr" className="text-xs font-semibold text-foreground">
          Adresse précise / repère pour coursiers
        </FieldLabel>
        <Input id="hpAddr" name="addressNote" defaultValue={house.addressNote ?? ""} className="h-9 text-xs" />
      </Field>

      <div className="flex flex-wrap items-center gap-6 pt-2">
        <label className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer">
          <input type="checkbox" name="isActive" defaultChecked={house.isActive} value="true" className="rounded" />
          <span>Pressing actif sur la plateforme</span>
        </label>
        <label className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400 cursor-pointer">
          <input type="checkbox" name="isPaused" defaultChecked={house.isPaused} value="true" className="rounded" />
          <span>Suspendre temporairement</span>
        </label>
      </div>

      <div className="flex justify-end pt-3 border-t border-border">
        <Button type="submit" disabled={loading} size="sm" className="h-9">
          {loading ? "..." : "Enregistrer les modifications"}
        </Button>
      </div>
    </form>
  );
}
