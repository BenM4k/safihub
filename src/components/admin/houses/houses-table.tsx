import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import type { HouseRecord } from "@/dal";

interface HousesTableProps {
  houses: HouseRecord[];
}

export async function HousesTable({ houses }: HousesTableProps) {
  const t = await getTranslations("admin.houses");

  return (
    <div className="bg-white rounded-xl border border-border shadow-xs overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-bold text-heading">{t("title")}</h2>
        <span className="text-xs text-muted-foreground font-semibold">
          {houses.length} pressing(s)
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-border text-muted-foreground font-semibold">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Quartier</th>
              <th className="px-4 py-3">Téléphone</th>
              <th className="px-4 py-3">Commission</th>
              <th className="px-4 py-3">Min. commande</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {houses.map((h) => (
              <tr key={h.id} className="hover:bg-slate-50/60 transition">
                <td className="px-4 py-3 font-semibold text-heading">
                  <Link href={`/admin/houses/${h.id}`} className="hover:text-primary transition underline-offset-2 hover:underline">
                    {h.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{h.neighborhoodName}</td>
                <td className="px-4 py-3 text-muted-foreground">{h.contactPhone || "—"}</td>
                <td className="px-4 py-3 font-mono font-medium">
                  {h.commissionBps !== null ? `${h.commissionBps / 100}%` : "Défaut"}
                </td>
                <td className="px-4 py-3 font-mono font-medium">
                  {h.minimumOrderAmount.toLocaleString()} CDF
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className={h.isActive && !h.isPaused ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}>
                    {h.isActive && !h.isPaused ? "Actif" : h.isPaused ? "Suspendu" : "Inactif"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/houses/${h.id}`}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Gérer →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
