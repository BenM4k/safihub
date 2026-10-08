import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { guardHouseRoute } from "@/services/auth";
import { getHouses } from "@/dal";
import { listHouseOrders } from "@/services/house";
import { OrdersFilterTabs } from "@/components/house/orders/orders-filter-tabs";
import { OrdersListTable } from "@/components/house/orders/orders-list-table";
import { orderStatusEnum, type OrderStatus } from "@/services/db/schema";

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

  const validStatus =
    status && (orderStatusEnum.enumValues as readonly string[]).includes(status)
      ? (status as OrderStatus)
      : undefined;

  const ordersRes = await listHouseOrders(houseId, {
    status: validStatus,
    search,
    limit: 50,
  });

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

      {!ordersRes.ok ? (
        <div className="p-6 bg-rose-50 text-rose-700 rounded-2xl border border-rose-200 text-sm">
          {ordersRes.error}
        </div>
      ) : (
        <OrdersListTable orders={ordersRes.value} />
      )}
    </div>
  );
}
