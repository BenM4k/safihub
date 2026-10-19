import "server-only";
import { and, asc, count, desc, eq, gte, ilike, inArray, ne, or, sql } from "drizzle-orm";
import { db, schema } from "./db";
import { toBukavuDateTime, fromBukavuDateTime } from "@/services/availability/bukavu-time";
import { ok, err, type Result } from "@/lib/result";
import type { ApprovalMethod, OrderSource, OrderStatus } from "@/services/db/schema";
import type { orderEventTypeEnum } from "@/services/db/schema";
import type {
  FollowUpChannel,
  FollowUpOutcome,
  RelanceEventSummary,
} from "@/lib/dispatch-grouping";

export type OrderEventType = (typeof orderEventTypeEnum.enumValues)[number];

export interface OrderListItemRecord {
  id: string;
  code: string;
  trackingToken: string;
  customerId: string;
  customerName?: string;
  customerPhone: string;
  houseId: string;
  houseName?: string;
  neighborhoodId: string;
  neighborhoodName?: string;
  housePhone?: string | null;
  status: OrderStatus;
  source: OrderSource;
  totalDue: number;
  currency: "CDF" | "USD";
  itemsTotal: number;
  deliveryFee: number;
  commissionAmount: number;
  pickupSlotStart: Date;
  pickupSlotEnd: Date;
  createdAt: Date;
  acceptanceDeadlineAt: Date | null;
}

export interface OrderDetailRecord extends OrderListItemRecord {
  landmark: string;
  deliverySlotStart: Date | null;
  deliverySlotEnd: Date | null;
  commissionBps: number;
  paymentCurrency: "CDF" | "USD";
  exchangeRateUsed: string | null;
  deliveryConfirmationCode: string | null;
  notes: string | null;
  updatedAt: Date | null;
}

export interface OrderItemRecord {
  id: string;
  orderId: string;
  houseItemId: string | null;
  serviceId: string | null;
  serviceNameFr?: string | null;
  itemId: string | null;
  itemNameFr?: string | null;
  fabricId: string | null;
  fabricNameFr?: string | null;
  customLabel: string | null;
  declaredQuantity: number;
  pickupQuantity: number | null;
  receivedQuantity: number | null;
  unitPrice: number;
  conditionNote: string | null;
  isFlagged: boolean;
  status: "accepted" | "returned";
}

export interface OrderEventRecord {
  id: string;
  orderId: string;
  type: OrderEventType;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus | null;
  actorId: string | null;
  actorName?: string | null;
  actorRole: string | null;
  onBehalfOfHouseId: string | null;
  onBehalfOfHouseName?: string | null;
  approvalMethod: ApprovalMethod | null;
  recordedBy: string | null;
  note: string | null;
  payload: Record<string, unknown> | null;
  createdAt: Date;
}

export async function getOrders(filters?: {
  status?: OrderStatus;
  houseId?: string;
  search?: string;
  source?: OrderSource;
  limit?: number;
  offset?: number;
}): Promise<OrderListItemRecord[]> {
  const conditions = [];

  if (filters?.status) {
    conditions.push(eq(schema.orders.status, filters.status));
  }

  if (filters?.houseId) {
    conditions.push(eq(schema.orders.houseId, filters.houseId));
  }

  if (filters?.source) {
    conditions.push(eq(schema.orders.source, filters.source));
  }

  if (filters?.search && filters.search.trim()) {
    const q = `%${filters.search.trim()}%`;
    conditions.push(
      or(
        ilike(schema.orders.code, q),
        ilike(schema.orders.contactPhone, q),
        ilike(schema.user.name, q)
      )
    );
  }

  const query = db
    .select({
      id: schema.orders.id,
      code: schema.orders.code,
      trackingToken: schema.orders.trackingToken,
      customerId: schema.orders.customerId,
      customerName: schema.user.name,
      customerPhone: schema.orders.contactPhone,
      houseId: schema.orders.houseId,
      houseName: schema.houses.name,
      housePhone: schema.houses.contactPhone,
      neighborhoodId: schema.orders.neighborhoodId,
      neighborhoodName: schema.neighborhoods.name,
      status: schema.orders.status,
      source: schema.orders.source,
      totalDue: schema.orders.totalDue,
      currency: schema.orders.currency,
      itemsTotal: schema.orders.itemsTotal,
      deliveryFee: schema.orders.deliveryFee,
      commissionAmount: schema.orders.commissionAmount,
      pickupSlotStart: schema.orders.pickupSlotStart,
      pickupSlotEnd: schema.orders.pickupSlotEnd,
      createdAt: schema.orders.createdAt,
      acceptanceDeadlineAt: schema.orders.acceptanceDeadlineAt,
    })
    .from(schema.orders)
    .innerJoin(schema.user, eq(schema.orders.customerId, schema.user.id))
    .innerJoin(schema.houses, eq(schema.orders.houseId, schema.houses.id))
    .innerJoin(
      schema.neighborhoods,
      eq(schema.orders.neighborhoodId, schema.neighborhoods.id)
    )
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(schema.orders.createdAt));

  if (filters?.limit !== undefined) {
    return query.limit(filters.limit).offset(filters?.offset ?? 0);
  }
  if (filters?.offset !== undefined) {
    return query.offset(filters.offset);
  }

  return query;
}

export async function getOrderById(orderId: string): Promise<OrderDetailRecord | null> {
  const [row] = await db
    .select({
      id: schema.orders.id,
      code: schema.orders.code,
      trackingToken: schema.orders.trackingToken,
      customerId: schema.orders.customerId,
      customerName: schema.user.name,
      customerPhone: schema.orders.contactPhone,
      houseId: schema.orders.houseId,
      houseName: schema.houses.name,
      neighborhoodId: schema.orders.neighborhoodId,
      neighborhoodName: schema.neighborhoods.name,
      landmark: schema.orders.landmark,
      status: schema.orders.status,
      source: schema.orders.source,
      totalDue: schema.orders.totalDue,
      currency: schema.orders.currency,
      itemsTotal: schema.orders.itemsTotal,
      deliveryFee: schema.orders.deliveryFee,
      commissionAmount: schema.orders.commissionAmount,
      commissionBps: schema.orders.commissionBps,
      paymentCurrency: schema.orders.paymentCurrency,
      exchangeRateUsed: schema.orders.exchangeRateUsed,
      deliveryConfirmationCode: schema.orders.deliveryConfirmationCode,
      notes: schema.orders.notes,
      pickupSlotStart: schema.orders.pickupSlotStart,
      pickupSlotEnd: schema.orders.pickupSlotEnd,
      deliverySlotStart: schema.orders.deliverySlotStart,
      deliverySlotEnd: schema.orders.deliverySlotEnd,
      acceptanceDeadlineAt: schema.orders.acceptanceDeadlineAt,
      createdAt: schema.orders.createdAt,
      updatedAt: schema.orders.updatedAt,
    })
    .from(schema.orders)
    .innerJoin(schema.user, eq(schema.orders.customerId, schema.user.id))
    .innerJoin(schema.houses, eq(schema.orders.houseId, schema.houses.id))
    .innerJoin(
      schema.neighborhoods,
      eq(schema.orders.neighborhoodId, schema.neighborhoods.id)
    )
    .where(eq(schema.orders.id, orderId))
    .limit(1);

  return row ?? null;
}

export async function getOrderItems(orderId: string): Promise<OrderItemRecord[]> {
  const rows = await db
    .select({
      id: schema.orderItems.id,
      orderId: schema.orderItems.orderId,
      houseItemId: schema.orderItems.houseItemId,
      serviceId: schema.orderItems.serviceId,
      serviceNameFr: schema.services.nameFr,
      itemId: schema.orderItems.itemId,
      itemNameFr: schema.items.nameFr,
      fabricId: schema.orderItems.fabricId,
      fabricNameFr: schema.fabrics.nameFr,
      customLabel: schema.orderItems.customLabel,
      declaredQuantity: schema.orderItems.declaredQuantity,
      pickupQuantity: schema.orderItems.pickupQuantity,
      receivedQuantity: schema.orderItems.receivedQuantity,
      unitPrice: schema.orderItems.unitPrice,
      conditionNote: schema.orderItems.conditionNote,
      isFlagged: schema.orderItems.isFlagged,
      status: schema.orderItems.status,
    })
    .from(schema.orderItems)
    .leftJoin(schema.services, eq(schema.orderItems.serviceId, schema.services.id))
    .leftJoin(schema.items, eq(schema.orderItems.itemId, schema.items.id))
    .leftJoin(schema.fabrics, eq(schema.orderItems.fabricId, schema.fabrics.id))
    .where(eq(schema.orderItems.orderId, orderId));

  return rows;
}

