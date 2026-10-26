"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createCourierAction } from "@/actions/admin-courier.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function CourierCreateForm() {
  const t = useTranslations("admin.couriers");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCreate(formData: FormData) {
    setError(null);
    setLoading(true);
    const res = await createCourierAction(formData);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
    } else {
      (document.getElementById("courier-form-el") as HTMLFormElement)?.reset();
    }
  }

  return (
    <form
      id="courier-form-el"
      action={handleCreate}
      className="p-5 bg-card rounded-lg border border-border shadow-xs space-y-4"
    >
      <div className="font-bold text-sm text-foreground">{t("addCourier")}</div>
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Field className="space-y-1">
          <FieldLabel htmlFor="crName" className="text-xs font-semibold text-foreground">
            Nom du coursier
          </FieldLabel>
          <Input id="crName" name="name" required placeholder="ex: Patrick Baraka" className="h-9 text-xs" />
        </Field>

        <Field className="space-y-1">
          <FieldLabel htmlFor="crEmail" className="text-xs font-semibold text-foreground">
            Email
          </FieldLabel>
          <Input id="crEmail" name="email" type="email" required placeholder="coursier@safihub.cd" className="h-9 text-xs" />
        </Field>

        <Field className="space-y-1">
          <FieldLabel htmlFor="crPhone" className="text-xs font-semibold text-foreground">
            Téléphone contact
          </FieldLabel>
          <Input id="crPhone" name="phone" required placeholder="+243..." className="h-9 text-xs" />
        </Field>

        <Field className="space-y-1">
          <FieldLabel htmlFor="crPass" className="text-xs font-semibold text-foreground">
            Mot de passe initial
          </FieldLabel>
          <Input id="crPass" name="password" type="password" placeholder="Min. 8 caractères" className="h-9 text-xs" />
        </Field>

        <Field className="space-y-1">
          <FieldLabel htmlFor="crCeil" className="text-xs font-semibold text-foreground">
            {t("cashCeiling")}
          </FieldLabel>
          <Input id="crCeil" name="cashCeiling" type="number" defaultValue="140000" className="h-9 text-xs" />
        </Field>

        <Field className="space-y-1">
          <FieldLabel htmlFor="crDep" className="text-xs font-semibold text-foreground">
            {t("securityDeposit")}
          </FieldLabel>
          <Input id="crDep" name="securityDeposit" type="number" defaultValue="25000" className="h-9 text-xs" />
        </Field>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={loading} size="sm" className="h-9">
          {loading ? "..." : t("addCourier")}
        </Button>
      </div>
    </form>
  );
}
