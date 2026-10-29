import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { guardHouseRoute } from "@/services/auth";
import {
  listPartnerOrders,
  getPartnerOrderTabCounts,
} from "@/services/house/partner-order.service";
import { PartnerOrdersContainer } from "@/components/house/orders/partner-orders-container";
import { PartnerOrdersSkeleton } from "@/components/house/orders/partner-orders-skeleton";
import type { PartnerOrderTab } from "@/dal/partner-order.dal";

interface PageProps {
  params: Promise<{ houseSlug: string }>;
  searchParams: Promise<{
    tab?: string;
    search?: string;
    date?: string;
    sort?: string;
    page?: string;
    pageSize?: string;
  }>;
}

export default async function PartnerOrdersPage({
  params,
  searchParams,
}: PageProps) {
  const { houseSlug } = await params;
  const { tab, search, date, sort, page, pageSize } = await searchParams;

  const authCtx = await guardHouseRoute({ houseSlug });
  const houseId = authCtx.houseId;

  if (!houseId) {
    notFound();
  }

  const t = await getTranslations("house.orders");

  const validTab = (["to_accept", "to_collect", "in_treatment", "ready", "delivered", "failed"].includes(tab || "")
    ? tab
    : "to_accept") as PartnerOrderTab;

  const validSort = (["deadline", "promised", "recent"].includes(sort || "")
    ? sort
    : "promised") as "deadline" | "promised" | "recent";

  const pageNum = parseInt(page || "1", 10);
  const currentPage = isNaN(pageNum) || pageNum < 1 ? 1 : pageNum;
  const pageSizeNum = parseInt(pageSize || "10", 10);
  const validPageSize = [10, 20, 50].includes(pageSizeNum) ? pageSizeNum : 10;
  const limit = validPageSize;
  const offset = (currentPage - 1) * limit;

  const [ordersRes, countsRes] = await Promise.all([
    listPartnerOrders(houseId, {
      tab: validTab,
      search: search || undefined,
      date: date || undefined,
      sort: validSort,
      limit,
      offset,
    }),
    getPartnerOrderTabCounts(houseId),
  ]);

  const initialOrders = ordersRes.ok ? ordersRes.value : [];
  const initialCounts = countsRes.ok
    ? countsRes.value
    : {
        to_accept: 0,
        to_collect: 0,
        in_treatment: 0,
        ready: 0,
        delivered: 0,
        failed: 0,
        total: 0,
      };

  return (
    <div className="space-y-6 sm:space-y-8 font-sans">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-heading font-display tracking-tight">
            {t("title")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
            {t("subtitle")}
          </p>
        </div>
      </div>

      <Suspense fallback={<PartnerOrdersSkeleton />}>
        <PartnerOrdersContainer
          initialOrders={initialOrders}
          initialCounts={initialCounts}
          houseSlug={houseSlug}
        />
      </Suspense>
    </div>
  );
}
