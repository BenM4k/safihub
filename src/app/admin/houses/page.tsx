import { getTranslations } from "next-intl/server";
import { listAdminHouses, listAdminNeighborhoods } from "@/services/admin";
import { HousesTable } from "@/components/admin/houses/houses-table";
import { HouseCreateForm } from "@/components/admin/houses/house-create-form";

export default async function AdminHousesPage() {
  const t = await getTranslations("admin.houses");

  const [housesRes, neighRes] = await Promise.all([
    listAdminHouses(),
    listAdminNeighborhoods(),
  ]);

  const houses = housesRes.ok ? housesRes.value : [];
  const neighborhoods = neighRes.ok ? neighRes.value : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-heading tracking-tight">
          {t("title")}
        </h1>
        <p className="text-xs text-muted-foreground mt-1">{t("subtitle")}</p>
      </div>

      <HouseCreateForm neighborhoods={neighborhoods} />
      <HousesTable houses={houses} />
    </div>
  );
}
