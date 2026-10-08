"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createMasterItemAction, toggleMasterItemActiveAction } from "@/actions/admin-catalog.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { MasterItemRecord } from "@/dal";

interface ItemsTabProps {
  items: MasterItemRecord[];
}

export function ItemsTab({ items }: ItemsTabProps) {
  const t = useTranslations("admin.catalogue");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCreate(formData: FormData) {
    setError(null);
    setLoading(true);
    const res = await createMasterItemAction(formData);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
    } else {
      (document.getElementById("item-form-el") as HTMLFormElement)?.reset();
    }
  }

  return (
    <div className="space-y-4">
      <form
        id="item-form-el"
        action={handleCreate}
        className="p-4 bg-slate-50/80 rounded-lg border border-border space-y-3"
      >
        <div className="font-bold text-xs text-heading">{t("addItem")}</div>
        {error && <div className="text-xs text-destructive">{error}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label htmlFor="itemNameFr" className="text-xs">{t("nameFr")}</Label>
            <Input id="itemNameFr" name="nameFr" required placeholder="Chemise, Robe..." className="h-9 text-xs" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="itemNameSw" className="text-xs">{t("nameSw")}</Label>
            <Input id="itemNameSw" name="nameSw" required placeholder="Shati, Gauni..." className="h-9 text-xs" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="itemCategory" className="text-xs">{t("category")}</Label>
            <Input id="itemCategory" name="category" placeholder="tops, bottoms, bedding..." className="h-9 text-xs" />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={loading} size="sm" className="h-9">
            {loading ? "..." : t("addItem")}
          </Button>
        </div>
      </form>

      <div className="bg-white rounded-xl border border-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-border text-muted-foreground font-semibold">
              <tr>
                <th className="px-4 py-3">{t("nameFr")}</th>
                <th className="px-4 py-3">{t("nameSw")}</th>
                <th className="px-4 py-3">{t("category")}</th>
                <th className="px-4 py-3">{t("status")}</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60 transition">
                  <td className="px-4 py-3 font-semibold text-heading">{item.nameFr}</td>
                  <td className="px-4 py-3 text-muted-foreground">{item.nameSw}</td>
                  <td className="px-4 py-3 text-muted-foreground">{item.category || "—"}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={item.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}>
                      {item.isActive ? t("active") : t("inactive")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleMasterItemActiveAction(item.id, !item.isActive)}
                      className="h-7 text-xs"
                    >
                      {item.isActive ? "Désactiver" : "Activer"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
