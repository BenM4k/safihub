import { listPartnerOrdersWithCount } from "@/services/house/partner-order.service";
import { PartnerOrdersEmptyState } from "./partner-orders-empty-state";
import { PartnerOrdersListView } from "./partner-orders-list-view";
import { parsePartnerOrderTab } from "./partner-orders-helpers";

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

  const validTab = parsePartnerOrderTab(tab);

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

  if (totalCount === 0) {
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

