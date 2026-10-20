import "server-only";
import { and, asc, desc, eq, gte, inArray, lte, notInArray, or, sql } from "drizzle-orm";
import { db, schema } from "./db";
import { generateUniqueSlug } from "@/lib/slug";
import { toBukavuDateTime } from "@/services/availability";
import { err, ok, type Result } from "@/lib/result";

export interface HouseMembershipInfo {
  houseId: string;
  userId: string;
  houseName: string;
  houseSlug: string;
  isActive: boolean;
  isPaused: boolean;
}

export interface HouseRecord {
  id: string;
  name: string;
  slug: string;
  neighborhoodId: string;
  neighborhoodName?: string | null;
  addressNote: string | null;
  contactPhone: string | null;
  commissionBps: number | null;
  minimumOrderAmount: number;
  cutoffMinutes: number;
  turnaroundHours: number;
  dailyCapacity: number | null;
  maxDistanceLevel: number | null;
  isOwnerHouse: boolean;
  isActive: boolean;
  isPaused: boolean;
  pausedUntil: Date | null;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface HouseHourRecord {
  id: string;
  houseId: string;
  weekday: number;
  opensAt: string;
  closesAt: string;
}

export interface HouseClosureRecord {
  id: string;
  houseId: string;
  startsOn: string;
  endsOn: string;
  reason: string | null;
  createdAt: Date;
}

export interface HouseExclusionRecord {
  id: string;
  houseId: string;
  itemId: string | null;
  itemNameFr?: string | null;
  fabricId: string | null;
  fabricNameFr?: string | null;
  note: string | null;
}

export interface HouseCoverageRecord {
  id: string;
  houseId: string;
  neighborhoodId: string;
  neighborhoodName?: string | null;
  isActive: boolean;
  pausedUntil: Date | null;
}

export interface HouseStaffMemberRecord {
  houseId: string;
  userId: string;
  name: string;
  email: string;
  role: string | null;
  createdAt: Date;
}

export async function getUserHouseMemberships(
  userId: string
): Promise<HouseMembershipInfo[]> {
  const rows = await db
    .select({
      houseId: schema.houseMembers.houseId,
      userId: schema.houseMembers.userId,
      houseName: schema.houses.name,
      houseSlug: schema.houses.slug,
      isActive: schema.houses.isActive,
      isPaused: schema.houses.isPaused,
    })
    .from(schema.houseMembers)
    .innerJoin(schema.houses, eq(schema.houseMembers.houseId, schema.houses.id))
    .where(eq(schema.houseMembers.userId, userId));

  return rows;
}

export async function checkUserHouseAccess(
  userId: string,
  houseIdOrSlug: string
): Promise<boolean> {
  const [membership] = await db
    .select({ houseId: schema.houseMembers.houseId })
    .from(schema.houseMembers)
    .innerJoin(schema.houses, eq(schema.houseMembers.houseId, schema.houses.id))
    .where(
      and(
        eq(schema.houseMembers.userId, userId),
        or(
          eq(schema.houseMembers.houseId, houseIdOrSlug),
          eq(schema.houses.slug, houseIdOrSlug)
        )
      )
    )
    .limit(1);

  return !!membership;
}

export async function addHouseMember({
  houseId,
  userId,
}: {
  houseId: string;
  userId: string;
}): Promise<void> {
  await db
    .insert(schema.houseMembers)
    .values({
      houseId,
      userId,
    })
    .onConflictDoNothing();
}

export async function removeHouseMember({
  houseId,
  userId,
}: {
  houseId: string;
  userId: string;
}): Promise<void> {
  await db
    .delete(schema.houseMembers)
    .where(
      and(
        eq(schema.houseMembers.houseId, houseId),
        eq(schema.houseMembers.userId, userId)
      )
    );
}

export async function getHouseStaff(houseId: string): Promise<HouseStaffMemberRecord[]> {
  const rows = await db
    .select({
      houseId: schema.houseMembers.houseId,
      userId: schema.houseMembers.userId,
      name: schema.user.name,
      email: schema.user.email,
      role: schema.user.role,
      createdAt: schema.houseMembers.createdAt,
    })
    .from(schema.houseMembers)
    .innerJoin(schema.user, eq(schema.houseMembers.userId, schema.user.id))
    .where(eq(schema.houseMembers.houseId, houseId));

  return rows;
}

export async function getHouses(): Promise<HouseRecord[]> {
  const rows = await db
    .select({
      id: schema.houses.id,
      name: schema.houses.name,
      slug: schema.houses.slug,
      neighborhoodId: schema.houses.neighborhoodId,
      neighborhoodName: schema.neighborhoods.name,
      addressNote: schema.houses.addressNote,
      contactPhone: schema.houses.contactPhone,
      commissionBps: schema.houses.commissionBps,
      minimumOrderAmount: schema.houses.minimumOrderAmount,
      cutoffMinutes: schema.houses.cutoffMinutes,
      turnaroundHours: schema.houses.turnaroundHours,
      dailyCapacity: schema.houses.dailyCapacity,
      maxDistanceLevel: schema.houses.maxDistanceLevel,
      isOwnerHouse: schema.houses.isOwnerHouse,
      isActive: schema.houses.isActive,
      isPaused: schema.houses.isPaused,
      pausedUntil: schema.houses.pausedUntil,
      createdAt: schema.houses.createdAt,
      updatedAt: schema.houses.updatedAt,
    })
    .from(schema.houses)
    .leftJoin(
      schema.neighborhoods,
      eq(schema.houses.neighborhoodId, schema.neighborhoods.id)
    )
    .orderBy(asc(schema.houses.name));

  return rows;
}

export async function getHouseById(id: string): Promise<HouseRecord | null> {
  const [row] = await db
    .select({
      id: schema.houses.id,
      name: schema.houses.name,
      slug: schema.houses.slug,
      neighborhoodId: schema.houses.neighborhoodId,
      neighborhoodName: schema.neighborhoods.name,
      addressNote: schema.houses.addressNote,
      contactPhone: schema.houses.contactPhone,
      commissionBps: schema.houses.commissionBps,
      minimumOrderAmount: schema.houses.minimumOrderAmount,
      cutoffMinutes: schema.houses.cutoffMinutes,
      turnaroundHours: schema.houses.turnaroundHours,
      dailyCapacity: schema.houses.dailyCapacity,
      maxDistanceLevel: schema.houses.maxDistanceLevel,
      isOwnerHouse: schema.houses.isOwnerHouse,
      isActive: schema.houses.isActive,
      isPaused: schema.houses.isPaused,
      pausedUntil: schema.houses.pausedUntil,
      createdAt: schema.houses.createdAt,
      updatedAt: schema.houses.updatedAt,
    })
    .from(schema.houses)
    .leftJoin(
      schema.neighborhoods,
      eq(schema.houses.neighborhoodId, schema.neighborhoods.id)
    )
    .where(eq(schema.houses.id, id))
    .limit(1);

  return row ?? null;
}

export async function getHouseBySlug(
  slug: string
): Promise<HouseRecord | null> {
  const [row] = await db
    .select({
      id: schema.houses.id,
      name: schema.houses.name,
      slug: schema.houses.slug,
      neighborhoodId: schema.houses.neighborhoodId,
      neighborhoodName: schema.neighborhoods.name,
      addressNote: schema.houses.addressNote,
      contactPhone: schema.houses.contactPhone,
      commissionBps: schema.houses.commissionBps,
      minimumOrderAmount: schema.houses.minimumOrderAmount,
      cutoffMinutes: schema.houses.cutoffMinutes,
      turnaroundHours: schema.houses.turnaroundHours,
      dailyCapacity: schema.houses.dailyCapacity,
      maxDistanceLevel: schema.houses.maxDistanceLevel,
      isOwnerHouse: schema.houses.isOwnerHouse,
      isActive: schema.houses.isActive,
      isPaused: schema.houses.isPaused,
      pausedUntil: schema.houses.pausedUntil,
      createdAt: schema.houses.createdAt,
      updatedAt: schema.houses.updatedAt,
    })
    .from(schema.houses)
    .leftJoin(
      schema.neighborhoods,
      eq(schema.houses.neighborhoodId, schema.neighborhoods.id)
    )
    .where(eq(schema.houses.slug, slug))
    .limit(1);

  return row ?? null;
}

export async function createHouse(data: {
  name: string;
  slug?: string;
  neighborhoodId: string;
  addressNote?: string | null;
  contactPhone?: string | null;
  commissionBps?: number | null;
  minimumOrderAmount?: number;
  cutoffMinutes?: number;
  turnaroundHours?: number;
  dailyCapacity?: number | null;
  maxDistanceLevel?: number | null;
  isOwnerHouse?: boolean;
  isActive?: boolean;
}): Promise<HouseRecord> {
  const isSlugTaken = async (candidate: string) => {
    const [existing] = await db
      .select({ id: schema.houses.id })
      .from(schema.houses)
      .where(eq(schema.houses.slug, candidate))
      .limit(1);
    return Boolean(existing);
  };

  const rawBase = data.slug?.trim() || data.name.trim();
  const finalSlug = await generateUniqueSlug(rawBase, isSlugTaken);

  const [created] = await db
    .insert(schema.houses)
    .values({
      name: data.name.trim(),
      slug: finalSlug,
      neighborhoodId: data.neighborhoodId,
      addressNote: data.addressNote ?? null,
      contactPhone: data.contactPhone ?? null,
      commissionBps: data.commissionBps ?? null,
      minimumOrderAmount: data.minimumOrderAmount ?? 0,
      cutoffMinutes: data.cutoffMinutes ?? 120,
      turnaroundHours: data.turnaroundHours ?? 48,
      dailyCapacity: data.dailyCapacity ?? null,
      maxDistanceLevel: data.maxDistanceLevel ?? null,
      isOwnerHouse: data.isOwnerHouse ?? false,
      isActive: data.isActive ?? true,
      isPaused: false,
    })
    .returning();

  return created!;
}

export async function updateHouse(
  id: string,
  data: Partial<{
    name: string;
    slug: string;
    neighborhoodId: string;
    addressNote: string | null;
    contactPhone: string | null;
    commissionBps: number | null;
    minimumOrderAmount: number;
    cutoffMinutes: number;
    turnaroundHours: number;
    dailyCapacity: number | null;
    maxDistanceLevel: number | null;
    isOwnerHouse: boolean;
    isActive: boolean;
    isPaused: boolean;
    pausedUntil: Date | null;
  }>
): Promise<void> {
  await db
    .update(schema.houses)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(schema.houses.id, id));
}

