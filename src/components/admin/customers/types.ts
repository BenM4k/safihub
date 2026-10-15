import type { AdminCustomerRecord } from "@/dal";

export type CustomerRow = AdminCustomerRecord;

export type CustomerDetailsTab = "profile" | "orders" | "addresses" | "history";

export interface CustomerFiltersState {
  search: string;
  status: "all" | "active" | "blocked";
  type: "all" | "registered" | "guest";
  hasOrdered: boolean;
  hideTestAccounts: boolean;
  dateFrom: string;
  dateTo: string;
}

export type SortableField = "createdAt" | "name" | "ordersCount" | "totalSpentCDF";

export interface SortState {
  field: SortableField;
  direction: "asc" | "desc";
}
