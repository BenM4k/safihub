import "server-only";
import { err, ok, type Result } from "@/lib/result";
import {
  addOrderEvent,
  createHouseClosure,
  createHouseExclusion,
  createHouseItemRequest,
  deleteHouseClosure,
  deleteHouseExclusion,
  getHouseById,
  getHouseCatalogueItems,
  getHouseClosures,
  getHouseCoverageWithLimits,
  getHouseDashboardMetrics,
  getHouseExclusions,
  getHouseHours,
  getHouseItemRequests,
  getHouseOrderDetailRestricted,
  getHouseOrdersRestricted,
  getOrderEvents,
  getOrderItems,
  saveReceptionCountTransaction,
  setHouseHours,
  updateHouse,
  updateOrderStatus,
  upsertHouseCoverage,
  upsertHouseItemPrice,
  type HouseCatalogueItemRecord,
  type HouseCoverageWithLimitsData,
  type HouseDashboardMetrics,
  type HouseOrderDetailRecord,
  type HouseOrderListItemRecord,
  type OrderEventRecord,
  type OrderItemRecord,
} from "@/dal";
import {
  recordReceptionCount,
  transitionOrder,
  type ReceptionItemVerificationInput,
} from "@/services/order";
import type { OrderStatus } from "@/services/db/schema";

export async function getHouseDashboardData(
  houseId: string
): Promise<Result<HouseDashboardMetrics>> {
  try {
    const metrics = await getHouseDashboardMetrics(houseId);
    return ok(metrics);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to load dashboard metrics");
  }
}

export async function listHouseOrders(
  houseId: string,
  filters?: {
    status?: OrderStatus;
    search?: string;
    limit?: number;
    offset?: number;
  }
): Promise<Result<HouseOrderListItemRecord[]>> {
  try {
    const orders = await getHouseOrdersRestricted(houseId, filters);
    return ok(orders);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to list house orders");
  }
}

export async function getHouseOrderDetail(
  houseId: string,
  orderId: string
): Promise<
  Result<{
    order: HouseOrderDetailRecord;
    items: OrderItemRecord[];
    events: OrderEventRecord[];
  }>
> {
  try {
    const order = await getHouseOrderDetailRestricted(houseId, orderId);
    if (!order) {
      return err("Order not found or does not belong to this laundry house");
    }

    const [items, events] = await Promise.all([
      getOrderItems(orderId),
      getOrderEvents(orderId),
    ]);

    return ok({ order, items, events });
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to load order detail");
  }
}

/**
 * Task 4.2: House accepts incoming order.
 */
export async function acceptIncomingOrder(params: {
  houseId: string;
  orderId: string;
  actorId: string;
  actorRole: "house" | "admin";
}): Promise<Result<void>> {
  try {
    const detail = await getHouseOrderDetailRestricted(params.houseId, params.orderId);
    if (!detail) {
      return err("Order not found or does not belong to this laundry house");
    }

    const transitionRes = transitionOrder(params.orderId, detail.status, {
      targetStatus: "accepted",
      actorId: params.actorId,
      actorRole: params.actorRole,
      note: "Accepted by laundry house",
    });

    if (!transitionRes.ok) {
      return err(transitionRes.error);
    }

    await updateOrderStatus(params.orderId, "accepted");
    await addOrderEvent(transitionRes.value.event);

    return ok(undefined);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to accept order");
  }
}

/**
 * Task 4.2: House rejects incoming order with required reason.
 * Rejection moves order to rejected and keeps customer cart intact.
 */
