"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { addHouseClosureAction, removeHouseClosureAction } from "@/actions/admin-house.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    <div className="p-5 bg-white rounded-xl border border-border shadow-xs space-y-4">
      <div className="font-bold text-sm text-heading">{t("closuresTab")}</div>
      {error && <div className="text-xs text-destructive">{error}</div>}

      <form id="closure-form-el" action={handleAdd} className="p-3 bg-slate-50/80 rounded-lg border border-border space-y-3">
        <div className="font-bold text-xs text-heading">{t("addClosure")}</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label htmlFor="clStart" className="text-xs">Date de début</Label>
            <Input id="clStart" name="startsOn" type="date" required className="h-8 text-xs" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="clEnd" className="text-xs">Date de fin</Label>
            <Input id="clEnd" name="endsOn" type="date" required className="h-8 text-xs" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="clReason" className="text-xs">Motif (férié, maintenance...)</Label>
            <Input id="clReason" name="reason" placeholder="ex: Travaux..." className="h-8 text-xs" />
          </div>
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
                <span className="font-semibold text-heading">{cl.startsOn}</span> au{" "}
                <span className="font-semibold text-heading">{cl.endsOn}</span>
                {cl.reason && <span className="text-muted-foreground ml-2">({cl.reason})</span>}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeHouseClosureAction(cl.id, houseId)}
                className="h-7 text-xs text-destructive hover:bg-red-50"
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
