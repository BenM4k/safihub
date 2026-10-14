import type { OrderListItemRecord } from "@/dal";
import {
  getElapsedMinutes,
  getUrgencyInfo,
  RECENT_RELANCE_THRESHOLD_MINUTES,
  type UrgencyInfo,
  type UrgencyLevel,
} from "./dispatch-urgency";

export type FollowUpOutcome =
  | "no_answer"
  | "will_accept"
  | "refused"
  | "call_back_later"
  | "pending";

export type FollowUpChannel = "call" | "whatsapp";

export interface RelanceEventSummary {
  id: string;
  orderId: string;
  channel: FollowUpChannel;
  outcome: FollowUpOutcome | null;
  operatorId: string | null;
  operatorName: string | null;
  createdAt: Date;
  note?: string | null;
}

export interface EnrichedDispatchOrder extends OrderListItemRecord {
  urgency: UrgencyInfo;
  relanceCount: number;
  lastRelanceAt: Date | null;
  lastRelanceBy: string | null;
  lastRelanceChannel: FollowUpChannel | null;
  lastOutcome: FollowUpOutcome | null;
  isRecentlyRelanced: boolean;
  recentRelanceMinutes: number | null;
  canReassign: boolean;
  relances: RelanceEventSummary[];
}

export interface PressingGroup {
  houseId: string;
  houseName: string;
  housePhone: string | null;
  orders: EnrichedDispatchOrder[];
  orderIds: string[];
  pendingCount: number;
  oldestOrder: EnrichedDispatchOrder;
  oldestCreatedAt: Date;
  oldestWaitingMinutes: number;
  urgencyLevel: UrgencyLevel;
  formattedOldestElapsed: string;
  relanceCount: number;
  lastRelanceAt: Date | null;
  lastRelanceBy: string | null;
  lastRelanceChannel: FollowUpChannel | null;
  lastOutcome: FollowUpOutcome | null;
  isRecentlyRelanced: boolean;
  recentRelanceMinutes: number | null;
  hasReassignableOrders: boolean;
}

export type DelayFilter = "all" | "overdue" | "critical" | "never_relanced";
export type SortOption = "oldest" | "newest" | "order_count";

/**
 * Enriches orders with urgency computation and relance history.
 */
export function enrichOrders(
  orders: OrderListItemRecord[],
  relancesMap: Map<string, RelanceEventSummary[]> = new Map(),
  now: Date = new Date()
): EnrichedDispatchOrder[] {
  return orders.map((order) => {
    const relances = [...(relancesMap.get(order.id) || [])].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const urgency = getUrgencyInfo(order.createdAt, now);
    const relanceCount = relances.length;
    const latestRelance = relances[0] ?? null;

    let isRecentlyRelanced = false;
    let recentRelanceMinutes: number | null = null;
    if (latestRelance) {
      const elapsed = getElapsedMinutes(latestRelance.createdAt, now);
      recentRelanceMinutes = elapsed;
      if (elapsed < RECENT_RELANCE_THRESHOLD_MINUTES) {
        isRecentlyRelanced = true;
      }
    }

    const lastOutcome = latestRelance?.outcome ?? null;
    const canReassign = lastOutcome === "refused" || relanceCount >= 2;

    return {
      ...order,
      urgency,
      relanceCount,
      lastRelanceAt: latestRelance ? new Date(latestRelance.createdAt) : null,
      lastRelanceBy: latestRelance?.operatorName ?? null,
      lastRelanceChannel: latestRelance?.channel ?? null,
      lastOutcome,
      isRecentlyRelanced,
      recentRelanceMinutes,
      canReassign,
      relances,
    };
  });
}

/**
 * Groups enriched orders by pressing (houseId).
 * Sorts groups by oldest pending order first (earliest createdAt).
 */
