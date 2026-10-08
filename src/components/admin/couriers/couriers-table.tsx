import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import type { CourierRecord } from "@/dal";

interface CouriersTableProps {
  couriers: CourierRecord[];
}

export async function CouriersTable({ couriers }: CouriersTableProps) {
  const t = await getTranslations("admin.couriers");

  return (
    <div className="bg-white rounded-xl border border-border shadow-xs overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-bold text-heading">{t("title")}</h2>
        <span className="text-xs text-muted-foreground font-semibold">
          {couriers.length} coursier(s)
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-border text-muted-foreground font-semibold">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Téléphone</th>
              <th className="px-4 py-3">Plafond espèces</th>
              <th className="px-4 py-3">Dépôt garantie</th>
              <th className="px-4 py-3">Créneaux / Zones</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {couriers.map((c) => (
              <tr key={c.userId} className="hover:bg-slate-50/60 transition">
                <td className="px-4 py-3 font-semibold text-heading">
                  <Link href={`/admin/couriers/${c.userId}`} className="hover:text-primary transition underline-offset-2 hover:underline">
                    {c.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{c.contactPhone || "—"}</td>
                <td className="px-4 py-3 font-mono font-bold text-heading">
                  {c.cashCeiling ? `${c.cashCeiling.toLocaleString()} CDF` : "Défaut"}
                </td>
                <td className="px-4 py-3 font-mono text-muted-foreground">
                  {c.securityDeposit.toLocaleString()} CDF
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {c.shiftCount} créneau(x) • {c.coveredZoneCount} zone(s)
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className={c.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}>
                    {c.isActive ? "Actif" : "Inactif"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/couriers/${c.userId}`}
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
