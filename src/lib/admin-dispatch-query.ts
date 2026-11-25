import type { DelayFilter, SortOption } from "./dispatch-grouping";

export type DispatchTab = "relances" | "missions";
export type DispatchViewMode = "pressing" | "order";

export interface AdminDispatchQueryParams {
  tab: DispatchTab;
  view: DispatchViewMode;
  search: string;
  delay: DelayFilter;
  sort: SortOption;
  page: number;
}

export const DEFAULT_DISPATCH_QUERY: AdminDispatchQueryParams = {
  tab: "relances",
  view: "pressing",
  search: "",
  delay: "all",
  sort: "oldest",
  page: 1,
};

const VALID_DELAYS = new Set<DelayFilter>([
  "all",
  "overdue",
  "critical",
  "never_relanced",
]);

const VALID_SORTS = new Set<SortOption>(["oldest", "newest", "order_count"]);

function pickSingle(v: string | string[] | undefined | null): string {
  if (Array.isArray(v)) return v[0] ?? "";
  return v ?? "";
}

export function parseAdminDispatchSearchParams(
  raw: Record<string, string | string[] | undefined>
): AdminDispatchQueryParams {
  const tabRaw = pickSingle(raw.tab).trim();
  const viewRaw = pickSingle(raw.view).trim();
  const search = pickSingle(raw.search).trim().slice(0, 120);
  const delayRaw = pickSingle(raw.delay).trim() as DelayFilter;
  const sortRaw = pickSingle(raw.sort).trim() as SortOption;
  const pageRaw = Number.parseInt(pickSingle(raw.page), 10);

  return {
    tab: tabRaw === "missions" ? "missions" : "relances",
    view: viewRaw === "order" ? "order" : "pressing",
    search,
    delay: VALID_DELAYS.has(delayRaw) ? delayRaw : "all",
    sort: VALID_SORTS.has(sortRaw) ? sortRaw : "oldest",
    page: Number.isFinite(pageRaw) && pageRaw >= 1 ? pageRaw : 1,
  };
}

export function buildAdminDispatchQueryString(
  params: AdminDispatchQueryParams
): string {
  const sp = new URLSearchParams();
  if (params.tab !== DEFAULT_DISPATCH_QUERY.tab) sp.set("tab", params.tab);
  if (params.view !== DEFAULT_DISPATCH_QUERY.view) sp.set("view", params.view);
  if (params.search.trim()) sp.set("search", params.search.trim());
  if (params.delay !== DEFAULT_DISPATCH_QUERY.delay) sp.set("delay", params.delay);
  if (params.sort !== DEFAULT_DISPATCH_QUERY.sort) sp.set("sort", params.sort);
  if (params.page > 1) sp.set("page", String(params.page));
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}
