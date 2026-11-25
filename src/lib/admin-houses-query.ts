import type { HouseOperationalStatus } from "@/components/admin/houses/types";

export type HousesTab = "all" | "reviews";
export type HousesStatusFilter = "all" | HouseOperationalStatus;

export interface AdminHousesQueryParams {
  tab: HousesTab;
  search: string;
  status: HousesStatusFilter;
  neighborhoodId: string;
  page: number;
  pageSize: number;
}

export const DEFAULT_HOUSES_QUERY: AdminHousesQueryParams = {
  tab: "all",
  search: "",
  status: "all",
  neighborhoodId: "",
  page: 1,
  pageSize: 15,
};

const VALID_STATUSES = new Set<HousesStatusFilter>([
  "all",
  "active",
  "paused",
  "closed_today",
  "suspended",
]);
const ALLOWED_PAGE_SIZES = new Set([10, 15, 25, 50]);
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function pickSingle(v: string | string[] | undefined | null): string {
  if (Array.isArray(v)) return v[0] ?? "";
  return v ?? "";
}

export function parseAdminHousesSearchParams(
  raw: Record<string, string | string[] | undefined>
): AdminHousesQueryParams {
  const tabRaw = pickSingle(raw.tab).trim();
  const statusRaw = pickSingle(raw.status).trim() as HousesStatusFilter;
  const search = pickSingle(raw.search).trim().slice(0, 120);
  const neighborhoodRaw = pickSingle(raw.neighborhoodId).trim();
  const pageRaw = Number.parseInt(pickSingle(raw.page), 10);
  const pageSizeRaw = Number.parseInt(pickSingle(raw.pageSize), 10);

  return {
    tab: tabRaw === "reviews" ? "reviews" : "all",
    search,
    status: VALID_STATUSES.has(statusRaw) ? statusRaw : "all",
    neighborhoodId: UUID_REGEX.test(neighborhoodRaw) ? neighborhoodRaw : "",
    page: Number.isFinite(pageRaw) && pageRaw >= 1 ? pageRaw : 1,
    pageSize: ALLOWED_PAGE_SIZES.has(pageSizeRaw)
      ? pageSizeRaw
      : DEFAULT_HOUSES_QUERY.pageSize,
  };
}

export function buildAdminHousesQueryString(
  params: AdminHousesQueryParams
): string {
  const sp = new URLSearchParams();
  if (params.tab !== DEFAULT_HOUSES_QUERY.tab) sp.set("tab", params.tab);
  if (params.search.trim()) sp.set("search", params.search.trim());
  if (params.status !== DEFAULT_HOUSES_QUERY.status) {
    sp.set("status", params.status);
  }
  if (params.neighborhoodId) sp.set("neighborhoodId", params.neighborhoodId);
  if (params.page > 1) sp.set("page", String(params.page));
  if (params.pageSize !== DEFAULT_HOUSES_QUERY.pageSize) {
    sp.set("pageSize", String(params.pageSize));
  }
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}
