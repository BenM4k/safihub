import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AlertCircle, RefreshCw } from "lucide-react";
import { listAdminHouses, listAdminOrdersPaginated } from "@/services/admin";
import type { AdminOrdersQueryParams } from "@/lib/admin-orders-query";
import { Button } from "@/components/ui/button";
import { OrdersManagementClient } from "./orders-management-client";

interface OrdersStreamContentProps {
  query: AdminOrdersQueryParams;
}

export async function OrdersStreamContent({ query }: OrdersStreamContentProps) {
  const [t, ordersRes, housesRes] = await Promise.all([
    getTranslations("admin.orders"),
    listAdminOrdersPaginated(query),
    listAdminHouses(),
  ]);

  if (!ordersRes.ok) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center space-y-4 rounded-2xl border border-destructive/30 bg-destructive-soft mt-6 font-sans animate-enter">
        <div className="w-12 h-12 mx-auto rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-bold text-heading font-display">
            {t("errorLoadingOrders")}
          </h2>
          <p className="text-xs text-destructive">{ordersRes.error}</p>
        </div>
        <div>
          <Button
            asChild
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary-hover text-xs min-h-11 px-4"
          >
            <Link href="/admin/orders">
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              {t("retryOrders")}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const houses = housesRes.ok
    ? housesRes.value.map((h) => ({ id: h.id, name: h.name }))
    : [];

  return (
    <OrdersManagementClient
      data={ordersRes.value}
      query={query}
      houses={houses}
    />
  );
}
