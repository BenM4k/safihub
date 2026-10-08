import "server-only";
import { err, ok, type Result } from "@/lib/result";
import {
  addOrderEvent,
  createGuestUser,
  getHouses,
  getLatestExchangeRate,
  getMasterFabrics,
  getMasterItems,
  getMasterServices,
  getNeighborhoods,
  getOrderById,
  getOrderEvents,
  getOrderItems,
  getOrders,
  getOrderValidationData,
  getSettings,
  getUserByContactPhone,
  getZoneFees,
  insertOrderWithDetails,
  updateOrderStatus,
  type OrderDetailRecord,
  type OrderEventRecord,
  type OrderItemRecord,
  type OrderListItemRecord,
} from "@/dal";
import {
  transitionOrder,
  validateOrderCheckout,
  type CartLineItemInput,
  type OrderValidationContext,
} from "@/services/order";
import type { ApprovalMethod, OrderSource, OrderStatus } from "@/services/db/schema";

export async function listAdminOrders(filters?: {
  status?: OrderStatus;
  houseId?: string;
  search?: string;
  source?: OrderSource;
  limit?: number;
  offset?: number;
}): Promise<Result<OrderListItemRecord[]>> {
  try {
    const orders = await getOrders(filters);
    return ok(orders);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to load orders");
  }
}

export async function getAdminOrderDetail(orderId: string): Promise<
  Result<{
    order: OrderDetailRecord;
    items: OrderItemRecord[];
    events: OrderEventRecord[];
  }>
> {
  try {
    const order = await getOrderById(orderId);
    if (!order) {
      return err("Order not found");
    }

    const [items, events] = await Promise.all([
      getOrderItems(orderId),
      getOrderEvents(orderId),
    ]);

    return ok({ order, items, events });
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to load order details");
  }
}

export async function executeAdminOnBehalfAction(params: {
  orderId: string;
  targetStatus: OrderStatus;
  adminId: string;
  onBehalfOfHouseId: string;
  reason?: string;
  note?: string;
  approvalMethod?: ApprovalMethod;
}): Promise<Result<void>> {
  try {
    const order = await getOrderById(params.orderId);
    if (!order) {
      return err("Order not found");
    }

    const transitionResult = transitionOrder(order.id, order.status, {
      targetStatus: params.targetStatus,
      actorId: params.adminId,
      actorRole: "admin",
      onBehalfOfHouseId: params.onBehalfOfHouseId,
      reason: params.reason,
      note: params.note,
      approvalMethod: params.approvalMethod,
    });

    if (!transitionResult.ok) {
      return err(transitionResult.error);
    }

    await updateOrderStatus(order.id, params.targetStatus);
    await addOrderEvent(transitionResult.value.event);

    return ok(undefined);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to execute on-behalf action");
  }
}

export async function addAdminOrderTimelineNote(params: {
  orderId: string;
  adminId: string;
  note: string;
}): Promise<Result<void>> {
  try {
    if (!params.note?.trim()) {
      return err("Note cannot be empty");
    }

    await addOrderEvent({
      orderId: params.orderId,
      type: "note",
      actorId: params.adminId,
      actorRole: "admin",
      recordedBy: params.adminId,
      note: params.note.trim(),
    });

    return ok(undefined);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to add note to order");
  }
}

/**
 * Builds the canonical order validation context directly from the DAL.
 */
export async function buildOrderValidationContext(scope?: {
  houseId?: string;
  customerId?: string;
  idempotencyKey?: string;
}): Promise<OrderValidationContext> {
  const [
    dbHouses,
    dbNeighborhoods,
    dbZoneFees,
    dbServices,
    dbItems,
    dbFabrics,
    dbSettings,
    dbExchangeRate,
    validationData,
  ] = await Promise.all([
    getHouses(),
    getNeighborhoods(),
    getZoneFees(),
    getMasterServices(),
    getMasterItems(),
    getMasterFabrics(),
    getSettings(),
    getLatestExchangeRate("USD", "CDF"),
    getOrderValidationData(scope),
  ]);

  const housesMap = new Map();
  for (const h of dbHouses) {
    housesMap.set(h.id, {
      id: h.id,
      name: h.name,
      neighborhoodId: h.neighborhoodId,
      isActive: h.isActive,
      isPaused: h.isPaused,
      pausedUntil: h.pausedUntil,
      maxDistanceLevel: h.maxDistanceLevel,
      minimumOrderAmount: h.minimumOrderAmount,
      commissionBps: h.commissionBps,
      cutoffMinutes: h.cutoffMinutes,
      dailyCapacity: h.dailyCapacity,
    });
  }

  const neighborhoodsMap = new Map();
  for (const n of dbNeighborhoods) {
    neighborhoodsMap.set(n.id, n);
  }

  const servicesMap = new Map(dbServices.map((s) => [s.id, { id: s.id, isActive: s.isActive }]));
  const itemsMap = new Map(dbItems.map((i) => [i.id, { id: i.id, isActive: i.isActive }]));
  const fabricsMap = new Map(dbFabrics.map((f) => [f.id, { id: f.id, isActive: f.isActive }]));

  return {
    existingOrders: validationData.existingOrders,
    houses: housesMap,
    neighborhoods: neighborhoodsMap,
    houseCoverage: validationData.houseCoverage,
    zoneFees: dbZoneFees,
    masterServices: servicesMap,
    masterItems: itemsMap,
    masterFabrics: fabricsMap,
    houseItems: validationData.houseItems,
    houseHours: validationData.houseHours,
    houseClosures: validationData.houseClosures,
    courierShifts: validationData.courierShifts,
    settings: {
      maxItemsPerOrder: dbSettings.maxItemsPerOrder,
      defaultCommissionBps: dbSettings.defaultCommissionBps,
      maxCoverageDistanceLevel: dbSettings.maxCoverageDistanceLevel,
      acceptanceDelayMinutes: dbSettings.acceptanceDelayMinutes,
    },
    activeExchangeRate: dbExchangeRate
      ? { rate: parseFloat(dbExchangeRate.rate), isCdfPerUsd: true }
      : { rate: 2850, isCdfPerUsd: true },
  };
}

