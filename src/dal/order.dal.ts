import "server-only";
import { and, asc, count, desc, eq, gte, ilike, inArray, ne, or, sql } from "drizzle-orm";
import { db, schema } from "./db";
import { toBukavuDateTime, fromBukavuDateTime } from "@/services/availability/bukavu-time";
import { ok, err, type Result } from "@/lib/result";
import type { ApprovalMethod, OrderSource, OrderStatus } from "@/services/db/schema";
import type { orderEventTypeEnum } from "@/services/db/schema";

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
    .orderBy(desc(schema.orders.createdAt))
    .limit(filters?.limit ?? 50)
    .offset(filters?.offset ?? 0);

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
  currency: "CDF" | "USD";
  pickupSlotStart: Date;
  pickupSlotEnd: Date;
  deliverySlotStart: Date | null;
  deliverySlotEnd: Date | null;
  estimatedDeliveryAt: Date | null;
  acceptanceDeadlineAt: Date | null;
  receptionDeadlineAt: Date | null;
  createdAt: Date;
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
    .orderBy(desc(schema.orders.createdAt))
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

export interface HouseDashboardMetrics {
  waitingAcceptanceCount: number;
  waitingAcceptanceOrders: HouseOrderListItemRecord[];
  washingCount: number;
  readyCount: number;
  completedTodayCount: number;
  todayOrdersCount: number;
  dailyCapacity: number | null;
  isPaused: boolean;
}

/**
 * Computes workload metrics for the house dashboard (Task 4.1).
 */
export async function getHouseDashboardMetrics(
  houseId: string
): Promise<HouseDashboardMetrics> {
  const [houseRow] = await db
    .select({
      dailyCapacity: schema.houses.dailyCapacity,
      isPaused: schema.houses.isPaused,
    })
    .from(schema.houses)
    .where(eq(schema.houses.id, houseId))
    .limit(1);

  const bukavuNow = toBukavuDateTime(new Date());
  const startOfDay = fromBukavuDateTime(bukavuNow.dateString, "00:00");

  const [
    waitingAcceptanceOrders,
    statusCounts,
    [completedTodayRow],
    [todayOrdersRow],
  ] = await Promise.all([
    getHouseOrdersRestricted(houseId, { status: "created", limit: 50 }),
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
  ]);

  const countsByStatus = new Map(statusCounts.map((r) => [r.status, r.count]));

  const waitingAcceptanceCount = countsByStatus.get("created") ?? 0;
  const washingCount =
    (countsByStatus.get("received") ?? 0) +
    (countsByStatus.get("price_adjusted") ?? 0) +
    (countsByStatus.get("washing") ?? 0);
  const readyCount = countsByStatus.get("ready") ?? 0;
  const completedTodayCount = completedTodayRow?.count ?? 0;
  const todayOrdersCount = todayOrdersRow?.count ?? 0;

  return {
    waitingAcceptanceCount,
    waitingAcceptanceOrders,
    washingCount,
    readyCount,
    completedTodayCount,
    todayOrdersCount,
    dailyCapacity: houseRow?.dailyCapacity ?? null,
    isPaused: houseRow?.isPaused ?? false,
  };
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

