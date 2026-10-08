import { getTranslations } from "next-intl/server";
import { listAdminNeighborhoods, listAdminZones } from "@/services/admin";
import { ZonesCard } from "@/components/admin/neighborhoods/zones-card";
import { NeighborhoodsTable } from "@/components/admin/neighborhoods/neighborhoods-table";
import { NeighborhoodForm } from "@/components/admin/neighborhoods/neighborhood-form";

export default async function AdminNeighborhoodsPage() {
  const t = await getTranslations("admin.neighborhoods");

  const [zonesRes, neighRes] = await Promise.all([
    listAdminZones(),
    listAdminNeighborhoods(),
  ]);

  const zones = zonesRes.ok ? zonesRes.value : [];
  const neighborhoods = neighRes.ok ? neighRes.value : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-heading tracking-tight">
          {t("title")}
        </h1>
        <p className="text-xs text-muted-foreground mt-1">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ZonesCard zones={zones} />
        </div>

        <div className="lg:col-span-2 space-y-4">
          <NeighborhoodsTable neighborhoods={neighborhoods} />
          <div className="bg-white p-5 rounded-xl border border-border shadow-xs">
            <NeighborhoodForm zones={zones} />
          </div>
        </div>
      </div>
    </div>
  );
}
