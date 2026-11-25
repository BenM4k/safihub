export type DisputeStatusFilter = "all" | "open" | "resolved";

export interface AdminDisputesQueryParams {
  search: string;
  status: DisputeStatusFilter;
  page: number;
  pageSize: number;
}

export const DEFAULT_DISPUTES_QUERY: AdminDisputesQueryParams = {
  search: "",
  status: "all",
  page: 1,
  pageSize: 10,
};

const VALID_STATUSES = new Set<DisputeStatusFilter>(["all", "open", "resolved"]);
const ALLOWED_PAGE_SIZES = new Set([10, 20, 50]);

function pickSingle(v: string | string[] | undefined | null): string {
  if (Array.isArray(v)) return v[0] ?? "";
  return v ?? "";
}

export function parseAdminDisputesSearchParams(
  raw: Record<string, string | string[] | undefined>
): AdminDisputesQueryParams {
  const statusRaw = pickSingle(raw.status).trim() as DisputeStatusFilter;
  const search = pickSingle(raw.search).trim().slice(0, 120);
  const pageRaw = Number.parseInt(pickSingle(raw.page), 10);
  const pageSizeRaw = Number.parseInt(pickSingle(raw.pageSize), 10);

  return {
    search,
    status: VALID_STATUSES.has(statusRaw) ? statusRaw : "all",
    page: Number.isFinite(pageRaw) && pageRaw >= 1 ? pageRaw : 1,
    pageSize: ALLOWED_PAGE_SIZES.has(pageSizeRaw)
      ? pageSizeRaw
      : DEFAULT_DISPUTES_QUERY.pageSize,
  };
}
