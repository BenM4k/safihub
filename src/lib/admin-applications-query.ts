import type { ApplicationStatus } from "@/services/db/schema";

export type ApplicationStatusTab = "all" | ApplicationStatus;

export interface AdminApplicationsQueryParams {
  status: ApplicationStatusTab;
  search: string;
  page: number;
  pageSize: number;
}

export const DEFAULT_APPLICATIONS_QUERY: AdminApplicationsQueryParams = {
  status: "all",
  search: "",
  page: 1,
  pageSize: 15,
};

export const APPLICATIONS_PAGE_SIZE_OPTIONS = [10, 15, 25, 50];

const VALID_STATUSES = new Set<ApplicationStatusTab>([
  "all",
  "pending",
  "approved",
  "rejected",
]);
const ALLOWED_PAGE_SIZES = new Set<number>(APPLICATIONS_PAGE_SIZE_OPTIONS);

function pickSingle(v: string | string[] | undefined | null): string {
  if (Array.isArray(v)) return v[0] ?? "";
  return v ?? "";
}

export function parseAdminApplicationsSearchParams(
  raw: Record<string, string | string[] | undefined>
): AdminApplicationsQueryParams {
  const statusRaw = pickSingle(raw.status).trim() as ApplicationStatusTab;
  const search = pickSingle(raw.search).trim().slice(0, 120);
  const pageRaw = Number.parseInt(pickSingle(raw.page), 10);
  const pageSizeRaw = Number.parseInt(pickSingle(raw.pageSize), 10);

  return {
    status: VALID_STATUSES.has(statusRaw) ? statusRaw : "all",
    search,
    page: Number.isFinite(pageRaw) && pageRaw >= 1 ? pageRaw : 1,
    pageSize: ALLOWED_PAGE_SIZES.has(pageSizeRaw)
      ? pageSizeRaw
      : DEFAULT_APPLICATIONS_QUERY.pageSize,
  };
}
