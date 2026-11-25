export type AdminOrderTab =
  | "all"
  | "today"
  | "awaiting"
  | "in_progress"
  | "delivered"
  | "cancelled";

export type AdminOrderDateRange = "today" | "7d" | "30d" | "all";
export type AdminOrderSortField = "date" | "amount" | "code" | "customer";
export type AdminOrderSortDirection = "asc" | "desc";
export type AdminOrderSourceFilter = "" | "app" | "whatsapp" | "phone";

export interface AdminOrdersQueryParams {
  search: string;
  tab: AdminOrderTab;
  dateRange: AdminOrderDateRange;
  houseId: string;
  source: AdminOrderSourceFilter;
  sortField: AdminOrderSortField;
  sortDirection: AdminOrderSortDirection;
  page: number;
  pageSize: number;
}

export const DEFAULT_ADMIN_ORDERS_QUERY: AdminOrdersQueryParams = {
  search: "",
  tab: "all",
  dateRange: "30d",
  houseId: "",
  source: "",
  sortField: "date",
  sortDirection: "desc",
  page: 1,
  pageSize: 20,
};

const VALID_TABS = new Set<AdminOrderTab>([
  "all",
  "today",
  "awaiting",
  "in_progress",
  "delivered",
  "cancelled",
]);

const VALID_DATE_RANGES = new Set<AdminOrderDateRange>([
  "today",
  "7d",
  "30d",
  "all",
]);

const VALID_SORT_FIELDS = new Set<AdminOrderSortField>([
  "date",
  "amount",
  "code",
  "customer",
]);

const VALID_SOURCES = new Set<AdminOrderSourceFilter>([
  "",
  "app",
  "whatsapp",
  "phone",
]);

const ALLOWED_PAGE_SIZES = new Set([10, 20, 50, 100]);

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function pickSingle(
  value: string | string[] | undefined | null
): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export function parseAdminOrdersSearchParams(
  raw: Record<string, string | string[] | undefined>
): AdminOrdersQueryParams {
  const rawTab = pickSingle(raw.tab).trim() as AdminOrderTab;
  const rawRange = pickSingle(raw.dateRange).trim() as AdminOrderDateRange;
  const rawHouseId = pickSingle(raw.houseId).trim();
  const rawSource = pickSingle(raw.source).trim() as AdminOrderSourceFilter;
  const rawSortField = pickSingle(raw.sortField).trim() as AdminOrderSortField;
  const rawSortDir = pickSingle(raw.sortDirection).trim();
  const rawPage = Number.parseInt(pickSingle(raw.page), 10);
  const rawPageSize = Number.parseInt(pickSingle(raw.pageSize), 10);
  const rawSearch = pickSingle(raw.search).trim().slice(0, 120);

  return {
    search: rawSearch,
    tab: VALID_TABS.has(rawTab) ? rawTab : DEFAULT_ADMIN_ORDERS_QUERY.tab,
    dateRange: VALID_DATE_RANGES.has(rawRange)
      ? rawRange
      : DEFAULT_ADMIN_ORDERS_QUERY.dateRange,
    houseId: UUID_REGEX.test(rawHouseId) ? rawHouseId : "",
    source: VALID_SOURCES.has(rawSource) ? rawSource : "",
    sortField: VALID_SORT_FIELDS.has(rawSortField)
      ? rawSortField
      : DEFAULT_ADMIN_ORDERS_QUERY.sortField,
    sortDirection:
      rawSortDir === "asc" || rawSortDir === "desc"
        ? rawSortDir
        : DEFAULT_ADMIN_ORDERS_QUERY.sortDirection,
    page: Number.isFinite(rawPage) && rawPage >= 1 ? rawPage : 1,
    pageSize: ALLOWED_PAGE_SIZES.has(rawPageSize)
      ? rawPageSize
      : DEFAULT_ADMIN_ORDERS_QUERY.pageSize,
  };
}

export function buildAdminOrdersQueryString(
  params: AdminOrdersQueryParams
): string {
  const sp = new URLSearchParams();
  if (params.search.trim()) sp.set("search", params.search.trim());
  if (params.tab !== DEFAULT_ADMIN_ORDERS_QUERY.tab) sp.set("tab", params.tab);
  if (params.dateRange !== DEFAULT_ADMIN_ORDERS_QUERY.dateRange) {
    sp.set("dateRange", params.dateRange);
  }
  if (params.houseId) sp.set("houseId", params.houseId);
  if (params.source) sp.set("source", params.source);
  if (params.sortField !== DEFAULT_ADMIN_ORDERS_QUERY.sortField) {
    sp.set("sortField", params.sortField);
  }
  if (params.sortDirection !== DEFAULT_ADMIN_ORDERS_QUERY.sortDirection) {
    sp.set("sortDirection", params.sortDirection);
  }
  if (params.page > 1) sp.set("page", String(params.page));
  if (params.pageSize !== DEFAULT_ADMIN_ORDERS_QUERY.pageSize) {
    sp.set("pageSize", String(params.pageSize));
  }
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}
