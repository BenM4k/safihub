import "server-only";
import { cache } from "react";
import {
  getAdminMetricsSummary,
  listAdminCouriers,
  listAdminOrders,
} from "@/services/admin";

export const getCachedAdminMetricsSummary = cache(() => getAdminMetricsSummary());
export const getCachedRecentAdminOrders = cache(() =>
  listAdminOrders({ limit: 5 })
);
export const getCachedAdminCouriers = cache(() => listAdminCouriers());

export function preloadAdminDashboard(): void {
  void getCachedAdminMetricsSummary();
  void getCachedRecentAdminOrders();
  void getCachedAdminCouriers();
}
