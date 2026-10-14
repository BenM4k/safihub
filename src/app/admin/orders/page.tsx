import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AlertCircle, PlusCircle, RefreshCw } from "lucide-react";
import { listAdminHouses, listAdminOrders } from "@/services/admin";
import { Button } from "@/components/ui/button";
import { OrdersManagementClient } from "@/components/admin/orders/orders-management-client";

export default async function AdminOrdersPage() {
  const t = await getTranslations("admin.orders");

  const [ordersRes, housesRes] = await Promise.all([
    listAdminOrders({ limit: 500 }),
    listAdminHouses(),
  ]);

  if (!ordersRes.ok) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center space-y-4 rounded-2xl border border-destructive/30 bg-destructive-soft mt-12 font-sans">
        <div className="w-12 h-12 mx-auto rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-bold text-heading font-display">
            Erreur lors du chargement des commandes
          </h2>
          <p className="text-xs text-destructive">{ordersRes.error}</p>
        </div>
        <div>
          <Link href="/admin/orders">
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary-hover text-xs min-h-[40px] px-4">
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Réessayer
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const orders = ordersRes.value;
  const houses = housesRes.ok
    ? housesRes.value.map((h) => ({ id: h.id, name: h.name }))
    : [];

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Page Header & Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-border-strong pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-heading font-display">
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("subtitle")}
          </p>
        </div>

        {/* Single Primary Button: Nouvelle commande */}
        <Link href="/admin/orders/new" className="self-start sm:self-auto">
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary-hover font-semibold text-xs px-4 py-2 gap-2 shadow-sm hover:shadow-md transition-all cursor-pointer">
            <PlusCircle className="size-4" />
            <span>{t("newOrderBtn")}</span>
          </Button>
        </Link>
      </div>

      {/* 2. Client Table & Workflows */}
      <OrdersManagementClient initialOrders={orders} houses={houses} />
    </div>
  );
}
