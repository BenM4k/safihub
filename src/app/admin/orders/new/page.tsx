import {
  listAdminCatalog,
  listAdminHouses,
  listAdminNeighborhoods,
} from "@/services/admin";
import { ManualOrderForm } from "@/components/admin/orders/manual-order-form";

export default async function AdminNewOrderPage() {

  const [housesRes, neighRes, catalogRes] = await Promise.all([
    listAdminHouses(),
    listAdminNeighborhoods(),
    listAdminCatalog(),
  ]);

  const houses = housesRes.ok ? housesRes.value.filter((h) => h.isActive) : [];
  const neighborhoods = neighRes.ok ? neighRes.value.filter((n) => n.status === "served") : [];
  const catalog = catalogRes.ok
    ? catalogRes.value
    : { services: [], items: [], fabrics: [], requests: [] };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-heading tracking-tight">
          Saisie Manuelle de Commande
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Enregistrement direct d&apos;une commande reçue par WhatsApp ou appel téléphonique
        </p>
      </div>

      <ManualOrderForm
        houses={houses}
        neighborhoods={neighborhoods}
        services={catalog.services}
        items={catalog.items}
        fabrics={catalog.fabrics}
      />
    </div>
  );
}
