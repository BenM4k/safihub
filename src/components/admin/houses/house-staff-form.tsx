"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { linkHouseStaffAction, unlinkHouseStaffAction } from "@/actions/admin-house.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
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
    <div className="space-y-4">
      <div className="font-bold text-sm text-foreground">{t("staffTab")}</div>
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form id="staff-link-form" action={handleLink} className="p-3 bg-muted/20 rounded-lg border border-border flex items-end gap-3">
        <Field className="flex-1 space-y-1">
          <FieldLabel htmlFor="staffUserId" className="text-xs font-semibold text-foreground">
            {t("linkStaff")} (Identifiant utilisateur)
          </FieldLabel>
          <Input
            id="staffUserId"
            name="userId"
            required
            placeholder="ex: usr_house_001 ou identifiant..."
            className="h-8 text-xs"
          />
        </Field>
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
                <span className="font-semibold text-foreground">{m.name}</span>
                <span className="text-muted-foreground ml-2">({m.email})</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => unlinkHouseStaffAction(houseId, m.userId)}
                className="h-7 text-xs text-destructive hover:bg-destructive/10"
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