export async function rejectIncomingOrder(params: {
  houseId: string;
  orderId: string;
  actorId: string;
  actorRole: "house" | "admin";
  reason: string;
}): Promise<Result<void>> {
  try {
    if (!params.reason || params.reason.trim().length === 0) {
      return err("A rejection reason is strictly required");
    }

    const detail = await getHouseOrderDetailRestricted(params.houseId, params.orderId);
    if (!detail) {
      return err("Order not found or does not belong to this laundry house");
    }

    const transitionRes = transitionOrder(params.orderId, detail.status, {
      targetStatus: "rejected",
      actorId: params.actorId,
      actorRole: params.actorRole,
      reason: params.reason.trim(),
      note: `Rejected by laundry house: ${params.reason.trim()}`,
    });

    if (!transitionRes.ok) {
      return err(transitionRes.error);
    }

    await updateOrderStatus(params.orderId, "rejected");
    await addOrderEvent(transitionRes.value.event);

    return ok(undefined);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to reject order");
  }
}

/**
 * Task 4.3: House reception count against order items (AC 10).
 * Flag non-accepted items as 'returned' (removed from cleaning total).
 */
export async function submitHouseReception(params: {
  houseId: string;
  orderId: string;
  actorId: string;
  actorRole: "house" | "admin";
  itemCounts: Array<{
    orderItemId: string;
    receivedQuantity: number;
    isExplicitlyRejectedByHouse?: boolean;
  }>;
}): Promise<
  Result<{
    hasPriceAdjustment: boolean;
    newStatus: OrderStatus;
    totalDue: number;
    adjustedItemsTotal: number;
  }>
> {
  try {
    const detail = await getHouseOrderDetailRestricted(params.houseId, params.orderId);
    if (!detail) {
      return err("Order not found or does not belong to this laundry house");
    }

    if (detail.status !== "received") {
      return err(`Order status is '${detail.status}', but must be 'received' for reception counting`);
    }

    const [existingItems, exclusions, house] = await Promise.all([
      getOrderItems(params.orderId),
      getHouseExclusions(params.houseId),
      getHouseById(params.houseId),
    ]);

    const countsMap = new Map(params.itemCounts.map((c) => [c.orderItemId, c]));

    const verificationInput: ReceptionItemVerificationInput[] = existingItems.map((item) => {
      const count = countsMap.get(item.id);
      return {
        orderItemId: item.id,
        itemId: item.itemId ?? "",
        fabricId: item.fabricId ?? undefined,
        unitPrice: item.unitPrice,
        declaredQuantity: item.declaredQuantity,
        receivedQuantity: count ? count.receivedQuantity : item.declaredQuantity,
        isExplicitlyRejectedByHouse: count?.isExplicitlyRejectedByHouse ?? false,
      };
    });

    const houseExclusionRules = exclusions.map((e) => ({
      itemId: e.itemId,
      fabricId: e.fabricId,
    }));

    // AC 10 verification
    const receptionResult = recordReceptionCount({
      items: verificationInput,
      houseExclusions: houseExclusionRules,
      commissionBps: house?.commissionBps ?? 2000,
      deliveryFee: 0, // delivery fee is preserved, calculation handles items
    });

    // Check transition
    const transitionRes = transitionOrder(params.orderId, "received", {
      targetStatus: receptionResult.suggestedStatus,
      actorId: params.actorId,
      actorRole: params.actorRole,
      note: receptionResult.hasPriceAdjustment
        ? `Reception discrepancy flagged (${receptionResult.returnedItems.length} returned items)`
        : "Reception count verified and conforming",
      payload: {
        returnedItemsCount: receptionResult.returnedItems.length,
        hasPriceAdjustment: receptionResult.hasPriceAdjustment,
      },
    });

    if (!transitionRes.ok) {
      return err(transitionRes.error);
    }

    // Build update items array
    const returnedIdSet = new Set(receptionResult.returnedItems.map((r) => r.orderItemId));
    const itemsToUpdate = existingItems.map((it) => {
      const count = countsMap.get(it.id);
      const isReturned = returnedIdSet.has(it.id);
      return {
        id: it.id,
        receivedQuantity: count ? count.receivedQuantity : it.declaredQuantity,
        status: isReturned ? ("returned" as const) : ("accepted" as const),
      };
    });

    await saveReceptionCountTransaction({
      orderId: params.orderId,
      houseId: params.houseId,
      items: itemsToUpdate,
      newStatus: receptionResult.suggestedStatus,
      adjustedItemsTotal: receptionResult.adjustedItemsTotal,
      commissionAmount: receptionResult.commissionAmount,
      totalDue: detail.totalDue - detail.itemsTotal + receptionResult.adjustedItemsTotal,
      event: transitionRes.value.event,
    });

    return ok({
      hasPriceAdjustment: receptionResult.hasPriceAdjustment,
      newStatus: receptionResult.suggestedStatus,
      totalDue: detail.totalDue - detail.itemsTotal + receptionResult.adjustedItemsTotal,
      adjustedItemsTotal: receptionResult.adjustedItemsTotal,
    });
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to record reception count");
  }
}

