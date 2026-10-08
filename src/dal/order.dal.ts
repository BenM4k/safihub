import "server-only";
import { and, asc, desc, eq, ilike, or } from "drizzle-orm";
import { db, schema } from "./db";
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
}

export async function getOrderValidationData(scope?: {
  houseId?: string;
  customerId?: string;
  idempotencyKey?: string;
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

  const [
    existingOrders,
    houseItems,
    houseHours,
    houseClosures,
    houseCoverage,
    courierShifts,
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
  ]);

  return {
    existingOrders,
    houseItems,
    houseHours,
    houseClosures,
    houseCoverage,
    courierShifts,
  };
}