export async function getOrderEvents(orderId: string): Promise<OrderEventRecord[]> {
  const rows = await db
    .select({
      id: schema.orderEvents.id,
      orderId: schema.orderEvents.orderId,
      type: schema.orderEvents.type,
      fromStatus: schema.orderEvents.fromStatus,
      toStatus: schema.orderEvents.toStatus,
      actorId: schema.orderEvents.actorId,
      actorName: schema.user.name,
      actorRole: schema.orderEvents.actorRole,
      onBehalfOfHouseId: schema.orderEvents.onBehalfOfHouseId,
      onBehalfOfHouseName: schema.houses.name,
      approvalMethod: schema.orderEvents.approvalMethod,
      recordedBy: schema.orderEvents.recordedBy,
      note: schema.orderEvents.note,
      payload: schema.orderEvents.payload,
      createdAt: schema.orderEvents.createdAt,
    })
    .from(schema.orderEvents)
    .leftJoin(schema.user, eq(schema.orderEvents.actorId, schema.user.id))
    .leftJoin(schema.houses, eq(schema.orderEvents.onBehalfOfHouseId, schema.houses.id))
    .where(eq(schema.orderEvents.orderId, orderId))
    .orderBy(asc(schema.orderEvents.createdAt));

  return rows as OrderEventRecord[];
}

export async function addOrderEvent(event: {
  orderId: string;
  type?: OrderEventType;
  fromStatus?: OrderStatus | null;
  toStatus?: OrderStatus | null;
  actorId?: string | null;
  actorRole?: string | null;
  onBehalfOfHouseId?: string | null;
  approvalMethod?: ApprovalMethod | null;
  recordedBy?: string | null;
  note?: string | null;
  payload?: Record<string, unknown> | null;
}): Promise<void> {
  await db.insert(schema.orderEvents).values({
    orderId: event.orderId,
    type: event.type ?? "status_change",
    fromStatus: event.fromStatus ?? null,
    toStatus: event.toStatus ?? null,
    actorId: event.actorId ?? null,
    actorRole: event.actorRole ?? null,
    onBehalfOfHouseId: event.onBehalfOfHouseId ?? null,
    approvalMethod: event.approvalMethod ?? null,
    recordedBy: event.recordedBy ?? null,
    note: event.note ?? null,
    payload: event.payload ?? null,
  });
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus
): Promise<void> {
  await db
    .update(schema.orders)
    .set({
      status: newStatus,
      updatedAt: new Date(),
    })
    .where(eq(schema.orders.id, orderId));
}

/**
 * Compare-and-set status update: only writes when the order is still in
 * `expectedStatus`. Returns true when a row was updated.
 */
export async function updateOrderStatusIfCurrent(
  orderId: string,
  expectedStatus: OrderStatus,
  newStatus: OrderStatus
): Promise<boolean> {
  const rows = await db
    .update(schema.orders)
    .set({
      status: newStatus,
      updatedAt: new Date(),
    })
    .where(and(eq(schema.orders.id, orderId), eq(schema.orders.status, expectedStatus)))
    .returning({ id: schema.orders.id });
  return rows.length > 0;
}

export async function updateOrderStatusWithDeadline(
  orderId: string,
  expectedStatus: OrderStatus,
  newStatus: OrderStatus,
  deadlineAt: Date | null
): Promise<boolean> {
  const rows = await db
    .update(schema.orders)
    .set({
      status: newStatus,
      acceptanceDeadlineAt: deadlineAt,
      updatedAt: new Date(),
    })
    .where(and(eq(schema.orders.id, orderId), eq(schema.orders.status, expectedStatus)))
    .returning({ id: schema.orders.id });
  return rows.length > 0;
}

export async function updateOrderFinancials(params: {
  orderId: string;
  deliveryFee: number;
  totalDue: number;
}): Promise<Result<void>> {
  try {
    await db
      .update(schema.orders)
      .set({
        deliveryFee: params.deliveryFee,
        totalDue: params.totalDue,
        updatedAt: new Date(),
      })
      .where(eq(schema.orders.id, params.orderId));
    return ok(undefined);
  } catch (error) {
    return err(
      error instanceof Error ? error.message : "Erreur mise à jour financière de la commande"
    );
  }
}

export async function transitionOrderStatusAtomic(params: {
  orderId: string;
  expectedStatus?: OrderStatus;
  newStatus: OrderStatus;
  event: {
    type?: OrderEventType;
    fromStatus?: OrderStatus | null;
    toStatus?: OrderStatus | null;
    actorId?: string | null;
    actorRole?: string | null;
    onBehalfOfHouseId?: string | null;
    approvalMethod?: ApprovalMethod | null;
    recordedBy?: string | null;
    note?: string | null;
    payload?: Record<string, unknown> | null;
  };
}): Promise<boolean> {
  return await db.transaction(async (tx) => {
    const conditions = [eq(schema.orders.id, params.orderId)];
    if (params.expectedStatus) {
      conditions.push(eq(schema.orders.status, params.expectedStatus));
    }

    const updated = await tx
      .update(schema.orders)
      .set({
        status: params.newStatus,
        updatedAt: new Date(),
      })
      .where(and(...conditions))
      .returning({ id: schema.orders.id });

    if (updated.length === 0) {
      return false;
    }

    await tx.insert(schema.orderEvents).values({
      orderId: params.orderId,
      type: params.event.type ?? "status_change",
      fromStatus: params.event.fromStatus ?? null,
      toStatus: params.event.toStatus ?? null,
      actorId: params.event.actorId ?? null,
      actorRole: params.event.actorRole ?? null,
      onBehalfOfHouseId: params.event.onBehalfOfHouseId ?? null,
      approvalMethod: params.event.approvalMethod ?? null,
      recordedBy: params.event.recordedBy ?? null,
      note: params.event.note ?? null,
      payload: params.event.payload ?? null,
    });

    return true;
  });
}

export async function insertOrderWithDetails(params: {
  order: typeof schema.orders.$inferInsert;
  items: Array<Omit<typeof schema.orderItems.$inferInsert, "orderId">>;
  event: Omit<typeof schema.orderEvents.$inferInsert, "orderId">;
  missions?: Array<Omit<typeof schema.missions.$inferInsert, "orderId">>;
}): Promise<{ orderId: string; code: string; trackingToken: string }> {
  return await db.transaction(async (tx) => {
    const [createdOrder] = await tx
      .insert(schema.orders)
      .values(params.order)
      .returning({
        id: schema.orders.id,
        code: schema.orders.code,
        trackingToken: schema.orders.trackingToken,
      });

    const orderId = createdOrder!.id;

    if (params.items.length > 0) {
      await tx.insert(schema.orderItems).values(
        params.items.map((it) => ({
          ...it,
          orderId,
        }))
      );
    }

    await tx.insert(schema.orderEvents).values({
      ...params.event,
      orderId,
    });

    if (params.missions && params.missions.length > 0) {
      await tx.insert(schema.missions).values(
        params.missions.map((m) => ({
          ...m,
          orderId,
        }))
      );
    }

    return {
      orderId,
      code: createdOrder!.code,
      trackingToken: createdOrder!.trackingToken,
    };
  });
}

export interface OrderValidationData {
  existingOrders: Array<{
    id: string;
    code: string;
    trackingToken?: string;
    idempotencyKey: string;
    customerId: string;
  }>;
  houseItems: Array<{
    id: string;
    houseId: string;
    serviceId: string;
    itemId: string;
    fabricId: string;
    price: number;
    isActive: boolean;
  }>;
  houseHours: Array<{
    houseId: string;
    weekday: number;
    opensAt: string;
    closesAt: string;
  }>;
  houseClosures: Array<{
    houseId: string;
    startsOn: string;
    endsOn: string;
    reason: string | null;
  }>;
  houseCoverage: Array<{
    houseId: string;
    neighborhoodId: string;
    isActive: boolean;
    pausedUntil: Date | string | null;
  }>;
  courierShifts: Array<{
    courierId: string;
    weekday: number;
    startsAt: string;
    endsAt: string;
  }>;
  customerOpenOrdersCount?: number;
  customerCompletedOrdersCount?: number;
  dailyOrdersForPhoneCount?: number;
  isCustomerBlocked?: boolean;
}

