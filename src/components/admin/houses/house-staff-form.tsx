"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { linkHouseStaffAction, unlinkHouseStaffAction } from "@/actions/admin-house.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { HouseStaffMemberRecord } from "@/dal";

interface HouseStaffFormProps {
  houseId: string;
  staff: HouseStaffMemberRecord[];
}

export function HouseStaffForm({ houseId, staff }: HouseStaffFormProps) {
  const t = useTranslations("admin.houses");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLink(formData: FormData) {
    setError(null);
    setLoading(true);
    const userId = String(formData.get("userId"));
    const res = await linkHouseStaffAction(houseId, userId);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
    } else {
      (document.getElementById("staff-link-form") as HTMLFormElement)?.reset();
    }
  }

  return (
    <div className="p-5 bg-white rounded-xl border border-border shadow-xs space-y-4">
      <div className="font-bold text-sm text-heading">{t("staffTab")}</div>
      {error && <div className="text-xs text-destructive">{error}</div>}

      <form id="staff-link-form" action={handleLink} className="p-3 bg-slate-50/80 rounded-lg border border-border flex items-end gap-3">
        <div className="flex-1 space-y-1">
          <Label htmlFor="staffUserId" className="text-xs">{t("linkStaff")} (Identifiant utilisateur)</Label>
          <Input id="staffUserId" name="userId" required placeholder="ex: usr_house_001 ou identifiant utilisateur..." className="h-8 text-xs bg-white" />
        </div>
        <Button type="submit" disabled={loading} size="sm" className="h-8 text-xs">
          {loading ? "..." : "Associer"}
        </Button>
      </form>

      <div className="divide-y divide-border">
        {staff.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2 italic">Aucun personnel associé à ce pressing.</p>
        ) : (
          staff.map((m) => (
            <div key={m.userId} className="py-2.5 flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-heading">{m.name}</span>
                <span className="text-muted-foreground ml-2">({m.email})</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => unlinkHouseStaffAction(houseId, m.userId)}
                className="h-7 text-xs text-destructive hover:bg-red-50"
              >
                Retirer
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
