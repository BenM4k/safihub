import { getTranslations } from "next-intl/server";
import type { NeighborhoodRecord } from "@/dal";
import { Badge } from "@/components/ui/badge";

interface NeighborhoodsTableProps {
  neighborhoods: NeighborhoodRecord[];
}

export async function NeighborhoodsTable({
  neighborhoods,
}: NeighborhoodsTableProps) {
  const t = await getTranslations("admin.neighborhoods");

  const statusBadge = (status: string) => {
    switch (status) {
      case "served":
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">{t("served")}</Badge>;
      case "paused":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">{t("paused")}</Badge>;
      default:
        return <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">{t("notServed")}</Badge>;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-border shadow-xs overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-bold text-heading">
          {t("neighborhoodsCard")}
        </h2>
        <span className="text-xs text-muted-foreground font-semibold">
          {neighborhoods.length} quartier(s)
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-border text-muted-foreground font-semibold">
            <tr>
              <th className="px-4 py-3">{t("neighborhoodName")}</th>
              <th className="px-4 py-3">{t("selectZone")}</th>
              <th className="px-4 py-3">{t("status")}</th>
              <th className="px-4 py-3">{t("pauseReason")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {neighborhoods.map((n) => (
              <tr key={n.id} className="hover:bg-slate-50/60 transition">
                <td className="px-4 py-3 font-semibold text-heading">
                  {n.name}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {n.zoneName}
                </td>
                <td className="px-4 py-3">{statusBadge(n.status)}</td>
                <td className="px-4 py-3 text-muted-foreground italic">
                  {n.pauseReason || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