export async function getOrderValidationData(scope?: {
  houseId?: string;
  customerId?: string;
  idempotencyKey?: string;
  contactPhone?: string;
}): Promise<OrderValidationData> {
  const orderConditions = [];
  if (scope?.customerId && scope?.idempotencyKey) {
    orderConditions.push(
      or(
        eq(schema.orders.customerId, scope.customerId),
        eq(schema.orders.idempotencyKey, scope.idempotencyKey)
      )
    );
  } else if (scope?.customerId) {
    orderConditions.push(eq(schema.orders.customerId, scope.customerId));
  } else if (scope?.idempotencyKey) {
    orderConditions.push(eq(schema.orders.idempotencyKey, scope.idempotencyKey));
  }

  const existingOrdersQuery = db
    .select({
      id: schema.orders.id,
      code: schema.orders.code,
      trackingToken: schema.orders.trackingToken,
      idempotencyKey: schema.orders.idempotencyKey,
      customerId: schema.orders.customerId,
    })
    .from(schema.orders);

  const houseItemsQuery = db
    .select({
      id: schema.houseItems.id,
      houseId: schema.houseItems.houseId,
      serviceId: schema.houseItems.serviceId,
      itemId: schema.houseItems.itemId,
      fabricId: schema.houseItems.fabricId,
      price: schema.houseItems.price,
      isActive: schema.houseItems.isActive,
    })
    .from(schema.houseItems);

  const houseHoursQuery = db
    .select({
      houseId: schema.houseHours.houseId,
      weekday: schema.houseHours.weekday,
      opensAt: schema.houseHours.opensAt,
      closesAt: schema.houseHours.closesAt,
    })
    .from(schema.houseHours);

  const houseClosuresQuery = db
    .select({
      houseId: schema.houseClosures.houseId,
      startsOn: schema.houseClosures.startsOn,
      endsOn: schema.houseClosures.endsOn,
      reason: schema.houseClosures.reason,
    })
    .from(schema.houseClosures);

  const houseCoverageQuery = db
    .select({
      houseId: schema.houseCoverage.houseId,
      neighborhoodId: schema.houseCoverage.neighborhoodId,
      isActive: schema.houseCoverage.isActive,
      pausedUntil: schema.houseCoverage.pausedUntil,
    })
    .from(schema.houseCoverage);

  const courierShiftsQuery = db
    .select({
      courierId: schema.courierShifts.courierId,
      weekday: schema.courierShifts.weekday,
      startsAt: schema.courierShifts.startsAt,
      endsAt: schema.courierShifts.endsAt,
    })
    .from(schema.courierShifts);

  // Queries for open orders, completed orders, daily phone cap and block status
  const openStatuses = [
    "awaiting_confirmation",
    "created",
    "accepted",
    "pickup_assigned",
    "pickup_in_progress",
    "picked_up",
    "received",
    "price_adjusted",
    "washing",
    "ready",
    "delivery_slot_confirmed",
    "delivery_assigned",
    "delivery_in_progress",
    "disputed",
  ] as const;

  const openOrdersPromise = scope?.customerId
    ? db
        .select({ count: sql<number>`count(*)::int` })
        .from(schema.orders)
        .where(
          and(
            eq(schema.orders.customerId, scope.customerId),
            inArray(schema.orders.status, openStatuses as unknown as OrderStatus[])
          )
        )
    : Promise.resolve([{ count: 0 }]);

  const completedOrdersPromise = scope?.customerId
    ? db
        .select({ count: sql<number>`count(*)::int` })
        .from(schema.orders)
        .where(
          and(
            eq(schema.orders.customerId, scope.customerId),
            eq(schema.orders.status, "delivered")
          )
        )
    : Promise.resolve([{ count: 0 }]);

  // Today start in UTC/Bukavu
  const now = new Date();
  const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));

  const dailyOrdersPromise = scope?.contactPhone
    ? db
        .select({ count: sql<number>`count(*)::int` })
        .from(schema.orders)
        .where(
          and(
            eq(schema.orders.contactPhone, scope.contactPhone),
            gte(schema.orders.createdAt, todayStart),
            sql`${schema.orders.status} != 'cancelled'`
          )
        )
    : Promise.resolve([{ count: 0 }]);

  const customerUserPromise = scope?.customerId
    ? db
        .select({ status: schema.user.status, banned: schema.user.banned })
        .from(schema.user)
        .where(eq(schema.user.id, scope.customerId))
        .limit(1)
    : Promise.resolve([]);

  const phoneUserPromise = scope?.contactPhone
    ? db
        .select({ status: schema.user.status, banned: schema.user.banned })
        .from(schema.user)
        .where(
          and(
            eq(schema.user.contactPhone, scope.contactPhone),
            ne(schema.user.status, "merged"),
            or(eq(schema.user.status, "blocked"), eq(schema.user.banned, true))
          )
        )
        .limit(1)
    : Promise.resolve([]);

  const [
    existingOrders,
    houseItems,
    houseHours,
    houseClosures,
    houseCoverage,
    courierShifts,
    openOrdersResult,
    completedOrdersResult,
    dailyOrdersResult,
    customerUserResult,
    phoneUserResult,
  ] = await Promise.all([
    orderConditions.length > 0
      ? existingOrdersQuery.where(and(...orderConditions))
      : existingOrdersQuery.limit(200),
    scope?.houseId
      ? houseItemsQuery.where(eq(schema.houseItems.houseId, scope.houseId))
      : houseItemsQuery,
    scope?.houseId
      ? houseHoursQuery.where(eq(schema.houseHours.houseId, scope.houseId))
      : houseHoursQuery,
    scope?.houseId
      ? houseClosuresQuery.where(eq(schema.houseClosures.houseId, scope.houseId))
      : houseClosuresQuery,
    scope?.houseId
      ? houseCoverageQuery.where(eq(schema.houseCoverage.houseId, scope.houseId))
      : houseCoverageQuery,
    courierShiftsQuery,
    openOrdersPromise,
    completedOrdersPromise,
    dailyOrdersPromise,
    customerUserPromise,
    phoneUserPromise,
  ]);

  const customerUser = customerUserResult[0];
  const isCustomerBlocked = Boolean(
    (customerUser && (customerUser.status === "blocked" || customerUser.banned)) ||
    phoneUserResult.length > 0
  );

  return {
    existingOrders,
    houseItems,
    houseHours,
    houseClosures,
    houseCoverage,
    courierShifts,
    customerOpenOrdersCount: openOrdersResult[0]?.count ?? 0,
    customerCompletedOrdersCount: completedOrdersResult[0]?.count ?? 0,
    dailyOrdersForPhoneCount: dailyOrdersResult[0]?.count ?? 0,
    isCustomerBlocked,
  };
}

import { getHouseSettlementDetail } from "./cash-ledger.dal";
import { getHouseHours, getHouseClosures } from "./house.dal";
import {
  computeHouseOpenStatus,
  formatOrderItemsSummary,
  computeAcceptanceRate,
  computeOrderAcceptanceCountdown,
} from "@/lib/partner-dashboard";

export interface HouseOrderListItemRecord {
  id: string;
  code: string;
  trackingToken: string;
  customerFirstName: string;
  neighborhoodId: string;
  neighborhoodName?: string;
  status: OrderStatus;
  source: OrderSource;
  totalDue: number;
  itemsTotal: number;
  adjustedItemsTotal: number | null;
  commissionAmount: number | null;
  commissionBps: number | null;
  deliveryFee: number | null;
  currency: "CDF" | "USD";
  pickupSlotStart: Date;
  pickupSlotEnd: Date;
  deliverySlotStart: Date | null;
  deliverySlotEnd: Date | null;
  estimatedDeliveryAt: Date | null;
  acceptanceDeadlineAt: Date | null;
  receptionDeadlineAt: Date | null;
  createdAt: Date;
  itemsSummary?: string | null;
  servicesSummary?: string | null;
  itemsCount?: number;
  isExpired?: boolean;
}

export interface HouseOrderDetailRecord extends HouseOrderListItemRecord {
  notes: string | null;
  updatedAt: Date | null;
}

/**
 * AC 15: Restricted house order listing projection.
 * Strictly NEVER includes customer phone number or street address / landmark.
 * Scoped strictly to the authenticated houseId.
 */
