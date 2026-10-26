"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { addHouseClosureAction, removeHouseClosureAction } from "@/actions/admin-house.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import type { HouseClosureRecord } from "@/dal";

interface HouseClosuresFormProps {
  houseId: string;
  closures: HouseClosureRecord[];
}

export function HouseClosuresForm({ houseId, closures }: HouseClosuresFormProps) {
  const t = useTranslations("admin.houses");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleAdd(formData: FormData) {
    setError(null);
    setLoading(true);
    formData.append("houseId", houseId);
    const res = await addHouseClosureAction(formData);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
    } else {
      (document.getElementById("closure-form-el") as HTMLFormElement)?.reset();
    }
  }

  return (
    <div className="space-y-4">
      <div className="font-bold text-sm text-foreground">{t("closuresTab")}</div>
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form id="closure-form-el" action={handleAdd} className="p-3 bg-muted/20 rounded-lg border border-border space-y-3">
        <div className="font-semibold text-xs text-foreground">{t("addClosure")}</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field className="space-y-1">
            <FieldLabel htmlFor="clStart" className="text-xs font-semibold text-foreground">
              Date de début
            </FieldLabel>
            <Input id="clStart" name="startsOn" type="date" required className="h-8 text-xs" />
          </Field>
          <Field className="space-y-1">
            <FieldLabel htmlFor="clEnd" className="text-xs font-semibold text-foreground">
              Date de fin
            </FieldLabel>
            <Input id="clEnd" name="endsOn" type="date" required className="h-8 text-xs" />
          </Field>
          <Field className="space-y-1">
            <FieldLabel htmlFor="clReason" className="text-xs font-semibold text-foreground">
              Motif (férié, maintenance...)
            </FieldLabel>
            <Input id="clReason" name="reason" placeholder="ex: Travaux..." className="h-8 text-xs" />
          </Field>
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={loading} size="sm" className="h-8 text-xs">
            {loading ? "..." : t("addClosure")}
          </Button>
        </div>
      </form>

      <div className="divide-y divide-border">
        {closures.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2 italic">Aucune fermeture enregistrée.</p>
        ) : (
          closures.map((cl) => (
            <div key={cl.id} className="py-2.5 flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-foreground">{cl.startsOn}</span> au{" "}
                <span className="font-semibold text-foreground">{cl.endsOn}</span>
                {cl.reason && <span className="text-muted-foreground ml-2">({cl.reason})</span>}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeHouseClosureAction(cl.id, houseId)}
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