export async function createManualAdminOrder(params: {
  customerPhone: string;
  customerName?: string;
  houseId: string;
  customerNeighborhoodId: string;
  landmark: string;
  pickupSlotStart: Date;
  pickupSlotEnd: Date;
  items: CartLineItemInput[];
  source: "whatsapp" | "phone";
  adminId: string;
}): Promise<Result<{ orderId: string; code: string; trackingToken: string }>> {
  try {
    if (!params.customerPhone?.trim()) {
      return err("Customer phone number is required");
    }
    if (!params.landmark?.trim()) {
      return err("Landmark is required");
    }

    // 1. Find or create customer account
    let customer = await getUserByContactPhone(params.customerPhone);
    if (!customer) {
      const guestResult = await createGuestUser({
        name: params.customerName?.trim() || "Client Manuel",
        phone: params.customerPhone.trim(),
      });
      if (!guestResult.ok) {
        return err(`Could not create customer profile: ${guestResult.error}`);
      }
      customer = guestResult.value;
    }

    // 2. Validate using shared canonical validation function
    const idempotencyKey = `manual_${crypto.randomUUID()}`;
    const context = await buildOrderValidationContext({
      houseId: params.houseId,
      customerId: customer.id,
      idempotencyKey,
    });

    const validation = validateOrderCheckout(
      {
        idempotencyKey,
        customerId: customer.id,
        houseId: params.houseId,
        customerNeighborhoodId: params.customerNeighborhoodId,
        landmark: params.landmark.trim(),
        contactPhone: params.customerPhone.trim(),
        pickupSlot: {
          start: params.pickupSlotStart,
          end: params.pickupSlotEnd,
        },
        items: params.items,
        source: params.source,
      },
      context
    );

    if (!validation.ok) {
      return err(`Order validation failed: ${validation.error.message}`);
    }

    const val = validation.value;
    const code = `SF-${Math.floor(100000 + Math.random() * 900000)}`;
    const trackingToken = crypto.randomUUID();

    // 3. Insert order + items + events + pickup mission
    const created = await insertOrderWithDetails({
      order: {
        code,
        trackingToken,
        idempotencyKey,
        customerId: customer.id,
        houseId: val.houseId,
        neighborhoodId: val.neighborhoodId,
        landmark: val.landmark,
        contactPhone: val.contactPhone,
        source: val.source,
        status: "created",
        currency: "CDF",
        paymentCurrency: "CDF",
        pickupSlotStart: val.pickupSlotStart,
        pickupSlotEnd: val.pickupSlotEnd,
        itemsTotal: val.itemsTotal,
        deliveryFee: val.deliveryFee,
        commissionBps: val.commissionBps,
        commissionAmount: val.commissionAmount,
        totalDue: val.totalDue,
      },
      items: val.items.map((it) => ({
        houseItemId: it.houseItemId,
        serviceId: it.serviceId,
        itemId: it.itemId,
        fabricId: it.fabricId,
        declaredQuantity: it.quantity,
        unitPrice: it.unitPrice,
        status: "accepted",
      })),
      event: {
        type: "status_change",
        toStatus: "created",
        actorId: params.adminId,
        actorRole: "admin",
        recordedBy: params.adminId,
        note: `Manual order created via ${params.source}`,
      },
      missions: [
        {
          type: "pickup",
          status: "unassigned",
          slotStart: val.pickupSlotStart,
          slotEnd: val.pickupSlotEnd,
          currency: "CDF",
        },
      ],
    });

    return ok(created);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to create manual order");
  }
}