export async function getHouseOrdersRestricted(
  houseId: string,
  filters?: {
    status?: OrderStatus;
    search?: string;
    limit?: number;
    offset?: number;
    orderBy?: "createdAt" | "acceptanceDeadlineAt";
    orderDirection?: "asc" | "desc";
  }
): Promise<HouseOrderListItemRecord[]> {
  const conditions = [eq(schema.orders.houseId, houseId)];

  if (filters?.status) {
    conditions.push(eq(schema.orders.status, filters.status));
  }

  if (filters?.search && filters.search.trim()) {
    const q = `%${filters.search.trim()}%`;
    conditions.push(
      or(
        ilike(schema.orders.code, q),
        ilike(schema.neighborhoods.name, q)
      )!
    );
  }

  let orderClause = desc(schema.orders.createdAt);
  if (filters?.orderBy === "acceptanceDeadlineAt") {
    orderClause =
      filters?.orderDirection === "desc"
        ? sql`${schema.orders.acceptanceDeadlineAt} DESC NULLS LAST`
        : sql`${schema.orders.acceptanceDeadlineAt} ASC NULLS LAST`;
  }

  const rows = await db
    .select({
      id: schema.orders.id,
      code: schema.orders.code,
      trackingToken: schema.orders.trackingToken,
      customerRawName: schema.user.name,
      neighborhoodId: schema.orders.neighborhoodId,
      neighborhoodName: schema.neighborhoods.name,
      status: schema.orders.status,
      source: schema.orders.source,
      totalDue: schema.orders.totalDue,
      itemsTotal: schema.orders.itemsTotal,
      adjustedItemsTotal: schema.orders.adjustedItemsTotal,
      commissionAmount: schema.orders.commissionAmount,
      commissionBps: schema.orders.commissionBps,
      deliveryFee: schema.orders.deliveryFee,
      currency: schema.orders.currency,
      pickupSlotStart: schema.orders.pickupSlotStart,
      pickupSlotEnd: schema.orders.pickupSlotEnd,
      deliverySlotStart: schema.orders.deliverySlotStart,
      deliverySlotEnd: schema.orders.deliverySlotEnd,
      estimatedDeliveryAt: schema.orders.estimatedDeliveryAt,
      acceptanceDeadlineAt: schema.orders.acceptanceDeadlineAt,
      receptionDeadlineAt: schema.orders.receptionDeadlineAt,
      createdAt: schema.orders.createdAt,
    })
    .from(schema.orders)
    .innerJoin(schema.user, eq(schema.orders.customerId, schema.user.id))
    .innerJoin(
      schema.neighborhoods,
      eq(schema.orders.neighborhoodId, schema.neighborhoods.id)
    )
    .where(and(...conditions))
    .orderBy(orderClause)
    .limit(filters?.limit ?? 50)
    .offset(filters?.offset ?? 0);

  return rows.map((r) => ({
    ...r,
    customerFirstName: r.customerRawName.trim().split(" ")[0] || "Client",
  }));
}

/**
 * AC 15: Projects an order for the house portal, stripping phone and street address.
 */
export function projectHouseFacingOrder<T extends { customerRawName: string }>(
  order: T
): Omit<T, "customerPhone" | "streetAddress" | "landmark"> & { customerFirstName: string } {
  const record = order as unknown as Record<string, unknown>;
  const copy = { ...record };
  delete copy.customerPhone;
  delete copy.streetAddress;
  delete copy.landmark;
  const rawName = typeof record.customerRawName === "string" ? record.customerRawName : "";
  return {
    ...copy,
    customerFirstName: rawName.trim().split(" ")[0] || "Client",
  } as Omit<T, "customerPhone" | "streetAddress" | "landmark"> & { customerFirstName: string };
}

/**
 * AC 15: Restricted house order detail projection.
 * Strictly verifies ownership by houseId, omits phone & street address.
 */
export async function getHouseOrderDetailRestricted(
  houseId: string,
  orderId: string
): Promise<HouseOrderDetailRecord | null> {
  const [row] = await db
    .select({
      id: schema.orders.id,
      code: schema.orders.code,
      trackingToken: schema.orders.trackingToken,
      customerRawName: schema.user.name,
      neighborhoodId: schema.orders.neighborhoodId,
      neighborhoodName: schema.neighborhoods.name,
      status: schema.orders.status,
      source: schema.orders.source,
      totalDue: schema.orders.totalDue,
      itemsTotal: schema.orders.itemsTotal,
      adjustedItemsTotal: schema.orders.adjustedItemsTotal,
      commissionAmount: schema.orders.commissionAmount,
      commissionBps: schema.orders.commissionBps,
      deliveryFee: schema.orders.deliveryFee,
      currency: schema.orders.currency,
      pickupSlotStart: schema.orders.pickupSlotStart,
      pickupSlotEnd: schema.orders.pickupSlotEnd,
      deliverySlotStart: schema.orders.deliverySlotStart,
      deliverySlotEnd: schema.orders.deliverySlotEnd,
      estimatedDeliveryAt: schema.orders.estimatedDeliveryAt,
      acceptanceDeadlineAt: schema.orders.acceptanceDeadlineAt,
      receptionDeadlineAt: schema.orders.receptionDeadlineAt,
      notes: schema.orders.notes,
      createdAt: schema.orders.createdAt,
      updatedAt: schema.orders.updatedAt,
    })
    .from(schema.orders)
    .innerJoin(schema.user, eq(schema.orders.customerId, schema.user.id))
    .innerJoin(
      schema.neighborhoods,
      eq(schema.orders.neighborhoodId, schema.neighborhoods.id)
    )
    .where(and(eq(schema.orders.id, orderId), eq(schema.orders.houseId, houseId)))
    .limit(1);

  if (!row) return null;

  return {
    ...row,
    customerFirstName: row.customerRawName.trim().split(" ")[0] || "Client",
  };
}

export interface HouseDashboardAlert {
  id: string;
  type: "expiring_order" | "missing_hours" | "unpriced_items" | "capacity_warning" | "house_paused";
  severity: "warning" | "critical" | "info";
  title: string;
  message: string;
  titleKey?: string;
  titleParams?: Record<string, string | number>;
  messageKey?: string;
  messageParams?: Record<string, string | number>;
  link?: string;
}

export interface HouseDashboardMetrics {
  waitingAcceptanceCount: number;
  waitingAcceptanceOrders: HouseOrderListItemRecord[];
  missedOrders: HouseOrderListItemRecord[];
  missedOrdersCount: number;
  washingCount: number;
  readyCount: number;
  completedTodayCount: number;
  todayOrdersCount: number;
  dailyCapacity: number | null;
  isPaused: boolean;
  pausedUntil: Date | null;
  todayNetRevenueCDF: number;
  yesterdayNetRevenueCDF: number;
  weekNetRevenueCDF: number;
  lastWeekNetRevenueCDF: number;
  balanceOwedCDF: number;
  nextSettlementDate: string;
  acceptanceRate30d: number | null;
  acceptanceRateTrend: number | null;
  avgAcceptanceMinutes: number | null;
  onTimeDeliveryRate: number | null;
  dailyChart: Array<{
    date: string;
    label: string;
    ordersCount: number | null;
    revenueCDF: number | null;
  }>;
  recentOrders: HouseOrderListItemRecord[];
  upcomingPickups: HouseOrderListItemRecord[];
  alerts: HouseDashboardAlert[];
  house: {
    id: string;
    name: string;
    slug: string;
    neighborhoodName?: string | null;
    communeName?: string | null;
    contactPhone?: string | null;
    isPaused: boolean;
    dailyCapacity: number | null;
    rating: number | null;
    coverImageUrl: string | null;
    logoUrl: string | null;
    statusPill: {
      status: "open" | "closed" | "paused";
      label: string;
      badgeClass: string;
    };
  };
}

/**
 * Helper to fetch order items and services summary for a list of house orders.
 */