export async function getHouseHours(houseId: string): Promise<HouseHourRecord[]> {
  return db
    .select()
    .from(schema.houseHours)
    .where(eq(schema.houseHours.houseId, houseId))
    .orderBy(asc(schema.houseHours.weekday), asc(schema.houseHours.opensAt));
}

export async function setHouseHours(
  houseId: string,
  hours: Array<{ weekday: number; opensAt: string; closesAt: string }>
): Promise<void> {
  await db.delete(schema.houseHours).where(eq(schema.houseHours.houseId, houseId));
  if (hours.length > 0) {
    await db.insert(schema.houseHours).values(
      hours.map((h) => ({
        houseId,
        weekday: h.weekday,
        opensAt: h.opensAt,
        closesAt: h.closesAt,
      }))
    );
  }
}

export async function getHouseClosures(houseId: string): Promise<HouseClosureRecord[]> {
  return db
    .select()
    .from(schema.houseClosures)
    .where(eq(schema.houseClosures.houseId, houseId))
    .orderBy(asc(schema.houseClosures.startsOn));
}

export async function createHouseClosure(data: {
  houseId: string;
  startsOn: string;
  endsOn: string;
  reason?: string | null;
}): Promise<void> {
  await db.insert(schema.houseClosures).values({
    houseId: data.houseId,
    startsOn: data.startsOn,
    endsOn: data.endsOn,
    reason: data.reason ?? null,
  });
}

