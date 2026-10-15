import type { UserRecord } from "@/dal";

export type UserRow = UserRecord;

export type UserDetailsTab = "profile" | "permissions" | "activity";

export type SortableUserField = "name" | "createdAt" | "lastLoginAt" | "role" | "status";

export interface UserSortState {
  field: SortableUserField;
  direction: "asc" | "desc";
}

export interface UserFiltersState {
  search: string;
  role: string;
  status: string;
  type: "all" | "staff" | "customer";
  hideTestAccounts: boolean;
}
