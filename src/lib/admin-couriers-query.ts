export type CouriersStatusTab = "all" | "active" | "inactive";

export interface AdminCouriersQueryParams {
  status: CouriersStatusTab;
  search: string;
  page: number;
  pageSize: number;
}

export const DEFAULT_COURIERS_QUERY: AdminCouriersQueryParams = {
  status: "all",
  search: "",
  page: 1,
  pageSize: 15,
};

const VALID_STATUSES = new Set<CouriersStatusTab>(["all", "active", "inactive"]);
const ALLOWED_PAGE_SIZES = new Set([10, 15, 25, 50]);

function pickSingle(v: string | string[] | undefined | null): string {
  if (Array.isArray(v)) return v[0] ?? "";
  return v ?? "";
}

export function parseAdminCouriersSearchParams(
  raw: Record<string, string | string[] | undefined>
): AdminCouriersQueryParams {
  const statusRaw = pickSingle(raw.status).trim() as CouriersStatusTab;
  const search = pickSingle(raw.search).trim().slice(0, 120);
  const pageRaw = Number.parseInt(pickSingle(raw.page), 10);
  const pageSizeRaw = Number.parseInt(pickSingle(raw.pageSize), 10);

  return {
    status: VALID_STATUSES.has(statusRaw) ? statusRaw : "all",
    search,
    page: Number.isFinite(pageRaw) && pageRaw >= 1 ? pageRaw : 1,
    pageSize: ALLOWED_PAGE_SIZES.has(pageSizeRaw)
      ? pageSizeRaw
      : DEFAULT_COURIERS_QUERY.pageSize,
  };
}
