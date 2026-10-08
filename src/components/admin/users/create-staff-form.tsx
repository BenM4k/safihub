"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createStaffAccountAction } from "@/actions/admin-user.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateStaffForm() {
  const t = useTranslations("admin.users");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCreate(formData: FormData) {
    setError(null);
    setSuccess(null);
    setLoading(true);
    const res = await createStaffAccountAction(formData);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
    } else {
      setSuccess("Compte staff créé avec succès !");
      (document.getElementById("staff-acc-form") as HTMLFormElement)?.reset();
    }
  }

  return (
    <form id="staff-acc-form" action={handleCreate} className="p-5 bg-white rounded-xl border border-border shadow-xs space-y-3">
      <div className="font-bold text-sm text-heading">{t("createStaff")}</div>
      {error && <div className="text-xs text-destructive">{error}</div>}
      {success && <div className="text-xs text-emerald-600 font-semibold">{success}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="space-y-1">
          <Label htmlFor="stName" className="text-xs">Nom complet</Label>
          <Input id="stName" name="name" required placeholder="ex: Eric Munyaga" className="h-9 text-xs" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="stEmail" className="text-xs">Email (requis)</Label>
          <Input id="stEmail" name="email" type="email" required placeholder="staff@safihub.cd" className="h-9 text-xs" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="stRole" className="text-xs">Rôle</Label>
          <select id="stRole" name="role" required className="h-9 w-full rounded border border-input bg-white px-2 text-xs">
            <option value="courier">Coursier</option>
            <option value="house">Personnel pressing</option>
            <option value="admin">Administrateur</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="stPhone" className="text-xs">Téléphone</Label>
          <Input id="stPhone" name="phone" placeholder="+243..." className="h-9 text-xs" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="stPass" className="text-xs">Mot de passe</Label>
          <Input id="stPass" name="password" type="password" required minLength={8} placeholder="Min. 8 car." className="h-9 text-xs" />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={loading} size="sm" className="h-9">
          {loading ? "..." : t("createStaff")}
        </Button>
      </div>
    </form>
  );
}