export function groupOrdersByPressing(
  orders: EnrichedDispatchOrder[],
  now: Date = new Date()
): PressingGroup[] {
  const map = new Map<string, EnrichedDispatchOrder[]>();

  for (const order of orders) {
    const key = order.houseId || "unknown";
    const existing = map.get(key) || [];
    existing.push(order);
    map.set(key, existing);
  }

  const groups: PressingGroup[] = [];

  for (const [houseId, groupOrders] of map.entries()) {
    // Sort orders within the group by oldest first
    groupOrders.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const oldestOrder = groupOrders[0];
    const firstOrder = groupOrders[0];
    const houseName = firstOrder.houseName || "Pressing sans nom";
    const housePhone = firstOrder.housePhone || null;
    const orderIds = groupOrders.map((o) => o.id);

    // Aggregate relance events for the group
    let totalRelances = 0;
    let mostRecentRelance: RelanceEventSummary | null = null;

    for (const ord of groupOrders) {
      totalRelances += ord.relanceCount;
      for (const r of ord.relances) {
        if (
          !mostRecentRelance ||
          new Date(r.createdAt).getTime() > new Date(mostRecentRelance.createdAt).getTime()
        ) {
          mostRecentRelance = r;
        }
      }
    }

    let isRecentlyRelanced = false;
    let recentRelanceMinutes: number | null = null;
    if (mostRecentRelance) {
      const elapsed = getElapsedMinutes(mostRecentRelance.createdAt, now);
      recentRelanceMinutes = elapsed;
      if (elapsed < RECENT_RELANCE_THRESHOLD_MINUTES) {
        isRecentlyRelanced = true;
      }
    }

    const urgencyInfo = oldestOrder.urgency;
    const hasReassignableOrders = groupOrders.some((o) => o.canReassign);

    groups.push({
      houseId,
      houseName,
      housePhone,
      orders: groupOrders,
      orderIds,
      pendingCount: groupOrders.length,
      oldestOrder,
      oldestCreatedAt: new Date(oldestOrder.createdAt),
      oldestWaitingMinutes: urgencyInfo.elapsedMinutes,
      urgencyLevel: urgencyInfo.level,
      formattedOldestElapsed: urgencyInfo.formattedElapsed,
      relanceCount: totalRelances,
      lastRelanceAt: mostRecentRelance ? new Date(mostRecentRelance.createdAt) : null,
      lastRelanceBy: mostRecentRelance?.operatorName ?? null,
      lastRelanceChannel: mostRecentRelance?.channel ?? null,
      lastOutcome: mostRecentRelance?.outcome ?? null,
      isRecentlyRelanced,
      recentRelanceMinutes,
      hasReassignableOrders,
    });
  }

  // Sort groups by oldest pending order first (earliest createdAt)
  groups.sort((a, b) => a.oldestCreatedAt.getTime() - b.oldestCreatedAt.getTime());

  return groups;
}

/**
 * Filters and sorts pressing groups according to user search and criteria.
 */
export function filterAndSortGroups(
  groups: PressingGroup[],
  options: {
    search?: string;
    delayFilter?: DelayFilter;
    sortBy?: SortOption;
  }
): PressingGroup[] {
  let result = [...groups];

  // 1. Search query (pressing name, customer name, order ref/code)
  if (options.search && options.search.trim() !== "") {
    const q = options.search.trim().toLowerCase();
    result = result.filter((g) => {
      const matchPressing = g.houseName.toLowerCase().includes(q);
      const matchOrders = g.orders.some(
        (o) =>
          o.code.toLowerCase().includes(q) ||
          (o.customerName && o.customerName.toLowerCase().includes(q)) ||
          o.id.toLowerCase().includes(q)
      );
      return matchPressing || matchOrders;
    });
  }

  // 2. Delay / follow-up filters
  if (options.delayFilter && options.delayFilter !== "all") {
    switch (options.delayFilter) {
      case "overdue":
        result = result.filter((g) => g.urgencyLevel === "warning" || g.urgencyLevel === "critical");
        break;
      case "critical":
        result = result.filter((g) => g.urgencyLevel === "critical");
        break;
      case "never_relanced":
        result = result.filter((g) => g.relanceCount === 0);
        break;
    }
  }

  // 3. Sorting
  if (options.sortBy) {
    switch (options.sortBy) {
      case "oldest":
        result.sort((a, b) => a.oldestCreatedAt.getTime() - b.oldestCreatedAt.getTime());
        break;
      case "newest":
        result.sort((a, b) => b.oldestCreatedAt.getTime() - a.oldestCreatedAt.getTime());
        break;
      case "order_count":
        result.sort((a, b) => b.pendingCount - a.pendingCount);
        break;
    }
  }

  return result;
}

/**
 * Filters and sorts flat orders list according to search, delay, and sort.
 */
export function filterAndSortOrders(
  orders: EnrichedDispatchOrder[],
  options: {
    search?: string;
    delayFilter?: DelayFilter;
    sortBy?: SortOption;
  }
): EnrichedDispatchOrder[] {
  let result = [...orders];

  if (options.search && options.search.trim() !== "") {
    const q = options.search.trim().toLowerCase();
    result = result.filter((o) => {
      const matchCode = o.code.toLowerCase().includes(q);
      const matchPressing = (o.houseName || "").toLowerCase().includes(q);
      const matchCustomer = (o.customerName || "").toLowerCase().includes(q);
      return matchCode || matchPressing || matchCustomer;
    });
  }

  if (options.delayFilter && options.delayFilter !== "all") {
    switch (options.delayFilter) {
      case "overdue":
        result = result.filter(
          (o) => o.urgency.level === "warning" || o.urgency.level === "critical"
        );
        break;
      case "critical":
        result = result.filter((o) => o.urgency.level === "critical");
        break;
      case "never_relanced":
        result = result.filter((o) => o.relanceCount === 0);
        break;
    }
  }

  if (options.sortBy) {
    switch (options.sortBy) {
      case "oldest":
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case "newest":
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "order_count":
        // Fallback to oldest
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
    }
  }

  return result;
}