export async function deleteHouseClosure(id: string, houseId?: string): Promise<boolean> {
  const conditions = [eq(schema.houseClosures.id, id)];
  if (houseId) {
    conditions.push(eq(schema.houseClosures.houseId, houseId));
  }
  const result = await db
    .delete(schema.houseClosures)
    .where(and(...conditions))
    .returning({ id: schema.houseClosures.id });
  return result.length > 0;
}

export async function updateHouseClosure(
  id: string,
  houseId: string,
  data: {
    startsOn: string;
    endsOn: string;
    reason?: string | null;
  }
): Promise<boolean> {
  const result = await db
    .update(schema.houseClosures)
    .set({
      startsOn: data.startsOn,
      endsOn: data.endsOn,
      reason: data.reason ?? null,
    })
    .where(
      and(
        eq(schema.houseClosures.id, id),
        eq(schema.houseClosures.houseId, houseId)
      )
    )
    .returning({ id: schema.houseClosures.id });
  return result.length > 0;
}

export async function createHouseClosuresBatch(
  houseId: string,
  closures: Array<{
    startsOn: string;
    endsOn: string;
    reason?: string | null;
  }>
): Promise<number> {
  if (closures.length === 0) return 0;
  const inserted = await db
    .insert(schema.houseClosures)
    .values(
      closures.map((c) => ({
        houseId,
        startsOn: c.startsOn,
        endsOn: c.endsOn,
        reason: c.reason ?? null,
      }))
    )
    .returning({ id: schema.houseClosures.id });
  return inserted.length;
}

