import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { guardHouseRoute } from "@/services/auth";
import { listHouseOrders } from "@/services/house";
import { OrdersFilterTabs } from "@/components/house/orders/orders-filter-tabs";
import { OrdersListTable } from "@/components/house/orders/orders-list-table";
import { orderStatusEnum, type OrderStatus } from "@/services/db/schema";

interface PageProps {
  params: Promise<{ houseSlug: string }>;
  searchParams: Promise<{ status?: string; search?: string }>;
}

export default async function PartnerOrdersPage({
  params,
  searchParams,
}: PageProps) {
  const { houseSlug } = await params;
  const { status, search } = await searchParams;

  const authCtx = await guardHouseRoute({ houseSlug });
  const houseId = authCtx.houseId;

  if (!houseId) {
    notFound();
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
          <OrdersFilterTabs houseSlug={houseSlug} />
        </Suspense>
      </div>

      <OrdersListTable orders={orders} houseSlug={houseSlug} />
    </div>
  );
}
