"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { setNeighborhoodStatusAction } from "@/actions/admin-coverage.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { NeighborhoodRecord } from "@/dal";

interface NeighborhoodStatusTableProps {
  neighborhoods: NeighborhoodRecord[];
}

export function NeighborhoodStatusTable({
  neighborhoods,
}: NeighborhoodStatusTableProps) {
  const t = useTranslations("admin.coverage");
  const tN = useTranslations("admin.neighborhoods");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpdate(formData: FormData) {
    setError(null);
    setLoading(true);
    const res = await setNeighborhoodStatusAction(formData);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
    } else {
      setEditingId(null);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-border shadow-xs overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-bold text-heading">
          {t("neighborhoodStatusTitle")}
        </h2>
        {error && <span className="text-xs text-destructive">{error}</span>}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-border text-muted-foreground font-semibold">
            <tr>
              <th className="px-4 py-3">{tN("neighborhoodName")}</th>
              <th className="px-4 py-3">{tN("selectZone")}</th>
              <th className="px-4 py-3">{tN("status")}</th>
              <th className="px-4 py-3">{tN("pauseReason")}</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {neighborhoods.map((n) => {
              const isEditing = editingId === n.id;

              if (isEditing) {
                return (
                  <tr key={n.id} className="bg-slate-50/80">
                    <td colSpan={5} className="p-4">
                      <form action={handleUpdate} className="flex flex-wrap items-center gap-3">
                        <input type="hidden" name="id" value={n.id} />
                        <span className="font-bold text-heading text-xs w-36">
                          {n.name}
                        </span>
                        <select
                          name="status"
                          defaultValue={n.status}
                          className="h-8 rounded border border-input bg-white px-2 text-xs"
                        >
                          <option value="served">{tN("served")}</option>
                          <option value="paused">{tN("paused")}</option>
                          <option value="not_served">{tN("notServed")}</option>
                        </select>
                        <Input
                          name="pauseReason"
                          placeholder="Motif de suspension (AC 19)..."
                          defaultValue={n.pauseReason ?? ""}
                          className="h-8 text-xs flex-1 min-w-[200px]"
                        />
                        <div className="flex gap-2">
                          <Button type="submit" disabled={loading} size="sm" className="h-8 px-3 text-xs">
                            {loading ? "..." : tN("save")}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setEditingId(null)}
                            size="sm"
                            className="h-8 px-3 text-xs"
                          >
                            Annuler
                          </Button>
                        </div>
                      </form>
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={n.id} className="hover:bg-slate-50/60 transition">
                  <td className="px-4 py-3 font-semibold text-heading">
                    {n.name}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {n.zoneName}
                  </td>
                  <td className="px-4 py-3">
                    {n.status === "served" && (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                        {tN("served")}
                      </Badge>
                    )}
                    {n.status === "paused" && (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        {tN("paused")}
                      </Badge>
                    )}
                    {n.status === "not_served" && (
                      <Badge variant="outline" className="bg-slate-100 text-slate-600">
                        {tN("notServed")}
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground italic">
                    {n.pauseReason || "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingId(n.id)}
                      className="h-7 text-xs text-primary font-semibold"
                    >
                      Modifier
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