export async function getHouseExclusions(houseId: string): Promise<HouseExclusionRecord[]> {
  const rows = await db
    .select({
      id: schema.houseExclusions.id,
      houseId: schema.houseExclusions.houseId,
      itemId: schema.houseExclusions.itemId,
      itemNameFr: schema.items.nameFr,
      fabricId: schema.houseExclusions.fabricId,
      fabricNameFr: schema.fabrics.nameFr,
      note: schema.houseExclusions.note,
    })
    .from(schema.houseExclusions)
    .leftJoin(schema.items, eq(schema.houseExclusions.itemId, schema.items.id))
    .leftJoin(schema.fabrics, eq(schema.houseExclusions.fabricId, schema.fabrics.id))
    .where(eq(schema.houseExclusions.houseId, houseId));

  return rows;
}

export async function createHouseExclusion(data: {
  houseId: string;
  itemId?: string | null;
  fabricId?: string | null;
  note?: string | null;
}): Promise<void> {
  await db.insert(schema.houseExclusions).values({
    houseId: data.houseId,
    itemId: data.itemId ?? null,
    fabricId: data.fabricId ?? null,
    note: data.note ?? null,
  });
}

export async function deleteHouseExclusion(id: string, houseId?: string): Promise<boolean> {
  const conditions = [eq(schema.houseExclusions.id, id)];
  if (houseId) {
    conditions.push(eq(schema.houseExclusions.houseId, houseId));
  }
  const result = await db
    .delete(schema.houseExclusions)
    .where(and(...conditions))
    .returning({ id: schema.houseExclusions.id });
  return result.length > 0;
}

export async function updateHouseExclusion(
  id: string,
  houseId: string,
  data: {
    itemId?: string | null;
    fabricId?: string | null;
    note?: string | null;
  }
): Promise<boolean> {
  const result = await db
    .update(schema.houseExclusions)
    .set({
      itemId: data.itemId ?? null,
      fabricId: data.fabricId ?? null,
      note: data.note ?? null,
    })
    .where(
      and(
        eq(schema.houseExclusions.id, id),
        eq(schema.houseExclusions.houseId, houseId)
      )
    )
    .returning({ id: schema.houseExclusions.id });
  return result.length > 0;
}

export async function getHouseCoverage(houseId: string): Promise<HouseCoverageRecord[]> {
  const rows = await db
    .select({
      id: schema.houseCoverage.id,
      houseId: schema.houseCoverage.houseId,
      neighborhoodId: schema.houseCoverage.neighborhoodId,
      neighborhoodName: schema.neighborhoods.name,
      isActive: schema.houseCoverage.isActive,
      pausedUntil: schema.houseCoverage.pausedUntil,
    })
    .from(schema.houseCoverage)
    .leftJoin(
      schema.neighborhoods,
      eq(schema.houseCoverage.neighborhoodId, schema.neighborhoods.id)
    )
    .where(eq(schema.houseCoverage.houseId, houseId));

  return rows;
}

export async function upsertHouseCoverage(data: {
  houseId: string;
  neighborhoodId: string;
  isActive: boolean;
}): Promise<void> {
  await db
    .insert(schema.houseCoverage)
    .values({
      houseId: data.houseId,
      neighborhoodId: data.neighborhoodId,
      isActive: data.isActive,
    })
    .onConflictDoUpdate({
      target: [schema.houseCoverage.houseId, schema.houseCoverage.neighborhoodId],
      set: {
        isActive: data.isActive,
      },
    });
}

export async function upsertHouseCoverageBatch(
  houseId: string,
  items: Array<{ neighborhoodId: string; isActive: boolean }>
): Promise<void> {
  if (items.length === 0) return;

  await db.transaction(async (tx) => {
    for (const item of items) {
      await tx
        .insert(schema.houseCoverage)
        .values({
          houseId,
          neighborhoodId: item.neighborhoodId,
          isActive: item.isActive,
        })
        .onConflictDoUpdate({
          target: [schema.houseCoverage.houseId, schema.houseCoverage.neighborhoodId],
          set: {
            isActive: item.isActive,
          },
        });
    }
  });
}

