"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { updateCourierProfileAction } from "@/actions/admin-courier.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CourierRecord } from "@/dal";

interface CourierProfileFormProps {
  courier: CourierRecord;
}

export function CourierProfileForm({ courier }: CourierProfileFormProps) {
  const t = useTranslations("admin.couriers");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleUpdate(formData: FormData) {
    setError(null);
    setSuccess(null);
    setLoading(true);
    const res = await updateCourierProfileAction(courier.userId, formData);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
    } else {
      setSuccess("Paramètres financiers du coursier mis à jour");
    }
  }

  return (
    <form action={handleUpdate} className="p-5 bg-white rounded-xl border border-border shadow-xs space-y-4">
      <div className="font-bold text-sm text-heading">{t("profileTab")}</div>
      {error && <div className="text-xs text-destructive">{error}</div>}
      {success && <div className="text-xs text-emerald-600 font-semibold">{success}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="space-y-1">
          <Label htmlFor="cpCeil" className="text-xs">{t("cashCeiling")}</Label>
          <Input id="cpCeil" name="cashCeiling" type="number" defaultValue={courier.cashCeiling ?? ""} placeholder="Défaut" className="h-9 text-xs" />
        </div>

        <div className="space-y-1">
          <Label htmlFor="cpDep" className="text-xs">{t("securityDeposit")}</Label>
          <Input id="cpDep" name="securityDeposit" type="number" defaultValue={courier.securityDeposit} className="h-9 text-xs" />
        </div>

        <div className="space-y-1">
          <Label htmlFor="cpFloat" className="text-xs">{t("changeFloat")}</Label>
          <Input id="cpFloat" name="changeFloat" type="number" defaultValue={courier.changeFloat} className="h-9 text-xs" />
        </div>

        <div className="space-y-1">
          <Label htmlFor="cpPay" className="text-xs">{t("payPerLeg")}</Label>
          <Input id="cpPay" name="payPerLeg" type="number" defaultValue={courier.payPerLeg ?? ""} placeholder="Défaut" className="h-9 text-xs" />
        </div>
      </div>

      <div className="pt-2">
        <label className="flex items-center gap-2 text-xs font-semibold text-heading cursor-pointer">
          <input type="checkbox" name="isActive" defaultChecked={courier.isActive} value="true" className="rounded" />
          <span>Coursier actif pour les missions</span>
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
