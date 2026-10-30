import { listPartnerOrdersWithCount } from "@/services/house/partner-order.service";
import { PartnerOrdersEmptyState } from "./partner-orders-empty-state";
import { PartnerOrdersListView } from "./partner-orders-list-view";
import type { PartnerOrderTab } from "@/dal/partner-order.dal";

interface PartnerOrdersListSectionProps {
  houseId: string;
  searchParams: Promise<{
    tab?: string;
    search?: string;
    date?: string;
    sort?: string;
    page?: string;
    pageSize?: string;
  }>;
}

export async function PartnerOrdersListSection({
  houseId,
  searchParams,
}: PartnerOrdersListSectionProps) {
  const { tab, search, date, sort, page, pageSize } = await searchParams;

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

  const res = await listPartnerOrdersWithCount(houseId, {
    tab: validTab,
    search: search || undefined,
    date: date || undefined,
    sort: validSort,
    limit,
    offset,
  });

  const { orders, totalCount } = res.ok
    ? res.value
    : { orders: [], totalCount: 0 };

  if (orders.length === 0) {
    return <PartnerOrdersEmptyState tab={validTab} />;
  }

  return (
    <PartnerOrdersListView
      orders={orders}
      totalItems={totalCount}
      currentPage={currentPage}
      pageSize={validPageSize}
    />
  );
}