/**
 * Task 4.3: House marks order as "Ready" for delivery.
 */
export async function markOrderReady(params: {
  houseId: string;
  orderId: string;
  actorId: string;
  actorRole: "house" | "admin";
}): Promise<Result<void>> {
  try {
    const detail = await getHouseOrderDetailRestricted(params.houseId, params.orderId);
    if (!detail) {
      return err("Order not found or does not belong to this laundry house");
    }

    const transitionRes = transitionOrder(params.orderId, detail.status, {
      targetStatus: "ready",
      actorId: params.actorId,
      actorRole: params.actorRole,
      note: "Laundry cleaned, pressed and marked ready for delivery",
    });

    if (!transitionRes.ok) {
      return err(transitionRes.error);
    }

    await updateOrderStatus(params.orderId, "ready");
    await addOrderEvent(transitionRes.value.event);

    return ok(undefined);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to mark order as ready");
  }
}

/**
 * Task 4.4: House catalogue list with pricing.
 */
export async function getHouseCatalogue(
  houseId: string
): Promise<Result<HouseCatalogueItemRecord[]>> {
  try {
    const items = await getHouseCatalogueItems(houseId);
    return ok(items);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to load house catalogue");
  }
}

/**
 * Task 4.4: Update house catalogue pricing/availability.
 * Invariant: Affects new orders only. Existing orders retain frozen prices.
 */
export async function updateHouseCatalogueItem(params: {
  houseId: string;
  serviceId: string;
  itemId: string;
  fabricId: string;
  price: number;
  isActive: boolean;
  currency?: "CDF" | "USD";
}): Promise<Result<void>> {
  try {
    if (params.price < 0) {
      return err("Price cannot be negative");
    }

    await upsertHouseItemPrice(params);
    return ok(undefined);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to update item pricing");
  }
}

/**
 * Task 4.4: Request a new item or fabric from admin.
 */
export async function requestCatalogueItem(params: {
  houseId: string;
  requestedBy: string;
  kind: "item" | "fabric";
  name: string;
  note?: string;
}): Promise<Result<void>> {
  try {
    if (!params.name || params.name.trim().length === 0) {
      return err("Item name is required");
    }

    await createHouseItemRequest(params);
    return ok(undefined);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to submit catalogue request");
  }
}

export async function listHouseCatalogueRequests(houseId: string) {
  try {
    const requests = await getHouseItemRequests(houseId);
    return ok(requests);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to load item requests");
  }
}

/**
 * Task 4.5: Operating hours and closures.
 */
export async function getHouseHoursData(houseId: string) {
  try {
    const [hours, closures] = await Promise.all([
      getHouseHours(houseId),
      getHouseClosures(houseId),
    ]);
    return ok({ hours, closures });
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to load hours");
  }
}

export async function updateHouseHoursSchedule(
  houseId: string,
  hours: Array<{ weekday: number; opensAt: string; closesAt: string }>
): Promise<Result<void>> {
  try {
    for (const h of hours) {
      if (h.weekday < 1 || h.weekday > 7) {
        return err("Weekday must be between 1 and 7");
      }
      if (h.closesAt <= h.opensAt) {
        return err(`Closing time (${h.closesAt}) must be after opening time (${h.opensAt})`);
      }
    }

    await setHouseHours(houseId, hours);
    return ok(undefined);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to update house hours");
  }
}