async function attachSummariesToHouseOrders(
  orders: HouseOrderListItemRecord[]
): Promise<HouseOrderListItemRecord[]> {
  if (orders.length === 0) return orders;

  const orderIds = orders.map((o) => o.id);
  const itemsRows = await db
    .select({
      orderId: schema.orderItems.orderId,
      itemNameFr: schema.items.nameFr,
      serviceNameFr: schema.services.nameFr,
      declaredQuantity: schema.orderItems.declaredQuantity,
      customLabel: schema.orderItems.customLabel,
    })
    .from(schema.orderItems)
    .leftJoin(schema.items, eq(schema.orderItems.itemId, schema.items.id))
    .leftJoin(schema.services, eq(schema.orderItems.serviceId, schema.services.id))
    .where(inArray(schema.orderItems.orderId, orderIds));

  const itemsByOrder = new Map<
    string,
    Array<{ itemNameFr?: string | null; declaredQuantity: number; customLabel?: string | null }>
  >();
  const servicesByOrder = new Map<string, Set<string>>();

  for (const it of itemsRows) {
    const list = itemsByOrder.get(it.orderId) || [];
    list.push(it);
    itemsByOrder.set(it.orderId, list);

    if (it.serviceNameFr) {
      const sSet = servicesByOrder.get(it.orderId) || new Set<string>();
      sSet.add(it.serviceNameFr);
      servicesByOrder.set(it.orderId, sSet);
    }
  }

  const now = new Date();

  return orders.map((ord) => {
    const ordItems = itemsByOrder.get(ord.id) || [];
    const ordServices = Array.from(servicesByOrder.get(ord.id) || []);
    const countdown = computeOrderAcceptanceCountdown(ord.acceptanceDeadlineAt, now);

    return {
      ...ord,
      itemsSummary: formatOrderItemsSummary(ordItems),
      servicesSummary: ordServices.length > 0 ? ordServices.join(" & ") : "Pressing & Repassage",
      itemsCount: ordItems.reduce((acc, it) => acc + it.declaredQuantity, 0),
      isExpired: countdown.isExpired,
    };
  });
}

/**
 * Computes rich workload, financial, and operational metrics for the Partner Dashboard.
 */