export interface HouseCatalogueItemRecord {
  id: string | null; // houseItems.id
  houseId: string;
  serviceId: string;
  serviceNameFr: string;
  serviceNameSw: string;
  serviceSlug: string;
  itemId: string;
  itemNameFr: string;
  itemNameSw: string;
  itemCategory: string | null;
  fabricId: string;
  fabricNameFr: string;
  fabricNameSw: string;
  price: number;
  currency: "CDF" | "USD";
  isActive: boolean;
  hasCustomPrice: boolean;
}

/**
 * Returns master catalogue cross-joined with current house pricing (Task 4.4).
 */
export async function getHouseCatalogueItems(
  houseId: string
): Promise<HouseCatalogueItemRecord[]> {
  const [activeServices, activeItems, activeFabrics, housePricing] =
    await Promise.all([
      db
        .select()
        .from(schema.services)
        .where(eq(schema.services.isActive, true))
        .orderBy(asc(schema.services.sortOrder)),
      db
        .select()
        .from(schema.items)
        .where(eq(schema.items.isActive, true))
        .orderBy(asc(schema.items.sortOrder)),
      db
        .select()
        .from(schema.fabrics)
        .where(eq(schema.fabrics.isActive, true))
        .orderBy(asc(schema.fabrics.sortOrder)),
      db
        .select()
        .from(schema.houseItems)
        .where(eq(schema.houseItems.houseId, houseId)),
    ]);

  const pricingMap = new Map<string, typeof housePricing[number]>();
  for (const hp of housePricing) {
    const key = `${hp.serviceId}_${hp.itemId}_${hp.fabricId}`;
    pricingMap.set(key, hp);
  }

  const result: HouseCatalogueItemRecord[] = [];

  for (const s of activeServices) {
    for (const it of activeItems) {
      for (const f of activeFabrics) {
        const key = `${s.id}_${it.id}_${f.id}`;
        const existing = pricingMap.get(key);

        result.push({
          id: existing ? existing.id : null,
          houseId,
          serviceId: s.id,
          serviceNameFr: s.nameFr,
          serviceNameSw: s.nameSw,
          serviceSlug: s.slug,
          itemId: it.id,
          itemNameFr: it.nameFr,
          itemNameSw: it.nameSw,
          itemCategory: it.category,
          fabricId: f.id,
          fabricNameFr: f.nameFr,
          fabricNameSw: f.nameSw,
          price: existing ? existing.price : 0,
          currency: existing ? existing.currency : "CDF",
          isActive: existing ? existing.isActive : false,
          hasCustomPrice: Boolean(existing),
        });
      }
    }
  }

  return result;
}

/**
 * Sets house price & availability for a master item combination.
 * Invariant: Frozen prices on existing orders are never affected.
 */
export async function upsertHouseItemPrice(params: {
  houseId: string;
  serviceId: string;
  itemId: string;
  fabricId: string;
  price: number;
  isActive: boolean;
  currency?: "CDF" | "USD";
}): Promise<void> {
  await db
    .insert(schema.houseItems)
    .values({
      houseId: params.houseId,
      serviceId: params.serviceId,
      itemId: params.itemId,
      fabricId: params.fabricId,
      price: params.price,
      currency: params.currency ?? "CDF",
      isActive: params.isActive,
    })
    .onConflictDoUpdate({
      target: [
        schema.houseItems.houseId,
        schema.houseItems.serviceId,
        schema.houseItems.itemId,
        schema.houseItems.fabricId,
      ],
      set: {
        price: params.price,
        isActive: params.isActive,
        currency: params.currency ?? "CDF",
        updatedAt: new Date(),
      },
    });
}

/**
 * Batch updates house price & availability for master item combinations atomically.
 * Invariant: Frozen prices on existing orders are never affected.
 */
export async function upsertHouseItemPricesBatch(
  items: Array<{
    houseId: string;
    serviceId: string;
    itemId: string;
    fabricId: string;
    price: number;
    isActive: boolean;
    currency?: "CDF" | "USD";
  }>
): Promise<void> {
  if (items.length === 0) return;

  await db.transaction(async (tx) => {
    for (const item of items) {
      await tx
        .insert(schema.houseItems)
        .values({
          houseId: item.houseId,
          serviceId: item.serviceId,
          itemId: item.itemId,
          fabricId: item.fabricId,
          price: item.price,
          currency: item.currency ?? "CDF",
          isActive: item.isActive,
        })
        .onConflictDoUpdate({
          target: [
            schema.houseItems.houseId,
            schema.houseItems.serviceId,
            schema.houseItems.itemId,
            schema.houseItems.fabricId,
          ],
          set: {
            price: item.price,
            isActive: item.isActive,
            currency: item.currency ?? "CDF",
            updatedAt: new Date(),
          },
        });
    }
  });
}

