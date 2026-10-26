"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { addHouseExclusionAction, removeHouseExclusionAction } from "@/actions/admin-house.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import type { HouseExclusionRecord, MasterFabricRecord, MasterItemRecord } from "@/dal";

interface HouseExclusionsFormProps {
  houseId: string;
  exclusions: HouseExclusionRecord[];
  masterItems: MasterItemRecord[];
  masterFabrics: MasterFabricRecord[];
}

export function HouseExclusionsForm({
  houseId,
  exclusions,
  masterItems,
  masterFabrics,
}: HouseExclusionsFormProps) {
  const t = useTranslations("admin.houses");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleAdd(formData: FormData) {
    setError(null);
    setLoading(true);
    formData.append("houseId", houseId);
    const res = await addHouseExclusionAction(formData);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
    } else {
      (document.getElementById("excl-form-el") as HTMLFormElement)?.reset();
    }
  }

  return (
    <div className="space-y-4">
      <div className="font-bold text-sm text-foreground">{t("exclusionsTab")}</div>
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form id="excl-form-el" action={handleAdd} className="p-3 bg-muted/20 rounded-lg border border-border space-y-3">
        <div className="font-semibold text-xs text-foreground">{t("addExclusion")}</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field className="space-y-1">
            <FieldLabel htmlFor="exItem" className="text-xs font-semibold text-foreground">
              Article exclu (optionnel)
            </FieldLabel>
            <select
              id="exItem"
              name="itemId"
              className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs text-foreground ring-offset-background"
            >
              <option value="">-- Aucun --</option>
              {masterItems.map((it) => (
                <option key={it.id} value={it.id}>{it.nameFr}</option>
              ))}
            </select>
          </Field>

          <Field className="space-y-1">
            <FieldLabel htmlFor="exFabric" className="text-xs font-semibold text-foreground">
              Tissu exclu (optionnel)
            </FieldLabel>
            <select
              id="exFabric"
              name="fabricId"
              className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs text-foreground ring-offset-background"
            >
              <option value="">-- Aucun --</option>
              {masterFabrics.map((f) => (
                <option key={f.id} value={f.id}>{f.nameFr}</option>
              ))}
            </select>
          </Field>

          <Field className="space-y-1">
            <FieldLabel htmlFor="exNote" className="text-xs font-semibold text-foreground">
              Remarque pour le client
            </FieldLabel>
            <Input id="exNote" name="note" placeholder="ex: Risque de décoloration..." className="h-8 text-xs" />
          </Field>
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={loading} size="sm" className="h-8 text-xs">
            {loading ? "..." : t("addExclusion")}
          </Button>
        </div>
      </form>

      <div className="divide-y divide-border">
        {exclusions.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2 italic">Aucun article exclu.</p>
        ) : (
          exclusions.map((ex) => (
            <div key={ex.id} className="py-2.5 flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-foreground">
                  {ex.itemNameFr || ex.fabricNameFr || "Exclusion"}
                </span>
                {ex.note && <span className="text-muted-foreground ml-2">({ex.note})</span>}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeHouseExclusionAction(ex.id, houseId)}
                className="h-7 text-xs text-destructive hover:bg-destructive/10"
              >
                Supprimer
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
