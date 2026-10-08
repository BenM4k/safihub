"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createMasterFabricAction, toggleMasterFabricActiveAction } from "@/actions/admin-catalog.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { MasterFabricRecord } from "@/dal";

interface FabricsTabProps {
  fabrics: MasterFabricRecord[];
}

export function FabricsTab({ fabrics }: FabricsTabProps) {
  const t = useTranslations("admin.catalogue");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  async function handleCreate(formData: FormData) {
    setError(null);
    setLoading(true);
    try {
      const res = await createMasterFabricAction(formData);
      if (!res.ok) {
        setError(res.error);
      } else {
        (document.getElementById("fabric-form-el") as HTMLFormElement)?.reset();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle(fabricId: string, nextActive: boolean) {
    setTogglingId(fabricId);
    setError(null);
    try {
      const res = await toggleMasterFabricActiveAction(fabricId, nextActive);
      if (!res.ok) {
        setError(res.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue");
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <form
        id="fabric-form-el"
        action={handleCreate}
        className="p-4 bg-slate-50/80 rounded-lg border border-border space-y-3"
      >
        <div className="font-bold text-xs text-heading">{t("addFabric")}</div>
        {error && <div className="text-xs text-destructive">{error}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="fabricNameFr" className="text-xs">{t("nameFr")}</Label>
            <Input id="fabricNameFr" name="nameFr" required placeholder="Coton, Soie, Laine..." className="h-9 text-xs" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="fabricNameSw" className="text-xs">{t("nameSw")}</Label>
            <Input id="fabricNameSw" name="nameSw" required placeholder="Pamba, Hariri..." className="h-9 text-xs" />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={loading} size="sm" className="h-9">
            {loading ? "..." : t("addFabric")}
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
                <th className="px-4 py-3">{t("status")}</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {fabrics.map((fabric) => (
                <tr key={fabric.id} className="hover:bg-slate-50/60 transition">
                  <td className="px-4 py-3 font-semibold text-heading">{fabric.nameFr}</td>
                  <td className="px-4 py-3 text-muted-foreground">{fabric.nameSw}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={fabric.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}>
                      {fabric.isActive ? t("active") : t("inactive")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={togglingId === fabric.id}
                      onClick={() => handleToggle(fabric.id, !fabric.isActive)}
                      className="h-7 text-xs"
                    >
                      {togglingId === fabric.id ? "..." : fabric.isActive ? "Désactiver" : "Activer"}
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
