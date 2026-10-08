import { getTranslations } from "next-intl/server";
import { listAdminCatalog } from "@/services/admin";
import { CatalogueTabsContainer } from "@/components/admin/catalogue/catalogue-tabs-container";

export default async function AdminCataloguePage() {
  const t = await getTranslations("admin.catalogue");
  const catalogRes = await listAdminCatalog();

  const data = catalogRes.ok
    ? catalogRes.value
    : { services: [], items: [], fabrics: [], requests: [] };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-heading tracking-tight">
          {t("title")}
        </h1>
        <p className="text-xs text-muted-foreground mt-1">{t("subtitle")}</p>
      </div>

      {!catalogRes.ok && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-destructive">
          Erreur lors du chargement du catalogue : {catalogRes.error}
        </div>
      )}

      <CatalogueTabsContainer
        services={data.services}
        items={data.items}
        fabrics={data.fabrics}
        requests={data.requests}
      />
    </div>
  );
}
