import "server-only";
import { and, asc, desc, eq } from "drizzle-orm";
import { db, schema } from "./db";

export interface MasterServiceRecord {
  id: string;
  slug: string;
  nameFr: string;
  nameSw: string;
  sortOrder: number;
  isActive: boolean;
}

export interface MasterItemRecord {
  id: string;
  nameFr: string;
  nameSw: string;
  category: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface MasterFabricRecord {
  id: string;
  nameFr: string;
  nameSw: string;
  sortOrder: number;
  isActive: boolean;
}

export interface ItemRequestRecord {
  id: string;
  houseId: string;
  houseName?: string | null;
  requestedBy: string;
  requestedByName?: string | null;
  kind: "item" | "fabric";
  name: string;
  note: string | null;
  status: "pending" | "approved" | "rejected";
  adminNote: string | null;
  createdItemId: string | null;
  createdFabricId: string | null;
  resolvedBy: string | null;
  resolvedAt: Date | null;
  createdAt: Date;
}

export async function getMasterServices(): Promise<MasterServiceRecord[]> {
  return db
    .select()
    .from(schema.services)
    .orderBy(asc(schema.services.sortOrder), asc(schema.services.nameFr));
}

export async function createMasterService(data: {
  slug: string;
  nameFr: string;
  nameSw: string;
  sortOrder?: number;
}): Promise<MasterServiceRecord> {
  const [created] = await db
    .insert(schema.services)
    .values({
      slug: data.slug.trim().toLowerCase(),
      nameFr: data.nameFr.trim(),
      nameSw: data.nameSw.trim(),
      sortOrder: data.sortOrder ?? 0,
      isActive: true,
    })
    .returning();
  return created!;
}

export async function getMasterItems(): Promise<MasterItemRecord[]> {
  return db
    .select()
    .from(schema.items)
    .orderBy(asc(schema.items.sortOrder), asc(schema.items.nameFr));
}

export async function createMasterItem(data: {
  nameFr: string;
  nameSw: string;
  category?: string | null;
  sortOrder?: number;
}): Promise<MasterItemRecord> {
  const [created] = await db
    .insert(schema.items)
    .values({
      nameFr: data.nameFr.trim(),
      nameSw: data.nameSw.trim(),
      category: data.category?.trim() ?? null,
      sortOrder: data.sortOrder ?? 0,
      isActive: true,
    })
    .returning();
  return created!;
}

export async function updateMasterItem(
  id: string,
  data: {
    nameFr?: string;
    nameSw?: string;
    category?: string | null;
    isActive?: boolean;
    sortOrder?: number;
  }
): Promise<void> {
  await db
    .update(schema.items)
    .set({
      ...(data.nameFr ? { nameFr: data.nameFr.trim() } : {}),
      ...(data.nameSw ? { nameSw: data.nameSw.trim() } : {}),
      ...(data.category !== undefined ? { category: data.category?.trim() ?? null } : {}),
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
    })
    .where(eq(schema.items.id, id));
}

export async function getMasterFabrics(): Promise<MasterFabricRecord[]> {
  return db
    .select()
    .from(schema.fabrics)
    .orderBy(asc(schema.fabrics.sortOrder), asc(schema.fabrics.nameFr));
}

export async function createMasterFabric(data: {
  nameFr: string;
  nameSw: string;
  sortOrder?: number;
}): Promise<MasterFabricRecord> {
  const [created] = await db
    .insert(schema.fabrics)
    .values({
      nameFr: data.nameFr.trim(),
      nameSw: data.nameSw.trim(),
      sortOrder: data.sortOrder ?? 0,
      isActive: true,
    })
    .returning();
  return created!;
}

export async function updateMasterFabric(
  id: string,
  data: {
    nameFr?: string;
    nameSw?: string;
    isActive?: boolean;
    sortOrder?: number;
  }
): Promise<void> {
  await db
    .update(schema.fabrics)
    .set({
      ...(data.nameFr ? { nameFr: data.nameFr.trim() } : {}),
      ...(data.nameSw ? { nameSw: data.nameSw.trim() } : {}),
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
    })
    .where(eq(schema.fabrics.id, id));
}

export async function getItemRequests(): Promise<ItemRequestRecord[]> {
  const rows = await db
    .select({
      id: schema.itemRequests.id,
      houseId: schema.itemRequests.houseId,
      houseName: schema.houses.name,
      requestedBy: schema.itemRequests.requestedBy,
      requestedByName: schema.user.name,
      kind: schema.itemRequests.kind,
      name: schema.itemRequests.name,
      note: schema.itemRequests.note,
      status: schema.itemRequests.status,
      adminNote: schema.itemRequests.adminNote,
      createdItemId: schema.itemRequests.createdItemId,
      createdFabricId: schema.itemRequests.createdFabricId,
      resolvedBy: schema.itemRequests.resolvedBy,
      resolvedAt: schema.itemRequests.resolvedAt,
      createdAt: schema.itemRequests.createdAt,
    })
    .from(schema.itemRequests)
    .leftJoin(schema.houses, eq(schema.itemRequests.houseId, schema.houses.id))
    .leftJoin(schema.user, eq(schema.itemRequests.requestedBy, schema.user.id))
    .orderBy(desc(schema.itemRequests.createdAt));

  return rows;
}

export async function resolveItemRequest(params: {
  requestId: string;
  status: "approved" | "rejected";
  adminNote?: string;
  resolvedBy: string;
  createdItemId?: string | null;
  createdFabricId?: string | null;
}): Promise<boolean> {
  const result = await db
    .update(schema.itemRequests)
    .set({
      status: params.status,
      adminNote: params.adminNote ?? null,
      resolvedBy: params.resolvedBy,
      resolvedAt: new Date(),
      createdItemId: params.createdItemId ?? null,
      createdFabricId: params.createdFabricId ?? null,
    })
    .where(
      and(
        eq(schema.itemRequests.id, params.requestId),
        eq(schema.itemRequests.status, "pending")
      )
    )
    .returning({ id: schema.itemRequests.id });

  return result.length > 0;
}
