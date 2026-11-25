import type { CustomerFiltersState } from "@/components/admin/customers/types";

export interface AdminCustomersUrlState {
  filters: CustomerFiltersState;
  page: number;
  pageSize: number;
}

const VALID_STATUSES = new Set<CustomerFiltersState["status"]>([
  "all",
  "active",
  "blocked",
]);
const VALID_TYPES = new Set<CustomerFiltersState["type"]>([
  "all",
  "registered",
  "guest",
]);
const ALLOWED_PAGE_SIZES = new Set([10, 25, 50]);

function pickSingle(v: string | string[] | undefined | null): string {
  if (Array.isArray(v)) return v[0] ?? "";
  return v ?? "";
}

export function parseAdminCustomersSearchParams(
  raw: Record<string, string | string[] | undefined>
): AdminCustomersUrlState {
  const search = pickSingle(raw.search).trim().slice(0, 120);
  const statusRaw = pickSingle(raw.status).trim() as CustomerFiltersState["status"];
  const typeRaw = pickSingle(raw.type).trim() as CustomerFiltersState["type"];
  const hasOrderedRaw = pickSingle(raw.hasOrdered);
  const hideTestRaw = pickSingle(raw.hideTest);
  const dateFromRaw = pickSingle(raw.dateFrom);
  const dateToRaw = pickSingle(raw.dateTo);
  const pageRaw = Number.parseInt(pickSingle(raw.page), 10);
  const pageSizeRaw = Number.parseInt(pickSingle(raw.pageSize), 10);

  return {
    filters: {
      search,
      status: VALID_STATUSES.has(statusRaw) ? statusRaw : "all",
      type: VALID_TYPES.has(typeRaw) ? typeRaw : "all",
      hasOrdered: hasOrderedRaw === "1" || hasOrderedRaw === "true",
      hideTestAccounts: hideTestRaw === "1" || hideTestRaw === "true",
      dateFrom: /^\d{4}-\d{2}-\d{2}$/.test(dateFromRaw) ? dateFromRaw : "",
      dateTo: /^\d{4}-\d{2}-\d{2}$/.test(dateToRaw) ? dateToRaw : "",
    },
    page: Number.isFinite(pageRaw) && pageRaw >= 1 ? pageRaw : 1,
    pageSize: ALLOWED_PAGE_SIZES.has(pageSizeRaw) ? pageSizeRaw : 25,
  };
}

export function buildAdminCustomersQueryString(
  state: AdminCustomersUrlState
): string {
  const sp = new URLSearchParams();
  if (state.filters.search.trim()) sp.set("search", state.filters.search.trim());
  if (state.filters.status !== "all") sp.set("status", state.filters.status);
  if (state.filters.type !== "all") sp.set("type", state.filters.type);
  if (state.filters.hasOrdered) sp.set("hasOrdered", "1");
  if (state.filters.hideTestAccounts) sp.set("hideTest", "1");
  if (state.filters.dateFrom) sp.set("dateFrom", state.filters.dateFrom);
  if (state.filters.dateTo) sp.set("dateTo", state.filters.dateTo);
  if (state.page > 1) sp.set("page", String(state.page));
  if (state.pageSize !== 25) sp.set("pageSize", String(state.pageSize));
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}