/**
 * Creates a catalogue addition request from a house (Task 4.4).
 */
export async function createHouseItemRequest(params: {
  houseId: string;
  requestedBy: string;
  kind: "item" | "fabric";
  name: string;
  note?: string | null;
}): Promise<void> {
  await db.insert(schema.itemRequests).values({
    houseId: params.houseId,
    requestedBy: params.requestedBy,
    kind: params.kind,
    name: params.name.trim(),
    note: params.note?.trim() ?? null,
    status: "pending",
  });
}

/**
 * Lists catalogue addition requests submitted by a house.
 */
export async function getHouseItemRequests(
  houseId: string
): Promise<
  Array<{
    id: string;
    kind: "item" | "fabric";
    name: string;
    note: string | null;
    status: "pending" | "approved" | "rejected";
    adminNote: string | null;
    createdAt: Date;
  }>
> {
  return db
    .select({
      id: schema.itemRequests.id,
      kind: schema.itemRequests.kind,
      name: schema.itemRequests.name,
      note: schema.itemRequests.note,
      status: schema.itemRequests.status,
      adminNote: schema.itemRequests.adminNote,
      createdAt: schema.itemRequests.createdAt,
    })
    .from(schema.itemRequests)
    .where(eq(schema.itemRequests.houseId, houseId))
    .orderBy(desc(schema.itemRequests.createdAt));
}

export interface HouseCoverageWithLimitsItem {
  neighborhoodId: string;
  neighborhoodName: string;
  zoneId: string;
  zoneName: string;
  neighborhoodStatus: "served" | "paused" | "not_served";
  distanceLevel: number | null;
  isAllowedByDistance: boolean;
  isCovered: boolean;
  deliveryFee?: number | null;
  deliveryFeeCurrency?: "CDF" | "USD";
  activeOrdersCount?: number;
  orders30dCount?: number;
  demandCount?: number;
}

export interface HouseCoverageWithLimitsData {
  houseId: string;
  houseName: string;
  houseNeighborhoodId: string;
  houseZoneId: string | null;
  effectiveMaxDistanceLevel: number;
  items: HouseCoverageWithLimitsItem[];
}

/**
 * Computes coverage options for a house taking the distance limit into account (Task 4.5).
 * Done when: A house cannot select a neighborhood beyond its distance limit.
 */
