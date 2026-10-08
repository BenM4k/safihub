"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createCourierAction } from "@/actions/admin-courier.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
      className="p-5 bg-white rounded-xl border border-border shadow-xs space-y-4"
    >
      <div className="font-bold text-sm text-heading">{t("addCourier")}</div>
      {error && <div className="text-xs text-destructive">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1">
          <Label htmlFor="crName" className="text-xs">Nom du coursier</Label>
          <Input id="crName" name="name" required placeholder="ex: Patrick Baraka" className="h-9 text-xs" />
        </div>

        <div className="space-y-1">
          <Label htmlFor="crEmail" className="text-xs">Email</Label>
          <Input id="crEmail" name="email" type="email" required placeholder="coursier@safihub.cd" className="h-9 text-xs" />
        </div>

        <div className="space-y-1">
          <Label htmlFor="crPhone" className="text-xs">Téléphone contact</Label>
          <Input id="crPhone" name="phone" required placeholder="+243..." className="h-9 text-xs" />
        </div>

        <div className="space-y-1">
          <Label htmlFor="crPass" className="text-xs">Mot de passe initial</Label>
          <Input id="crPass" name="password" type="password" placeholder="Min. 8 caractères" className="h-9 text-xs" />
        </div>

        <div className="space-y-1">
          <Label htmlFor="crCeil" className="text-xs">{t("cashCeiling")}</Label>
          <Input id="crCeil" name="cashCeiling" type="number" defaultValue="100000" className="h-9 text-xs" />
        </div>

        <div className="space-y-1">
          <Label htmlFor="crDep" className="text-xs">{t("securityDeposit")}</Label>
          <Input id="crDep" name="securityDeposit" type="number" defaultValue="25000" className="h-9 text-xs" />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading} size="sm" className="h-9">
          {loading ? "..." : t("addCourier")}
        </Button>
      </div>
    </form>
  );
}
