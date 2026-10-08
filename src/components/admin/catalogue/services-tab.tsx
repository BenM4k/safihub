"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createMasterServiceAction } from "@/actions/admin-catalog.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { MasterServiceRecord } from "@/dal";

interface ServicesTabProps {
  services: MasterServiceRecord[];
}

export function ServicesTab({ services }: ServicesTabProps) {
  const t = useTranslations("admin.catalogue");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCreate(formData: FormData) {
    setError(null);
    setLoading(true);
    const res = await createMasterServiceAction(formData);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
    } else {
      (document.getElementById("serv-form-el") as HTMLFormElement)?.reset();
    }
  }

  return (
    <div className="space-y-4">
      <form
        id="serv-form-el"
        action={handleCreate}
        className="p-4 bg-slate-50/80 rounded-lg border border-border space-y-3"
      >
        <div className="font-bold text-xs text-heading">{t("addService")}</div>
        {error && <div className="text-xs text-destructive">{error}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label htmlFor="servSlug" className="text-xs">{t("slug")}</Label>
            <Input id="servSlug" name="slug" required placeholder="wash, iron, dry_clean..." className="h-9 text-xs" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="servNameFr" className="text-xs">{t("nameFr")}</Label>
            <Input id="servNameFr" name="nameFr" required placeholder="Lavage & Repassage..." className="h-9 text-xs" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="servNameSw" className="text-xs">{t("nameSw")}</Label>
            <Input id="servNameSw" name="nameSw" required placeholder="Kufua & Kupiga pasi..." className="h-9 text-xs" />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={loading} size="sm" className="h-9">
            {loading ? "..." : t("addService")}
          </Button>
        </div>
      </form>

      <div className="bg-white rounded-xl border border-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-border text-muted-foreground font-semibold">
              <tr>
                <th className="px-4 py-3">{t("slug")}</th>
                <th className="px-4 py-3">{t("nameFr")}</th>
                <th className="px-4 py-3">{t("nameSw")}</th>
                <th className="px-4 py-3">{t("status")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {services.map((service) => (
                <tr key={service.id} className="hover:bg-slate-50/60 transition">
                  <td className="px-4 py-3 font-mono font-semibold text-primary">{service.slug}</td>
                  <td className="px-4 py-3 font-semibold text-heading">{service.nameFr}</td>
                  <td className="px-4 py-3 text-muted-foreground">{service.nameSw}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={service.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}>
                      {service.isActive ? t("active") : t("inactive")}
                    </Badge>
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