export async function getHouseCoverageWithLimits(
  houseId: string
): Promise<HouseCoverageWithLimitsData | null> {
  const [house] = await db
    .select({
      id: schema.houses.id,
      name: schema.houses.name,
      neighborhoodId: schema.houses.neighborhoodId,
      maxDistanceLevel: schema.houses.maxDistanceLevel,
    })
    .from(schema.houses)
    .where(eq(schema.houses.id, houseId))
    .limit(1);

  if (!house) return null;

  const houseNeighborhood = house.neighborhoodId
    ? (
        await db
          .select({
            id: schema.neighborhoods.id,
            zoneId: schema.neighborhoods.zoneId,
          })
          .from(schema.neighborhoods)
          .where(eq(schema.neighborhoods.id, house.neighborhoodId))
          .limit(1)
      )[0] ?? null
    : null;

  const [settings] = await db.select().from(schema.settings).limit(1);
  const globalMaxDistance = settings?.maxCoverageDistanceLevel ?? 2;
  const effectiveMaxDistance = house.maxDistanceLevel ?? globalMaxDistance;

  const activeStatuses: (typeof schema.orderStatusEnum.enumValues)[number][] = [
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
  ];

  const terminalStatuses: (typeof schema.orderStatusEnum.enumValues)[number][] = [
    "rejected",
    "cancelled",
    "expired",
  ];

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    allNeighborhoods,
    allZoneFees,
    existingCoverage,
    activeOrderRows,
    recentOrderRows,
    demandRows,
  ] = await Promise.all([
    db
      .select({
        id: schema.neighborhoods.id,
        name: schema.neighborhoods.name,
        zoneId: schema.neighborhoods.zoneId,
        zoneName: schema.zones.name,
        status: schema.neighborhoods.status,
      })
      .from(schema.neighborhoods)
      .innerJoin(schema.zones, eq(schema.neighborhoods.zoneId, schema.zones.id))
      .orderBy(asc(schema.zones.name), asc(schema.neighborhoods.name)),
    db
      .select({
        customerZoneId: schema.zoneFees.customerZoneId,
        houseZoneId: schema.zoneFees.houseZoneId,
        distanceLevel: schema.zoneFees.distanceLevel,
        deliveryFee: schema.zoneFees.deliveryFee,
        currency: schema.zoneFees.currency,
      })
      .from(schema.zoneFees),
    db
      .select({
        neighborhoodId: schema.houseCoverage.neighborhoodId,
        isActive: schema.houseCoverage.isActive,
      })
      .from(schema.houseCoverage)
      .where(eq(schema.houseCoverage.houseId, houseId)),
    db
      .select({
        neighborhoodId: schema.orders.neighborhoodId,
        count: sql<number>`count(*)::int`,
      })
      .from(schema.orders)
      .where(
        and(
          eq(schema.orders.houseId, houseId),
          inArray(schema.orders.status, activeStatuses)
        )
      )
      .groupBy(schema.orders.neighborhoodId),
    db
      .select({
        neighborhoodId: schema.orders.neighborhoodId,
        count: sql<number>`count(*)::int`,
      })
      .from(schema.orders)
      .where(
        and(
          eq(schema.orders.houseId, houseId),
          gte(schema.orders.createdAt, thirtyDaysAgo),
          notInArray(schema.orders.status, terminalStatuses)
        )
      )
      .groupBy(schema.orders.neighborhoodId),
    db
      .select({
        neighborhoodId: schema.coverageRequests.neighborhoodId,
        count: sql<number>`count(*)::int`,
      })
      .from(schema.coverageRequests)
      .where(sql`${schema.coverageRequests.neighborhoodId} is not null`)
      .groupBy(schema.coverageRequests.neighborhoodId),
  ]);

  const coverageMap = new Map<string, boolean>();
  for (const c of existingCoverage) {
    coverageMap.set(c.neighborhoodId, c.isActive);
  }

  const activeOrdersMap = new Map<string, number>();
  for (const row of activeOrderRows) {
    if (row.neighborhoodId) activeOrdersMap.set(row.neighborhoodId, row.count);
  }

  const recentOrdersMap = new Map<string, number>();
  for (const row of recentOrderRows) {
    if (row.neighborhoodId) recentOrdersMap.set(row.neighborhoodId, row.count);
  }

  const demandMap = new Map<string, number>();
  for (const row of demandRows) {
    if (row.neighborhoodId) demandMap.set(row.neighborhoodId, row.count);
  }

  const houseZoneId = houseNeighborhood?.zoneId ?? null;

  interface ZoneFeeDetail {
    distanceLevel: number;
    deliveryFee: number;
    currency: "CDF" | "USD";
  }
  const feeMap = new Map<string, ZoneFeeDetail>();
  if (houseZoneId) {
    for (const zf of allZoneFees) {
      if (zf.houseZoneId === houseZoneId) {
        feeMap.set(zf.customerZoneId, {
          distanceLevel: zf.distanceLevel,
          deliveryFee: zf.deliveryFee,
          currency: zf.currency,
        });
      }
    }
  }

  const items: HouseCoverageWithLimitsItem[] = allNeighborhoods.map((n) => {
    const feeInfo = feeMap.get(n.zoneId);
    let distLevel = feeInfo?.distanceLevel ?? null;
    if (distLevel === null && houseZoneId === n.zoneId) {
      distLevel = 1;
    }

    const isAllowed =
      distLevel !== null && distLevel <= effectiveMaxDistance;

    return {
      neighborhoodId: n.id,
      neighborhoodName: n.name,
      zoneId: n.zoneId,
      zoneName: n.zoneName,
      neighborhoodStatus: n.status,
      distanceLevel: distLevel,
      isAllowedByDistance: isAllowed,
      isCovered: Boolean(coverageMap.get(n.id)),
      deliveryFee: feeInfo?.deliveryFee ?? null,
      deliveryFeeCurrency: feeInfo?.currency ?? "CDF",
      activeOrdersCount: activeOrdersMap.get(n.id) ?? 0,
      orders30dCount: recentOrdersMap.get(n.id) ?? 0,
      demandCount: demandMap.get(n.id) ?? 0,
    };
  });

  return {
    houseId: house.id,
    houseName: house.name,
    houseNeighborhoodId: house.neighborhoodId,
    houseZoneId,
    effectiveMaxDistanceLevel: effectiveMaxDistance,
    items,
  };
}