export async function getHouseDashboardMetrics(
  houseId: string
): Promise<HouseDashboardMetrics> {
  const [houseRow] = await db
    .select({
      id: schema.houses.id,
      name: schema.houses.name,
      slug: schema.houses.slug,
      neighborhoodId: schema.houses.neighborhoodId,
      neighborhoodName: schema.neighborhoods.name,
      communeName: schema.zones.name,
      dailyCapacity: schema.houses.dailyCapacity,
      isPaused: schema.houses.isPaused,
      pausedUntil: schema.houses.pausedUntil,
      contactPhone: schema.houses.contactPhone,
      turnaroundHours: schema.houses.turnaroundHours,
    })
    .from(schema.houses)
    .innerJoin(schema.neighborhoods, eq(schema.houses.neighborhoodId, schema.neighborhoods.id))
    .innerJoin(schema.zones, eq(schema.neighborhoods.zoneId, schema.zones.id))
    .where(eq(schema.houses.id, houseId))
    .limit(1);

  const now = new Date();
  const bukavuNow = toBukavuDateTime(now);
  const startOfDay = fromBukavuDateTime(bukavuNow.dateString, "00:00");
  const yesterdayStart = new Date(startOfDay.getTime() - 24 * 60 * 60 * 1000);

  // Week start: calculate Monday of current Bukavu week
  const daysSinceMonday = bukavuNow.weekday - 1;
  const startOfWeek = new Date(startOfDay.getTime() - daysSinceMonday * 24 * 60 * 60 * 1000);
  const startOfLastWeek = new Date(startOfWeek.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    waitingOrdersRaw,
    missedOrdersRaw,
    statusCounts,
    [completedTodayRow],
    [todayOrdersRow],
    settlementDetail,
    hours,
    closures,
    deliveredTodayRows,
    deliveredYesterdayRows,
    deliveredThisWeekRows,
    deliveredLastWeekRows,
    recentOrdersRaw,
    upcomingPickupsRaw,
    [unpricedItemsCountRow],
    last30dOrders,
    deliveredLast30dRows,
  ] = await Promise.all([
    getHouseOrdersRestricted(houseId, {
      status: "created",
      limit: 5,
      orderBy: "acceptanceDeadlineAt",
      orderDirection: "asc",
    }),
    getHouseOrdersRestricted(houseId, { status: "expired", limit: 5 }),
    db
      .select({
        status: schema.orders.status,
        count: count(),
      })
      .from(schema.orders)
      .where(eq(schema.orders.houseId, houseId))
      .groupBy(schema.orders.status),
    db
      .select({ count: count() })
      .from(schema.orders)
      .where(
        and(
          eq(schema.orders.houseId, houseId),
          eq(schema.orders.status, "delivered"),
          gte(schema.orders.updatedAt, startOfDay)
        )
      ),
    db
      .select({ count: count() })
      .from(schema.orders)
      .where(
        and(
          eq(schema.orders.houseId, houseId),
          gte(schema.orders.createdAt, startOfDay)
        )
      ),
    getHouseSettlementDetail(houseId).catch(() => ({
      balanceOwedCDF: 0,
      totalRevenueCDF: 0,
      totalCommissionCDF: 0,
      totalOwedCDF: 0,
      totalSettledCDF: 0,
    })),
    getHouseHours(houseId),
    getHouseClosures(houseId),
    db
      .select({
        itemsTotal: schema.orders.itemsTotal,
        adjustedItemsTotal: schema.orders.adjustedItemsTotal,
        commissionAmount: schema.orders.commissionAmount,
      })
      .from(schema.orders)
      .where(
        and(
          eq(schema.orders.houseId, houseId),
          eq(schema.orders.status, "delivered"),
          gte(schema.orders.updatedAt, startOfDay)
        )
      ),
    db
      .select({
        itemsTotal: schema.orders.itemsTotal,
        adjustedItemsTotal: schema.orders.adjustedItemsTotal,
        commissionAmount: schema.orders.commissionAmount,
      })
      .from(schema.orders)
      .where(
        and(
          eq(schema.orders.houseId, houseId),
          eq(schema.orders.status, "delivered"),
          gte(schema.orders.updatedAt, yesterdayStart),
          sql`${schema.orders.updatedAt} < ${startOfDay}`
        )
      ),
    db
      .select({
        itemsTotal: schema.orders.itemsTotal,
        adjustedItemsTotal: schema.orders.adjustedItemsTotal,
        commissionAmount: schema.orders.commissionAmount,
      })
      .from(schema.orders)
      .where(
        and(
          eq(schema.orders.houseId, houseId),
          eq(schema.orders.status, "delivered"),
          gte(schema.orders.updatedAt, startOfWeek)
        )
      ),
    db
      .select({
        itemsTotal: schema.orders.itemsTotal,
        adjustedItemsTotal: schema.orders.adjustedItemsTotal,
        commissionAmount: schema.orders.commissionAmount,
      })
      .from(schema.orders)
      .where(
        and(
          eq(schema.orders.houseId, houseId),
          eq(schema.orders.status, "delivered"),
          gte(schema.orders.updatedAt, startOfLastWeek),
          sql`${schema.orders.updatedAt} < ${startOfWeek}`
        )
      ),
    getHouseOrdersRestricted(houseId, { limit: 5 }),
    db
      .select({
        id: schema.orders.id,
        code: schema.orders.code,
        trackingToken: schema.orders.trackingToken,
        customerRawName: schema.user.name,
        neighborhoodId: schema.orders.neighborhoodId,
        neighborhoodName: schema.neighborhoods.name,
        status: schema.orders.status,
        source: schema.orders.source,
        totalDue: schema.orders.totalDue,
        itemsTotal: schema.orders.itemsTotal,
        adjustedItemsTotal: schema.orders.adjustedItemsTotal,
        commissionAmount: schema.orders.commissionAmount,
        commissionBps: schema.orders.commissionBps,
        deliveryFee: schema.orders.deliveryFee,
        currency: schema.orders.currency,
        pickupSlotStart: schema.orders.pickupSlotStart,
        pickupSlotEnd: schema.orders.pickupSlotEnd,
        deliverySlotStart: schema.orders.deliverySlotStart,
        deliverySlotEnd: schema.orders.deliverySlotEnd,
        estimatedDeliveryAt: schema.orders.estimatedDeliveryAt,
        acceptanceDeadlineAt: schema.orders.acceptanceDeadlineAt,
        receptionDeadlineAt: schema.orders.receptionDeadlineAt,
        createdAt: schema.orders.createdAt,
      })
      .from(schema.orders)
      .innerJoin(schema.user, eq(schema.orders.customerId, schema.user.id))
      .innerJoin(schema.neighborhoods, eq(schema.orders.neighborhoodId, schema.neighborhoods.id))
      .where(
        and(
          eq(schema.orders.houseId, houseId),
          inArray(schema.orders.status, ["accepted", "pickup_assigned", "pickup_in_progress"]),
          gte(schema.orders.pickupSlotStart, startOfDay)
        )
      )
      .orderBy(asc(schema.orders.pickupSlotStart))
      .limit(5),
    db
      .select({ count: count() })
      .from(schema.houseItems)
      .where(and(eq(schema.houseItems.houseId, houseId), eq(schema.houseItems.price, 0))),
    db
      .select({
        status: schema.orders.status,
        createdAt: schema.orders.createdAt,
      })
      .from(schema.orders)
      .where(
        and(
          eq(schema.orders.houseId, houseId),
          gte(schema.orders.createdAt, thirtyDaysAgo)
        )
      ),
    db
      .select({
        itemsTotal: schema.orders.itemsTotal,
        adjustedItemsTotal: schema.orders.adjustedItemsTotal,
        commissionAmount: schema.orders.commissionAmount,
        updatedAt: schema.orders.updatedAt,
      })
      .from(schema.orders)
      .where(
        and(
          eq(schema.orders.houseId, houseId),
          eq(schema.orders.status, "delivered"),
          gte(schema.orders.updatedAt, thirtyDaysAgo)
        )
      ),
  ]);

  // Enrich order summaries
  const [waitingAcceptanceOrders, missedOrders, recentOrders] = await Promise.all([
    attachSummariesToHouseOrders(waitingOrdersRaw),
    attachSummariesToHouseOrders(missedOrdersRaw),
    attachSummariesToHouseOrders(recentOrdersRaw),
  ]);

  const upcomingPickups: HouseOrderListItemRecord[] = upcomingPickupsRaw.map((r) => ({
    ...r,
    customerFirstName: r.customerRawName.trim().split(" ")[0] || "Client",
  }));

  const countsByStatus = new Map(statusCounts.map((r) => [r.status, r.count]));
  const waitingAcceptanceCount = countsByStatus.get("created") ?? 0;
  const missedOrdersCount = countsByStatus.get("expired") ?? 0;
  const washingCount =
    (countsByStatus.get("received") ?? 0) +
    (countsByStatus.get("price_adjusted") ?? 0) +
    (countsByStatus.get("washing") ?? 0);
  const readyCount = countsByStatus.get("ready") ?? 0;
  const completedTodayCount = completedTodayRow?.count ?? 0;
  const todayOrdersCount = todayOrdersRow?.count ?? 0;

  // Net revenues calculations
  const todayNetRevenueCDF = deliveredTodayRows.reduce(
    (sum, r) => sum + Math.max(0, (r.adjustedItemsTotal ?? r.itemsTotal) - (r.commissionAmount ?? 0)),
    0
  );
  const yesterdayNetRevenueCDF = deliveredYesterdayRows.reduce(
    (sum, r) => sum + Math.max(0, (r.adjustedItemsTotal ?? r.itemsTotal) - (r.commissionAmount ?? 0)),
    0
  );
  const weekNetRevenueCDF = deliveredThisWeekRows.reduce(
    (sum, r) => sum + Math.max(0, (r.adjustedItemsTotal ?? r.itemsTotal) - (r.commissionAmount ?? 0)),
    0
  );
  const lastWeekNetRevenueCDF = deliveredLastWeekRows.reduce(
    (sum, r) => sum + Math.max(0, (r.adjustedItemsTotal ?? r.itemsTotal) - (r.commissionAmount ?? 0)),
    0
  );

  // Acceptance rate (30 days)
  let accepted30d = 0;
  let rejected30d = 0;
  let expired30d = 0;
  for (const o of last30dOrders) {
    if (
      [
        "accepted",
        "pickup_assigned",
        "pickup_in_progress",
        "picked_up",
        "received",
        "price_adjusted",
        "washing",
        "ready",
        "delivery_slot_confirmed",
        "delivery_assigned",
        "delivery_in_progress",
        "delivered",
      ].includes(o.status)
    ) {
      accepted30d++;
    } else if (o.status === "rejected") {
      rejected30d++;
    } else if (o.status === "expired") {
      expired30d++;
    }
  }

  const acceptanceRate30d = computeAcceptanceRate(accepted30d, rejected30d, expired30d);

  // Daily 7-day chart data calculated from actual last30dOrders & deliveredLast30dRows
  const dayNames = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  const dailyChart = [];
  for (let i = 6; i >= 0; i--) {
    const dayDate = new Date(startOfDay.getTime() - i * 24 * 60 * 60 * 1000);
    const dayBukavu = toBukavuDateTime(dayDate);
    const dayLabel = dayNames[dayBukavu.weekday - 1] || dayBukavu.dateString.slice(5);

    const dayStart = new Date(dayDate.getTime());
    const dayEnd = new Date(dayDate.getTime() + 24 * 60 * 60 * 1000 - 1);

    const dayOrders = last30dOrders.filter(
      (o) => o.createdAt && o.createdAt >= dayStart && o.createdAt <= dayEnd
    );
    const ordersCount = dayOrders.length;

    const dayDelivered = deliveredLast30dRows.filter(
      (r) => r.updatedAt && r.updatedAt >= dayStart && r.updatedAt <= dayEnd
    );
    const revenueCDF = dayDelivered.reduce(
      (sum, r) => sum + Math.max(0, (r.adjustedItemsTotal ?? r.itemsTotal) - (r.commissionAmount ?? 0)),
      0
    );

    dailyChart.push({
      date: dayBukavu.dateString,
      label: dayLabel,
      ordersCount,
      revenueCDF,
    });
  }

  // Next settlement date: upcoming Friday at 16:00 (Bukavu-local calculation)
  const daysUntilFriday = (5 - bukavuNow.weekday + 7) % 7 || 7;
  const nextFriday = new Date(startOfDay.getTime() + daysUntilFriday * 24 * 60 * 60 * 1000);
  const nextFridayBukavu = toBukavuDateTime(nextFriday);
  const nextFridayUtc = new Date(
    Date.UTC(nextFridayBukavu.year, nextFridayBukavu.month - 1, nextFridayBukavu.day)
  );
  const nextSettlementMonth = nextFridayUtc.toLocaleDateString("fr-FR", {
    month: "short",
    timeZone: "UTC",
  });
  const nextSettlementDate = `Vendredi ${nextFridayBukavu.day} ${nextSettlementMonth}`;

  // Status pill
  const statusPill = computeHouseOpenStatus({
    isPaused: houseRow?.isPaused ?? false,
    pausedUntil: houseRow?.pausedUntil,
    hours,
    closures,
    now,
  });

  // Alerts synthesis
  const alerts: HouseDashboardAlert[] = [];

  // 1. Urgency alert for expiring orders (< 10 min)
  const imminentOrder = waitingAcceptanceOrders.find((o) => {
    const cd = computeOrderAcceptanceCountdown(o.acceptanceDeadlineAt, now);
    return !cd.isExpired && cd.urgency !== "normal";
  });
  if (imminentOrder) {
    const cd = computeOrderAcceptanceCountdown(imminentOrder.acceptanceDeadlineAt, now);
    alerts.push({
      id: "alert-expiring-order",
      type: "expiring_order",
      severity: cd.urgency === "critical" ? "critical" : "warning",
      titleKey: "expiringOrderTitle",
      title: "Commande en attente urgente",
      messageKey: "expiringOrderMessage",
      messageParams: { code: imminentOrder.code, mins: cd.minutesRemaining },
      message: `La commande ${imminentOrder.code} expire dans ${cd.minutesRemaining} min. Confirmez rapidement pour maintenir votre taux d'acceptation.`,
      link: `#queue-section`,
    });
  }

  // 2. Capacity threshold warning (80%)
  if (
    houseRow?.dailyCapacity &&
    todayOrdersCount >= Math.floor(houseRow.dailyCapacity * 0.8)
  ) {
    alerts.push({
      id: "alert-capacity",
      type: "capacity_warning",
      severity: "warning",
      titleKey: "capacityWarningTitle",
      title: "Capacité journalière bientôt atteinte",
      messageKey: "capacityWarningMessage",
      messageParams: {
        count: todayOrdersCount,
        total: houseRow.dailyCapacity,
        percent: Math.round((todayOrdersCount / houseRow.dailyCapacity) * 100),
      },
      message: `${todayOrdersCount} sur ${houseRow.dailyCapacity} commandes acceptées aujourd'hui (${Math.round((todayOrdersCount / houseRow.dailyCapacity) * 100)}%).`,
      link: `/partner/${houseRow.slug}/settings`,
    });
  }

  // 3. Missing opening hours
  if (hours.length === 0) {
    alerts.push({
      id: "alert-hours",
      type: "missing_hours",
      severity: "warning",
      titleKey: "missingHoursTitle",
      title: "Horaires non configurés",
      messageKey: "missingHoursMessage",
      message: "Configurez vos heures d'ouverture pour activer la protection des délais de nuit.",
      link: `/partner/${houseRow?.slug}/hours`,
    });
  }

  // 4. Unpriced catalogue items
  if (unpricedItemsCountRow?.count && unpricedItemsCountRow.count > 0) {
    alerts.push({
      id: "alert-unpriced-items",
      type: "unpriced_items",
      severity: "warning",
      titleKey: "unpricedItemsTitle",
      title: "Articles du catalogue sans tarif",
      messageKey: "unpricedItemsMessage",
      messageParams: { count: unpricedItemsCountRow.count },
      message: `${unpricedItemsCountRow.count} article(s) de votre catalogue n'ont pas encore de prix défini.`,
      link: `/partner/${houseRow?.slug}/catalogue`,
    });
  }

  // 5. House paused notice
  if (houseRow?.isPaused) {
    alerts.push({
      id: "alert-paused",
      type: "house_paused",
      severity: "info",
      titleKey: "housePausedTitle",
      title: "Réception de nouvelles commandes suspendue",
      messageKey: "housePausedMessage",
      message: "Votre pressing est temporairement en pause. Vos commandes en cours restent actives.",
    });
  }

  return {
    waitingAcceptanceCount,
    waitingAcceptanceOrders,
    missedOrders,
    missedOrdersCount,
    washingCount,
    readyCount,
    completedTodayCount,
    todayOrdersCount,
    dailyCapacity: houseRow?.dailyCapacity ?? null,
    isPaused: houseRow?.isPaused ?? false,
    pausedUntil: houseRow?.pausedUntil ?? null,
    todayNetRevenueCDF,
    yesterdayNetRevenueCDF,
    weekNetRevenueCDF,
    lastWeekNetRevenueCDF,
    balanceOwedCDF: settlementDetail.balanceOwedCDF,
    nextSettlementDate,
    acceptanceRate30d,
    acceptanceRateTrend: null,
    avgAcceptanceMinutes: null,
    onTimeDeliveryRate: null,
    dailyChart,
    recentOrders,
    upcomingPickups,
    alerts,
    house: {
      id: houseRow?.id ?? houseId,
      name: houseRow?.name ?? "Pressing Partenaire",
      slug: houseRow?.slug ?? "pressing",
      neighborhoodName: houseRow?.neighborhoodName ?? "Ndendere",
      communeName: houseRow?.communeName ?? "Ibanda",
      contactPhone: houseRow?.contactPhone ?? null,
      isPaused: houseRow?.isPaused ?? false,
      dailyCapacity: houseRow?.dailyCapacity ?? null,
      rating: null,
      coverImageUrl: null,
      logoUrl: null,
      statusPill,
    },
  };
}

