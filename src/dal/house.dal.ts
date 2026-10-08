import "server-only";
import { and, asc, eq } from "drizzle-orm";
import { db, schema } from "./db";

export interface HouseMembershipInfo {
  houseId: string;
  userId: string;
  houseName: string;
  isActive: boolean;
  isPaused: boolean;
}

export interface HouseRecord {
  id: string;
  name: string;
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
  houseId: string
): Promise<boolean> {
  const [membership] = await db
    .select({ houseId: schema.houseMembers.houseId })
    .from(schema.houseMembers)
    .where(
      and(
        eq(schema.houseMembers.userId, userId),
        eq(schema.houseMembers.houseId, houseId)
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

export async function createHouse(data: {
  name: string;
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
}): Promise<HouseRecord> {
  const [created] = await db
    .insert(schema.houses)
    .values({
      name: data.name.trim(),
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
      isActive: true,
      isPaused: false,
    })
    .returning();

  return created!;
}

export async function updateHouse(
  id: string,
  data: Partial<{
    name: string;
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

export async function deleteHouseClosure(id: string): Promise<void> {
  await db.delete(schema.houseClosures).where(eq(schema.houseClosures.id, id));
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

export async function deleteHouseExclusion(id: string): Promise<void> {
  await db.delete(schema.houseExclusions).where(eq(schema.houseExclusions.id, id));
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
