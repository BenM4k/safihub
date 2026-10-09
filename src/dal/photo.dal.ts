import "server-only";

import { and, eq, isNull, lte, sql } from "drizzle-orm";
import { db, schema } from "./db";
import type { OrderStatus } from "@/services/db/schema";

export interface OrderPhotoRecord {
  id: string;
  orderId: string;
  orderItemId: string | null;
  missionId: string | null;
  disputeId: string | null;
  type: "pickup_condition" | "delivery_proof" | "dispute";
  storageKey: string;
  sizeBytes: number | null;
  takenBy: string;
  createdAt: Date;
  deleteAfter: Date | null;
  deletedAt: Date | null;
}

export interface OrderAccessDetails {
  orderId: string;
  orderCode: string;
  customerId: string;
  houseId: string;
  status: OrderStatus;
  guestToken: string | null;
  activeCourierIds: string[];
  openDisputeCount: number;
}

/**
 * Retrieve all active photos for an order (not soft-deleted).
 */
export async function getOrderPhotos(orderId: string): Promise<OrderPhotoRecord[]> {
  const rows = await db
    .select({
      id: schema.orderPhotos.id,
      orderId: schema.orderPhotos.orderId,
      orderItemId: schema.orderPhotos.orderItemId,
      missionId: schema.orderPhotos.missionId,
      disputeId: schema.orderPhotos.disputeId,
      type: schema.orderPhotos.type,
      storageKey: schema.orderPhotos.storageKey,
      sizeBytes: schema.orderPhotos.sizeBytes,
      takenBy: schema.orderPhotos.takenBy,
      createdAt: schema.orderPhotos.createdAt,
      deleteAfter: schema.orderPhotos.deleteAfter,
      deletedAt: schema.orderPhotos.deletedAt,
    })
    .from(schema.orderPhotos)
    .where(
      and(
        eq(schema.orderPhotos.orderId, orderId),
        isNull(schema.orderPhotos.deletedAt)
      )
    )
    .orderBy(schema.orderPhotos.createdAt);

  return rows as OrderPhotoRecord[];
}

/**
 * Retrieve a single photo record by ID.
 */
export async function getOrderPhotoById(
  photoId: string
): Promise<OrderPhotoRecord | null> {
  const [row] = await db
    .select({
      id: schema.orderPhotos.id,
      orderId: schema.orderPhotos.orderId,
      orderItemId: schema.orderPhotos.orderItemId,
      missionId: schema.orderPhotos.missionId,
      disputeId: schema.orderPhotos.disputeId,
      type: schema.orderPhotos.type,
      storageKey: schema.orderPhotos.storageKey,
      sizeBytes: schema.orderPhotos.sizeBytes,
      takenBy: schema.orderPhotos.takenBy,
      createdAt: schema.orderPhotos.createdAt,
      deleteAfter: schema.orderPhotos.deleteAfter,
      deletedAt: schema.orderPhotos.deletedAt,
    })
    .from(schema.orderPhotos)
    .where(eq(schema.orderPhotos.id, photoId))
    .limit(1);

  return (row as OrderPhotoRecord) || null;
}

/**
 * Count active photos for an order to enforce limits (Task 7.2: max 20 per order).
 */
export async function countPhotosForOrder(orderId: string): Promise<number> {
  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.orderPhotos)
    .where(
      and(
        eq(schema.orderPhotos.orderId, orderId),
        isNull(schema.orderPhotos.deletedAt)
      )
    );

  return result?.count ?? 0;
}

/**
 * Count active photos for a specific item to enforce limits (Task 7.2: max 3 per item).
 */
export async function countPhotosForItem(orderItemId: string): Promise<number> {
  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.orderPhotos)
    .where(
      and(
        eq(schema.orderPhotos.orderItemId, orderItemId),
        isNull(schema.orderPhotos.deletedAt)
      )
    );

  return result?.count ?? 0;
}

/**
 * Insert a new order photo record.
 */
export async function insertOrderPhotoRecord(params: {
  orderId: string;
  orderItemId?: string | null;
  missionId?: string | null;
  disputeId?: string | null;
  type: "pickup_condition" | "delivery_proof" | "dispute";
  storageKey: string;
  sizeBytes?: number | null;
  takenBy: string;
  deleteAfter?: Date | null;
}): Promise<string> {
  const [inserted] = await db
    .insert(schema.orderPhotos)
    .values({
      orderId: params.orderId,
      orderItemId: params.orderItemId ?? null,
      missionId: params.missionId ?? null,
      disputeId: params.disputeId ?? null,
      type: params.type,
      storageKey: params.storageKey,
      sizeBytes: params.sizeBytes ?? null,
      takenBy: params.takenBy,
      deleteAfter: params.deleteAfter ?? null,
    })
    .returning({ id: schema.orderPhotos.id });

  if (!inserted) {
    throw new Error("Failed to insert order photo record");
  }

  return inserted.id;
}

/**
 * Query orders access details for authorization checks.
 */
export async function getOrderAccessDetails(
  orderId: string
): Promise<OrderAccessDetails | null> {
  const [order] = await db
    .select({
      id: schema.orders.id,
      code: schema.orders.code,
      customerId: schema.orders.customerId,
      houseId: schema.orders.houseId,
      status: schema.orders.status,
      guestToken: schema.orders.trackingToken,
    })
    .from(schema.orders)
    .where(eq(schema.orders.id, orderId))
    .limit(1);

  if (!order) return null;

  // Find couriers currently or previously assigned to missions for this order
  const missionRows = await db
    .select({ courierId: schema.missions.courierId })
    .from(schema.missions)
    .where(eq(schema.missions.orderId, orderId));

  const activeCourierIds = missionRows
    .map((m) => m.courierId)
    .filter((id): id is string => Boolean(id));

  // Count open disputes
  const [disputeCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.disputes)
    .where(
      and(
        eq(schema.disputes.orderId, orderId),
        eq(schema.disputes.status, "open")
      )
    );

  return {
    orderId: order.id,
    orderCode: order.code,
    customerId: order.customerId,
    houseId: order.houseId,
    status: order.status as OrderStatus,
    guestToken: order.guestToken,
    activeCourierIds,
    openDisputeCount: disputeCount?.count ?? 0,
  };
}

/**
 * Query expired photos eligible for retention pruning (Task 7.4).
 * Returns photos where deleteAfter <= now and not yet deleted.
 */
export async function getExpiredPhotosForPruning(
  now: Date,
  limit: number = 100
): Promise<Array<{ id: string; storageKey: string; orderId: string }>> {
  const rows = await db
    .select({
      id: schema.orderPhotos.id,
      storageKey: schema.orderPhotos.storageKey,
      orderId: schema.orderPhotos.orderId,
    })
    .from(schema.orderPhotos)
    .where(
      and(
        lte(schema.orderPhotos.deleteAfter, now),
        isNull(schema.orderPhotos.deletedAt)
      )
    )
    .limit(limit);

  return rows;
}

/**
 * Soft-delete photo records after R2 object deletion (Task 7.4).
 */
export async function markPhotosDeletedAtomic(
  photoIds: string[],
  deletedAt: Date = new Date()
): Promise<number> {
  if (photoIds.length === 0) return 0;

  const res = await db
    .update(schema.orderPhotos)
    .set({ deletedAt })
    .where(sql`${schema.orderPhotos.id} = ANY(${photoIds})`);

  return res.rowCount ?? photoIds.length;
}