export async function getAllHousesHours(): Promise<HouseHourRecord[]> {
  return db
    .select()
    .from(schema.houseHours)
    .orderBy(asc(schema.houseHours.weekday), asc(schema.houseHours.opensAt));
}

export async function getAllHousesClosures(): Promise<HouseClosureRecord[]> {
  return db
    .select()
    .from(schema.houseClosures)
    .orderBy(asc(schema.houseClosures.startsOn));
}

/**
 * Computes today's count of active/accepted orders for a house in Bukavu business time.
 */
export async function getHouseTodayOrdersCount(houseId: string): Promise<number> {
  const bukavuNow = toBukavuDateTime(new Date());
  const startOfDay = new Date(
    Date.UTC(bukavuNow.year, bukavuNow.month - 1, bukavuNow.day, 0, 0, 0, 0) - 2 * 60 * 60 * 1000
  );
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1);

  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.orders)
    .where(
      and(
        eq(schema.orders.houseId, houseId),
        gte(schema.orders.createdAt, startOfDay),
        lte(schema.orders.createdAt, endOfDay),
        notInArray(schema.orders.status, ["rejected", "cancelled", "expired"])
      )
    );

  return row?.count ?? 0;
}

export interface RecordCoverageExtensionTicketParams {
  houseId: string;
  userId: string;
  ticketReference: string;
  currentDistanceLevel: number;
  targetDistanceLevel: number;
  requestedNeighborhoodIds?: string[];
  reasonCategory: string;
  note: string;
}

/**
 * Records an internal support ticket for a laundry house requesting coverage perimeter expansion.
 * Dispatches in-app notifications to SafiHub platform admins and confirms receipt to the partner.
 */
export async function recordCoverageExtensionTicket(
  params: RecordCoverageExtensionTicketParams
): Promise<Result<{ ticketReference: string }>> {
  const [house] = await db
    .select({ id: schema.houses.id, name: schema.houses.name })
    .from(schema.houses)
    .where(eq(schema.houses.id, params.houseId))
    .limit(1);

  if (!house) {
    return err("Pressing introuvable.");
  }

  let neighborhoodNames: string[] = [];
  if (params.requestedNeighborhoodIds && params.requestedNeighborhoodIds.length > 0) {
    const neighs = await db
      .select({ name: schema.neighborhoods.name })
      .from(schema.neighborhoods)
      .where(inArray(schema.neighborhoods.id, params.requestedNeighborhoodIds));
    neighborhoodNames = neighs.map((n) => n.name);
  }

  const adminUsers = await db
    .select({ id: schema.user.id })
    .from(schema.user)
    .where(eq(schema.user.role, "admin"));

  const neighListStr =
    neighborhoodNames.length > 0
      ? ` Quartiers ciblés : ${neighborhoodNames.join(", ")}.`
      : "";

  for (const admin of adminUsers) {
    await db.insert(schema.notifications).values({
      id: crypto.randomUUID(),
      userId: admin.id,
      channel: "in_app",
      templateKey: "admin_coverage_extension_ticket",
      locale: "fr",
      title: `[Support Pressing] Demande d'extension ${params.ticketReference}`,
      body: `Demande reçue du pressing « ${house.name} » pour étendre son périmètre de Niveau ${params.currentDistanceLevel} à Niveau ${params.targetDistanceLevel}.${neighListStr} Motif : ${params.reasonCategory}. Précisions : ${params.note}`,
      status: "pending",
    });
  }

  await db.insert(schema.notifications).values({
    id: crypto.randomUUID(),
    userId: params.userId,
    channel: "in_app",
    templateKey: "partner_coverage_extension_ticket",
    locale: "fr",
    title: `Demande d'extension ${params.ticketReference} enregistrée`,
    body: `Votre demande d'extension vers le Niveau ${params.targetDistanceLevel} a été enregistrée (Réf : ${params.ticketReference}). L'équipe SafiHub l'étudiera sous 24h ouvrées directement sur la plateforme.`,
    status: "pending",
  });

  return ok({ ticketReference: params.ticketReference });
}