/**
 * Returns the count of pending orders awaiting acceptance (status = 'created') for a house.
 */
export async function getWaitingAcceptanceCount(houseId: string): Promise<number> {
  const [row] = await db
    .select({ count: count() })
    .from(schema.orders)
    .where(and(eq(schema.orders.houseId, houseId), eq(schema.orders.status, "created")));
  return row?.count ?? 0;
}

/**
 * Atomic transaction to save reception counts and status transition (Task 4.3).
 */
export async function saveReceptionCountTransaction(params: {
  orderId: string;
  houseId: string;
  items: Array<{
    id: string;
    receivedQuantity: number;
    status: "accepted" | "returned";
  }>;
  newStatus: OrderStatus;
  adjustedItemsTotal: number;
  commissionAmount: number;
  totalDue: number;
  event: Omit<typeof schema.orderEvents.$inferInsert, "orderId">;
}): Promise<void> {
  await db.transaction(async (tx) => {
    // 1. Update order items receivedQuantity and status
    for (const item of params.items) {
      await tx
        .update(schema.orderItems)
        .set({
          receivedQuantity: item.receivedQuantity,
          status: item.status,
        })
        .where(
          and(
            eq(schema.orderItems.id, item.id),
            eq(schema.orderItems.orderId, params.orderId)
          )
        );
    }

    // 2. Update order totals, status, and reception timestamp
    await tx
      .update(schema.orders)
      .set({
        status: params.newStatus,
        adjustedItemsTotal: params.adjustedItemsTotal,
        commissionAmount: params.commissionAmount,
        totalDue: params.totalDue,
        receptionConfirmedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(schema.orders.id, params.orderId),
          eq(schema.orders.houseId, params.houseId)
        )
      );

    // 3. Insert audit event
    await tx.insert(schema.orderEvents).values({
      ...params.event,
      orderId: params.orderId,
    });
  });
}

export async function getCustomerOrders(
  customerId: string
): Promise<OrderListItemRecord[]> {
  const rows = await db
    .select({
      id: schema.orders.id,
      code: schema.orders.code,
      trackingToken: schema.orders.trackingToken,
      customerId: schema.orders.customerId,
      customerName: schema.user.name,
      customerPhone: schema.orders.contactPhone,
      houseId: schema.orders.houseId,
      houseName: schema.houses.name,
      neighborhoodId: schema.orders.neighborhoodId,
      neighborhoodName: schema.neighborhoods.name,
      status: schema.orders.status,
      source: schema.orders.source,
      totalDue: schema.orders.totalDue,
      currency: schema.orders.currency,
      itemsTotal: schema.orders.itemsTotal,
      deliveryFee: schema.orders.deliveryFee,
      commissionAmount: schema.orders.commissionAmount,
      pickupSlotStart: schema.orders.pickupSlotStart,
      pickupSlotEnd: schema.orders.pickupSlotEnd,
      createdAt: schema.orders.createdAt,
      acceptanceDeadlineAt: schema.orders.acceptanceDeadlineAt,
    })
    .from(schema.orders)
    .innerJoin(schema.user, eq(schema.orders.customerId, schema.user.id))
    .innerJoin(schema.houses, eq(schema.orders.houseId, schema.houses.id))
    .innerJoin(
      schema.neighborhoods,
      eq(schema.orders.neighborhoodId, schema.neighborhoods.id)
    )
    .where(eq(schema.orders.customerId, customerId))
    .orderBy(desc(schema.orders.createdAt));

  return rows;
}

export async function getOrderByTrackingToken(
  trackingToken: string
): Promise<OrderDetailRecord | null> {
  const [row] = await db
    .select({
      id: schema.orders.id,
      code: schema.orders.code,
      trackingToken: schema.orders.trackingToken,
      customerId: schema.orders.customerId,
      customerName: schema.user.name,
      customerPhone: schema.orders.contactPhone,
      houseId: schema.orders.houseId,
      houseName: schema.houses.name,
      neighborhoodId: schema.orders.neighborhoodId,
      neighborhoodName: schema.neighborhoods.name,
      landmark: schema.orders.landmark,
      status: schema.orders.status,
      source: schema.orders.source,
      totalDue: schema.orders.totalDue,
      currency: schema.orders.currency,
      itemsTotal: schema.orders.itemsTotal,
      deliveryFee: schema.orders.deliveryFee,
      commissionAmount: schema.orders.commissionAmount,
      commissionBps: schema.orders.commissionBps,
      paymentCurrency: schema.orders.paymentCurrency,
      exchangeRateUsed: schema.orders.exchangeRateUsed,
      deliveryConfirmationCode: schema.orders.deliveryConfirmationCode,
      notes: schema.orders.notes,
      pickupSlotStart: schema.orders.pickupSlotStart,
      pickupSlotEnd: schema.orders.pickupSlotEnd,
      deliverySlotStart: schema.orders.deliverySlotStart,
      deliverySlotEnd: schema.orders.deliverySlotEnd,
      acceptanceDeadlineAt: schema.orders.acceptanceDeadlineAt,
      createdAt: schema.orders.createdAt,
      updatedAt: schema.orders.updatedAt,
    })
    .from(schema.orders)
    .innerJoin(schema.user, eq(schema.orders.customerId, schema.user.id))
    .innerJoin(schema.houses, eq(schema.orders.houseId, schema.houses.id))
    .innerJoin(
      schema.neighborhoods,
      eq(schema.orders.neighborhoodId, schema.neighborhoods.id)
    )
    .where(eq(schema.orders.trackingToken, trackingToken))
    .limit(1);

  return row ?? null;
}

