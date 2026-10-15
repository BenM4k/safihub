import "server-only";

import { and, desc, eq, inArray, or, sql } from "drizzle-orm";
import { db, schema } from "./db";
import type { OrderStatus } from "@/services/db/schema";
import { formatPhone, formatOrderReference } from "@/lib/order-formatters";
import { computeNetRevenue } from "@/lib/partner-dashboard";

export type PartnerOrderTab =
  | "to_accept"
  | "to_collect"
  | "in_treatment"
  | "ready"
  | "delivered"
  | "failed";

export const TAB_STATUS_MAP: Record<PartnerOrderTab, OrderStatus[]> = {
  to_accept: ["created"],
  to_collect: ["accepted", "pickup_assigned", "pickup_in_progress", "picked_up"],
  in_treatment: ["received", "price_adjusted", "washing"],
  ready: ["ready", "delivery_slot_confirmed", "delivery_assigned", "delivery_in_progress"],
  delivered: ["delivered"],
  failed: [
    "rejected",
    "expired",
    "cancelled",
    "pickup_failed",
    "price_declined",
    "delivery_failed",
    "disputed",
  ],
};

export interface PartnerOrderListItemDTO {
  id: string;
  code: string;
  shortReference: string;
  status: OrderStatus;
  customerFirstName: string;
  customerDisplayName: string;
  customerPhone: string | null;
  neighborhoodName: string;
  itemsCount: number;
  itemsSummary: string;
  services: string[];
  pickupSlotStart: Date;
  pickupSlotEnd: Date;
  deliverySlotStart: Date | null;
  deliverySlotEnd: Date | null;
  estimatedDeliveryAt: Date | null;
  acceptanceDeadlineAt: Date | null;
  isAtRisk: boolean;
  totalDue: number;
  itemsTotal: number;
  commissionAmount: number;
  commissionBps: number;
  netPartnerShare: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PartnerOrderTabCounts {
  to_accept: number;
  to_collect: number;
  in_treatment: number;
  ready: number;
  delivered: number;
  failed: number;
  total: number;
}

export interface PartnerOrderQueryFilters {
  tab?: PartnerOrderTab;
  search?: string;
  date?: string;
  sort?: "deadline" | "promised" | "recent";
  limit?: number;
  offset?: number;
}

/**
 * Lists partner-scoped orders strictly isolated to houseId.
 * Never includes admin notes, platform margins, or unauthorized client contact details.
 */
export async function getPartnerOrdersRestricted(
  houseId: string,
  filters: PartnerOrderQueryFilters = {}
): Promise<PartnerOrderListItemDTO[]> {
  const conditions = [eq(schema.orders.houseId, houseId)];

  if (filters.tab && TAB_STATUS_MAP[filters.tab]) {
    conditions.push(inArray(schema.orders.status, TAB_STATUS_MAP[filters.tab]));
  }

  if (filters.search && filters.search.trim().length > 0) {
    const q = `%${filters.search.trim()}%`;
    conditions.push(
      or(
        sql`${schema.orders.code} ILIKE ${q}`,
        sql`${schema.user.name} ILIKE ${q}`,
        sql`${schema.neighborhoods.name} ILIKE ${q}`
      )!
    );
  }

  if (filters.date) {
    // Format YYYY-MM-DD
    const dayStart = new Date(`${filters.date}T00:00:00.000Z`);
    const dayEnd = new Date(`${filters.date}T23:59:59.999Z`);
    if (!isNaN(dayStart.getTime()) && !isNaN(dayEnd.getTime())) {
      conditions.push(
        and(
          sql`${schema.orders.createdAt} >= ${dayStart}`,
          sql`${schema.orders.createdAt} <= ${dayEnd}`
        )!
      );
    }
  }

  // Sorting
  const orderExpressions = [];
  if (filters.sort === "deadline") {
    orderExpressions.push(
      sql`${schema.orders.acceptanceDeadlineAt} ASC NULLS LAST`,
      desc(schema.orders.createdAt)
    );
  } else if (filters.sort === "promised") {
    orderExpressions.push(
      sql`${schema.orders.estimatedDeliveryAt} ASC NULLS LAST`,
      desc(schema.orders.createdAt)
    );
  } else {
    orderExpressions.push(desc(schema.orders.createdAt));
  }

  const rows = await db
    .select({
      id: schema.orders.id,
      code: schema.orders.code,
      status: schema.orders.status,
      customerRawName: schema.user.name,
      contactPhone: schema.orders.contactPhone,
      neighborhoodName: schema.neighborhoods.name,
      totalDue: schema.orders.totalDue,
      itemsTotal: schema.orders.itemsTotal,
      adjustedItemsTotal: schema.orders.adjustedItemsTotal,
      commissionAmount: schema.orders.commissionAmount,
      commissionBps: schema.orders.commissionBps,
      currency: schema.orders.currency,
      pickupSlotStart: schema.orders.pickupSlotStart,
      pickupSlotEnd: schema.orders.pickupSlotEnd,
      deliverySlotStart: schema.orders.deliverySlotStart,
      deliverySlotEnd: schema.orders.deliverySlotEnd,
      estimatedDeliveryAt: schema.orders.estimatedDeliveryAt,
      acceptanceDeadlineAt: schema.orders.acceptanceDeadlineAt,
      createdAt: schema.orders.createdAt,
      updatedAt: schema.orders.updatedAt,
    })
    .from(schema.orders)
    .innerJoin(schema.user, eq(schema.orders.customerId, schema.user.id))
    .innerJoin(
      schema.neighborhoods,
      eq(schema.orders.neighborhoodId, schema.neighborhoods.id)
    )
    .where(and(...conditions))
    .orderBy(...orderExpressions)
    .limit(filters.limit ?? 50)
    .offset(filters.offset ?? 0);

  if (rows.length === 0) {
    return [];
  }

  // Fetch items and services for these orders
  const orderIds = rows.map((r) => r.id);
  const items = await db
    .select({
      orderId: schema.orderItems.orderId,
      declaredQuantity: schema.orderItems.declaredQuantity,
      receivedQuantity: schema.orderItems.receivedQuantity,
      customLabel: schema.orderItems.customLabel,
      itemNameFr: schema.items.nameFr,
      serviceNameFr: schema.services.nameFr,
    })
    .from(schema.orderItems)
    .leftJoin(schema.items, eq(schema.orderItems.itemId, schema.items.id))
    .leftJoin(schema.services, eq(schema.orderItems.serviceId, schema.services.id))
    .where(inArray(schema.orderItems.orderId, orderIds));

  // Group items by orderId
  const itemsByOrder = new Map<string, typeof items>();
  for (const it of items) {
    const list = itemsByOrder.get(it.orderId) ?? [];
    list.push(it);
    itemsByOrder.set(it.orderId, list);
  }

  const now = new Date();

  return rows.map((r) => {
    const orderItemsList = itemsByOrder.get(r.id) ?? [];
    const totalQty = orderItemsList.reduce(
      (sum, item) => sum + (item.receivedQuantity ?? item.declaredQuantity),
      0
    );

    // Build items summary: e.g. "2 Chemises, 1 Costume"
    const summaryParts = orderItemsList
      .slice(0, 3)
      .map((it) => `${it.declaredQuantity} ${it.itemNameFr || it.customLabel || "Article"}`);
    if (orderItemsList.length > 3) {
      const extraCount = orderItemsList
        .slice(3)
        .reduce((sum, it) => sum + it.declaredQuantity, 0);
      summaryParts.push(`+${extraCount} autre(s)`);
    }
    const itemsSummary = summaryParts.length > 0 ? summaryParts.join(", ") : "—";

    // Unique services
    const servicesSet = new Set<string>();
    for (const it of orderItemsList) {
      if (it.serviceNameFr) servicesSet.add(it.serviceNameFr);
    }
    const services = servicesSet.size > 0 ? Array.from(servicesSet) : ["Lavage"];

    // Customer privacy:
    // Before acceptance ('created'): first name + initial only, phone hidden
    // After acceptance: full name, phone shown
    const rawName = (r.customerRawName ?? "").trim();
    const nameParts = rawName.split(" ").filter(Boolean);
    const firstName = nameParts[0] || "Client";
    const lastInitial = nameParts.length > 1 ? ` ${nameParts[1][0]}.` : "";
    const customerDisplayName =
      r.status === "created" ? `${firstName}${lastInitial}` : rawName || "Client";
    const customerPhone = r.status === "created" ? null : formatPhone(r.contactPhone);

    // Net partner share
    const netPartnerShare = computeNetRevenue(
      r.adjustedItemsTotal ?? r.itemsTotal,
      r.commissionAmount
    );

    // At risk indicator: active order whose promised delivery is within 3 hours or passed
    const isTerminal = ["delivered", "rejected", "expired", "cancelled"].includes(
      r.status
    );
    const promisedMs = r.estimatedDeliveryAt ? new Date(r.estimatedDeliveryAt).getTime() : null;
    const isAtRisk =
      !isTerminal &&
      promisedMs !== null &&
      promisedMs - now.getTime() < 3 * 60 * 60 * 1000;

    return {
      id: r.id,
      code: r.code,
      shortReference: formatOrderReference(r.code, r.id),
      status: r.status,
      customerFirstName: firstName,
      customerDisplayName,
      customerPhone,
      neighborhoodName: r.neighborhoodName ?? "Bukavu",
      itemsCount: totalQty,
      itemsSummary,
      services,
      pickupSlotStart: r.pickupSlotStart,
      pickupSlotEnd: r.pickupSlotEnd,
      deliverySlotStart: r.deliverySlotStart,
      deliverySlotEnd: r.deliverySlotEnd,
      estimatedDeliveryAt: r.estimatedDeliveryAt,
      acceptanceDeadlineAt: r.acceptanceDeadlineAt,
      isAtRisk,
      totalDue: r.totalDue,
      itemsTotal: r.itemsTotal,
      commissionAmount: r.commissionAmount,
      commissionBps: r.commissionBps,
      netPartnerShare,
      currency: r.currency,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  });
}

/**
 * Returns stage tab badge counts for the specified house.
 */
export async function getPartnerOrderTabCountsRestricted(
  houseId: string
): Promise<PartnerOrderTabCounts> {
  const result: PartnerOrderTabCounts = {
    to_accept: 0,
    to_collect: 0,
    in_treatment: 0,
    ready: 0,
    delivered: 0,
    failed: 0,
    total: 0,
  };

  const rows = await db
    .select({
      status: schema.orders.status,
      count: sql<number>`count(*)::int`,
    })
    .from(schema.orders)
    .where(eq(schema.orders.houseId, houseId))
    .groupBy(schema.orders.status);

  for (const r of rows) {
    result.total += r.count;
    if (TAB_STATUS_MAP.to_accept.includes(r.status)) {
      result.to_accept += r.count;
    } else if (TAB_STATUS_MAP.to_collect.includes(r.status)) {
      result.to_collect += r.count;
    } else if (TAB_STATUS_MAP.in_treatment.includes(r.status)) {
      result.in_treatment += r.count;
    } else if (TAB_STATUS_MAP.ready.includes(r.status)) {
      result.ready += r.count;
    } else if (TAB_STATUS_MAP.delivered.includes(r.status)) {
      result.delivered += r.count;
    } else if (TAB_STATUS_MAP.failed.includes(r.status)) {
      result.failed += r.count;
    }
  }

  return result;
}

/**
 * Records courier handover event for ready order.
 */
export async function recordPartnerOrderHandover(params: {
  orderId: string;
  houseId: string;
  actorId: string;
  actorRole: "house" | "admin";
  note?: string;
}): Promise<boolean> {
  const [order] = await db
    .select({ id: schema.orders.id, status: schema.orders.status })
    .from(schema.orders)
    .where(
      and(
        eq(schema.orders.id, params.orderId),
        eq(schema.orders.houseId, params.houseId)
      )
    )
    .limit(1);

  if (!order) return false;

  await db.insert(schema.orderEvents).values({
    orderId: params.orderId,
    type: "assignment",
    actorId: params.actorId,
    actorRole: params.actorRole,
    onBehalfOfHouseId: params.houseId,
    note: params.note || "Linge propre remis au coursier pour livraison",
    payload: {
      category: "courier_handover",
      timestamp: new Date().toISOString(),
    },
  });

  return true;
}

/**
 * Reports a problem/dispute on an order by partner.
 */
export async function reportPartnerOrderIssue(params: {
  orderId: string;
  houseId: string;
  actorId: string;
  actorRole: "house" | "admin";
  reason: string;
  note?: string;
}): Promise<boolean> {
  const [order] = await db
    .select({ id: schema.orders.id, status: schema.orders.status })
    .from(schema.orders)
    .where(
      and(
        eq(schema.orders.id, params.orderId),
        eq(schema.orders.houseId, params.houseId)
      )
    )
    .limit(1);

  if (!order) return false;

  await db.insert(schema.orderEvents).values({
    orderId: params.orderId,
    type: "note",
    actorId: params.actorId,
    actorRole: params.actorRole,
    onBehalfOfHouseId: params.houseId,
    note: `Signalement problème atelier : ${params.reason}${params.note ? ` - ${params.note}` : ""}`,
    payload: {
      category: "house_issue_flag",
      reason: params.reason,
      details: params.note || null,
      timestamp: new Date().toISOString(),
    },
  });

  return true;
}
