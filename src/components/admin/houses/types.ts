import type { HouseRecord } from "@/dal";

export type HouseOperationalStatus =
  | "active"
  | "paused"
  | "suspended"
  | "closed_today";

export interface AdminHouseRow extends HouseRecord {
  imageUrl: string;
  isOpenNow: boolean;
  todayHoursText: string;
  activeOrdersCount: number;
  balanceOwedCDF: number;
  status: HouseOperationalStatus;
}

export interface HouseFiltersState {
  search: string;
  status: "all" | HouseOperationalStatus;
  neighborhoodId: string;
  sortBy: "name" | "commission" | "minOrder" | "turnaround" | "orders" | "balance";
  sortOrder: "asc" | "desc";
}

export interface HouseCreateInput {
  name: string;
  neighborhoodId: string;
  contactPhone: string;
  commissionPercent: string;
  minimumOrderAmount: number;
  turnaroundHours: number;
  addressNote?: string;
  dailyCapacity?: number | null;
}