export async function updateOrderDeliverySlot(params: {
  orderId: string;
  expectedStatus?: OrderStatus;
  deliverySlotStart: Date;
  deliverySlotEnd: Date;
  newStatus?: OrderStatus;
  event: Omit<typeof schema.orderEvents.$inferInsert, "orderId">;
}): Promise<void> {
  await db.transaction(async (tx) => {
    const conditions = [eq(schema.orders.id, params.orderId)];
    if (params.expectedStatus) {
      conditions.push(eq(schema.orders.status, params.expectedStatus));
    }

    const updated = await tx
      .update(schema.orders)
      .set({
        deliverySlotStart: params.deliverySlotStart,
        deliverySlotEnd: params.deliverySlotEnd,
        ...(params.newStatus ? { status: params.newStatus } : {}),
        updatedAt: new Date(),
      })
      .where(and(...conditions))
      .returning({ id: schema.orders.id });

    if (updated.length === 0) {
      throw new Error("Conflit de concurrence: la commande a déjà changé de statut.");
    }

    await tx.insert(schema.orderEvents).values({
      ...params.event,
      orderId: params.orderId,
    });
  });
}

export async function createDisputeTransaction(params: {
  orderId: string;
  expectedStatus?: OrderStatus;
  openedBy: string;
  type: "loss" | "damage" | "payment" | "other";
  description: string;
  event: Omit<typeof schema.orderEvents.$inferInsert, "orderId">;
}): Promise<{ disputeId: string }> {
  return await db.transaction(async (tx) => {
    const conditions = [eq(schema.orders.id, params.orderId)];
    if (params.expectedStatus) {
      conditions.push(eq(schema.orders.status, params.expectedStatus));
    }

    const updated = await tx
      .update(schema.orders)
      .set({
        status: "disputed",
        updatedAt: new Date(),
      })
      .where(and(...conditions))
      .returning({ id: schema.orders.id });

    if (updated.length === 0) {
      throw new Error("Conflit de concurrence: la commande a déjà changé de statut.");
    }

    const disputeId = crypto.randomUUID();

    await tx.insert(schema.disputes).values({
      id: disputeId,
      orderId: params.orderId,
      openedBy: params.openedBy,
      type: params.type,
      description: params.description.trim(),
      status: "open",
    });

    await tx.insert(schema.orderEvents).values({
      ...params.event,
      orderId: params.orderId,
    });

    return { disputeId };
  });
}

/**
 * Retrieves pressing relance note events for the given orders.
 */
export async function getOrderRelanceEvents(
  orderIds: string[]
): Promise<RelanceEventSummary[]> {
  if (orderIds.length === 0) return [];

  const rows = await db
    .select({
      id: schema.orderEvents.id,
      orderId: schema.orderEvents.orderId,
      actorId: schema.orderEvents.actorId,
      actorName: schema.user.name,
      note: schema.orderEvents.note,
      payload: schema.orderEvents.payload,
      createdAt: schema.orderEvents.createdAt,
    })
    .from(schema.orderEvents)
    .leftJoin(schema.user, eq(schema.orderEvents.actorId, schema.user.id))
    .where(
      and(
        inArray(schema.orderEvents.orderId, orderIds),
        eq(schema.orderEvents.type, "note")
      )
    )
    .orderBy(desc(schema.orderEvents.createdAt));

  const results: RelanceEventSummary[] = [];
  for (const r of rows) {
    const payload = r.payload as Record<string, unknown> | null;
    if (payload?.category === "pressing_relance") {
      results.push({
        id: r.id,
        orderId: r.orderId,
        channel: (payload.channel as FollowUpChannel) || "call",
        outcome: (payload.outcome as FollowUpOutcome) || null,
        operatorId: r.actorId,
        operatorName: r.actorName || (payload.operatorName as string) || "Opérateur",
        createdAt: r.createdAt,
        note: r.note,
      });
    }
  }

  return results;
}

/**
 * Inserts follow-up relance event notes for orders.
 */
export async function logPressingRelance(params: {
  orderIds: string[];
  pressingId: string;
  channel: FollowUpChannel;
  operatorId: string;
  operatorName?: string;
  outcome?: FollowUpOutcome;
  note?: string;
}): Promise<void> {
  if (params.orderIds.length === 0) return;

  const orders = await db
    .select({
      id: schema.orders.id,
      houseId: schema.orders.houseId,
      status: schema.orders.status,
    })
    .from(schema.orders)
    .where(inArray(schema.orders.id, params.orderIds));

  if (orders.length !== params.orderIds.length) {
    throw new Error("Une ou plusieurs commandes sont introuvables");
  }

  const invalid = orders.find(
    (o) => o.houseId !== params.pressingId || o.status !== "created"
  );
  if (invalid) {
    throw new Error(
      "Toutes les commandes doivent appartenir au pressing indiqué et être en attente d'acceptation (statut 'created')"
    );
  }

  const channelLabel = params.channel === "call" ? "Appel téléphonique" : "WhatsApp";
  const outcomeLabel = params.outcome ? ` · Résultat: ${params.outcome}` : "";
  const noteText = params.note || `Relance pressing (${channelLabel})${outcomeLabel}`;

  const values = params.orderIds.map((orderId) => ({
    orderId,
    type: "note" as const,
    actorId: params.operatorId,
    actorRole: "admin",
    onBehalfOfHouseId: params.pressingId,
    recordedBy: params.operatorId,
    note: noteText,
    payload: {
      category: "pressing_relance",
      channel: params.channel,
      outcome: params.outcome || "pending",
      pressingId: params.pressingId,
      orderIds: params.orderIds,
      operatorName: params.operatorName,
    },
  }));

  await db.insert(schema.orderEvents).values(values);
}

/**
 * Reassigns an order awaiting acceptance to another pressing.
 */
export async function reassignOrderPressing(params: {
  orderId: string;
  newHouseId: string;
  adminId: string;
  reason?: string;
}): Promise<Result<void>> {
  try {
    const [order] = await db
      .select({
        id: schema.orders.id,
        houseId: schema.orders.houseId,
        status: schema.orders.status,
      })
      .from(schema.orders)
      .where(eq(schema.orders.id, params.orderId))
      .limit(1);

    if (!order) {
      return err("Commande introuvable");
    }

    if (order.status !== "created") {
      return err("Seules les commandes en attente d'acceptation peuvent être réassignées");
    }

    if (params.newHouseId === order.houseId) {
      return err("La commande est déjà assignée à ce pressing");
    }

    const [newHouse] = await db
      .select({
        id: schema.houses.id,
        name: schema.houses.name,
        isActive: schema.houses.isActive,
        isPaused: schema.houses.isPaused,
      })
      .from(schema.houses)
      .where(eq(schema.houses.id, params.newHouseId))
      .limit(1);

    if (!newHouse) {
      return err("Nouveau pressing partenaire introuvable");
    }

    if (!newHouse.isActive || newHouse.isPaused) {
      return err("Le pressing partenaire sélectionné n'est pas actif ou est temporairement en pause");
    }

    const newDeadline = new Date(Date.now() + 45 * 60 * 1000);

    await db.transaction(async (tx) => {
      const updated = await tx
        .update(schema.orders)
        .set({
          houseId: params.newHouseId,
          acceptanceDeadlineAt: newDeadline,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(schema.orders.id, params.orderId),
            eq(schema.orders.status, "created")
          )
        )
        .returning({ id: schema.orders.id });

      if (updated.length === 0) {
        throw new Error("La commande ne peut plus être réassignée (statut modifié)");
      }

      await tx.insert(schema.orderEvents).values({
        orderId: params.orderId,
        type: "note",
        actorId: params.adminId,
        actorRole: "admin",
        recordedBy: params.adminId,
        onBehalfOfHouseId: params.newHouseId,
        note: `Réassigné au pressing ${newHouse.name} (${params.reason || "Relances infructueuses"})`,
        payload: {
          category: "pressing_reassignment",
          previousHouseId: order.houseId,
          newHouseId: params.newHouseId,
          reason: params.reason || null,
        },
      });
    });

    return ok(undefined);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Échec de la réassignation de la commande");
  }
}

/**
 * Returns count of active (in-progress) orders grouped by houseId.
 */
export async function getActiveOrdersCountsByHouse(): Promise<Record<string, number>> {
  const activeStatuses: OrderStatus[] = [
    "awaiting_confirmation",
    "created",
    "accepted",
    "pickup_assigned",
    "pickup_in_progress",
    "picked_up",
    "received",
    "price_adjusted",
    "washing",
    "ready",
    "delivery_slot_confirmed",
    "delivery_assigned",
    "delivery_in_progress",
    "disputed",
  ];

  const rows = await db
    .select({
      houseId: schema.orders.houseId,
      count: sql<number>`count(*)::int`,
    })
    .from(schema.orders)
    .where(inArray(schema.orders.status, activeStatuses))
    .groupBy(schema.orders.houseId);

  const result: Record<string, number> = {};
  for (const row of rows) {
    if (row.houseId) {
      result[row.houseId] = Number(row.count) || 0;
    }
  }
  return result;
}


