"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { updateCourierProfileAction } from "@/actions/admin-courier.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Check } from "lucide-react";
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Field className="space-y-1">
          <FieldLabel htmlFor="cpCeil" className="text-xs font-semibold text-foreground">
            {t("cashCeiling")}
          </FieldLabel>
          <Input
            id="cpCeil"
            name="cashCeiling"
            type="number"
            defaultValue={courier.cashCeiling ?? ""}
            placeholder="Défaut"
            className="h-9 text-xs"
          />
        </Field>

        <Field className="space-y-1">
          <FieldLabel htmlFor="cpDep" className="text-xs font-semibold text-foreground">
            {t("securityDeposit")}
          </FieldLabel>
          <Input
            id="cpDep"
            name="securityDeposit"
            type="number"
            defaultValue={courier.securityDeposit}
            className="h-9 text-xs"
          />
        </Field>

        <Field className="space-y-1">
          <FieldLabel htmlFor="cpFloat" className="text-xs font-semibold text-foreground">
            {t("changeFloat")}
          </FieldLabel>
          <Input
            id="cpFloat"
            name="changeFloat"
            type="number"
            defaultValue={courier.changeFloat}
            className="h-9 text-xs"
          />
        </Field>

        <Field className="space-y-1">
          <FieldLabel htmlFor="cpPay" className="text-xs font-semibold text-foreground">
            {t("payPerLeg")}
          </FieldLabel>
          <Input
            id="cpPay"
            name="payPerLeg"
            type="number"
            defaultValue={courier.payPerLeg ?? ""}
            placeholder="Défaut"
            className="h-9 text-xs"
          />
        </Field>
      </div>

      <div className="pt-2">
        <label className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={courier.isActive}
            value="true"
            className="rounded"
          />
          <span>Coursier actif pour les missions</span>
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
