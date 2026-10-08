import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { guardHouseRoute } from "@/services/auth";
import { getHouses } from "@/dal";
import { listHouseOrders } from "@/services/house";
import { OrdersFilterTabs } from "@/components/house/orders/orders-filter-tabs";
import { OrdersListTable } from "@/components/house/orders/orders-list-table";
import type { OrderStatus } from "@/services/db/schema";

export default async function HouseOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>;
}) {
  const { status, search } = await searchParams;
  const authCtx = await guardHouseRoute();
  let houseId = authCtx.houseId || authCtx.primaryHouseId;

  if (!houseId && authCtx.isAdminOverride) {
    const allHouses = await getHouses();
    if (allHouses.length > 0) {
      houseId = allHouses[0].id;
    }
  }

  if (!houseId) {
    return (
      <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-slate-500">
        Aucun pressing assigné à ce compte.
      </div>
    );
  }

  const t = await getTranslations("house.orders");

  const ordersRes = await listHouseOrders(houseId, {
    status: status as OrderStatus | undefined,
    search,
    limit: 50,
  });

  const orders = ordersRes.ok ? ordersRes.value : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {t("title")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t("subtitle")}
          </p>
        </div>

        <Suspense fallback={null}>
          <OrdersFilterTabs />
        </Suspense>
      </div>

      <OrdersListTable orders={orders} />
    </div>
  );
}