export async function addHouseClosureEntry(params: {
  houseId: string;
  startsOn: string;
  endsOn: string;
  reason?: string;
}): Promise<Result<void>> {
  try {
    if (params.endsOn < params.startsOn) {
      return err("End date must be on or after start date");
    }

    await createHouseClosure(params);
    return ok(undefined);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to add closure");
  }
}

export async function deleteHouseClosureEntry(
  houseId: string,
  closureId: string
): Promise<Result<void>> {
  try {
    await deleteHouseClosure(closureId);
    return ok(undefined);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to delete closure");
  }
}

/**
 * Task 4.5: Coverage with distance limits.
 * Done when: A house cannot select a neighborhood beyond its distance limit.
 */
export async function getHouseCoverageData(
  houseId: string
): Promise<Result<HouseCoverageWithLimitsData>> {
  try {
    const data = await getHouseCoverageWithLimits(houseId);
    if (!data) {
      return err("House not found");
    }
    return ok(data);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to load house coverage");
  }
}

export async function updateNeighborhoodCoverage(params: {
  houseId: string;
  neighborhoodId: string;
  isActive: boolean;
}): Promise<Result<void>> {
  try {
    // If enabling, verify distance limit!
    if (params.isActive) {
      const coverageData = await getHouseCoverageWithLimits(params.houseId);
      if (!coverageData) {
        return err("House not found");
      }

      const item = coverageData.items.find((i) => i.neighborhoodId === params.neighborhoodId);
      if (!item) {
        return err("Neighborhood not found");
      }

      if (!item.isAllowedByDistance) {
        return err(
          `Cannot cover neighborhood '${item.neighborhoodName}': Distance level (${item.distanceLevel ?? "unknown"}) exceeds house maximum limit (${coverageData.effectiveMaxDistanceLevel}).`
        );
      }
    }

    await upsertHouseCoverage(params);
    return ok(undefined);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to update coverage");
  }
}

/**
 * Task 4.5: House settings: dailyCapacity, isPaused, pausedUntil, minimumOrderAmount, exclusions.
 */
export async function getHouseSettings(houseId: string) {
  try {
    const [house, exclusions] = await Promise.all([
      getHouseById(houseId),
      getHouseExclusions(houseId),
    ]);

    if (!house) {
      return err("House not found");
    }

    return ok({ house, exclusions });
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to load house settings");
  }
}

export async function updateHouseGeneralSettings(params: {
  houseId: string;
  dailyCapacity: number | null;
  minimumOrderAmount: number;
  isPaused: boolean;
  pausedUntil?: Date | null;
  addressNote?: string | null;
  contactPhone?: string | null;
}): Promise<Result<void>> {
  try {
    if (params.minimumOrderAmount < 0) {
      return err("Minimum order amount cannot be negative");
    }
    if (params.dailyCapacity !== null && params.dailyCapacity <= 0) {
      return err("Daily capacity must be a positive integer or null");
    }

    await updateHouse(params.houseId, {
      dailyCapacity: params.dailyCapacity,
      minimumOrderAmount: params.minimumOrderAmount,
      isPaused: params.isPaused,
      pausedUntil: params.pausedUntil ?? null,
      addressNote: params.addressNote ?? null,
      contactPhone: params.contactPhone ?? null,
    });

    return ok(undefined);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to update house settings");
  }
}

export async function addHouseExclusionRule(params: {
  houseId: string;
  itemId?: string | null;
  fabricId?: string | null;
  note?: string | null;
}): Promise<Result<void>> {
  try {
    if (!params.itemId && !params.fabricId) {
      return err("An item or fabric must be selected for the exclusion");
    }

    await createHouseExclusion(params);
    return ok(undefined);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to add exclusion rule");
  }
}

export async function deleteHouseExclusionRule(
  houseId: string,
  exclusionId: string
): Promise<Result<void>> {
  try {
    await deleteHouseExclusion(exclusionId);
    return ok(undefined);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to delete exclusion");
  }
}
