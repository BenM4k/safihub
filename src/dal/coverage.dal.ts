import "server-only";
import { asc, desc, eq, inArray, or } from "drizzle-orm";
import { db, schema } from "./db";

export interface ZoneRecord {
  id: string;
  name: string;
  sortOrder: number;
}

export interface NeighborhoodRecord {
  id: string;
  name: string;
  zoneId: string;
  zoneName?: string;
  status: "served" | "paused" | "not_served";
  pauseReason: string | null;
  pausedUntil: Date | null;
  sortOrder: number;
}

export interface ZoneFeeRecord {
  id: string;
  customerZoneId: string;
  customerZoneName?: string;
  houseZoneId: string;
  houseZoneName?: string;
  deliveryFee: number;
  currency: "CDF" | "USD";
  distanceLevel: number;
  updatedAt: Date | null;
}

export interface CoverageRequestRecord {
  id: string;
  phone: string;
  neighborhoodId: string | null;
  neighborhoodName?: string | null;
  neighborhoodText: string | null;
  userId: string | null;
  createdAt: Date;
  notifiedAt: Date | null;
}

export interface CoverageDemandSummary {
  neighborhoodId: string | null;
  neighborhoodName: string;
  requestCount: number;
  lastRequestedAt: Date;
  pendingNotificationCount: number;
  samplePhones: string[];
  pendingRequestIds: string[];
}

export async function getZones(): Promise<ZoneRecord[]> {
  return db
    .select({
      id: schema.zones.id,
      name: schema.zones.name,
      sortOrder: schema.zones.sortOrder,
    })
    .from(schema.zones)
    .orderBy(asc(schema.zones.sortOrder), asc(schema.zones.name));
}

export async function createZone(data: {
  name: string;
  sortOrder?: number;
}): Promise<ZoneRecord> {
  const [created] = await db
    .insert(schema.zones)
    .values({
      name: data.name.trim(),
      sortOrder: data.sortOrder ?? 0,
    })
    .returning({
      id: schema.zones.id,
      name: schema.zones.name,
      sortOrder: schema.zones.sortOrder,
    });
  return created!;
}

export async function getNeighborhoods(): Promise<NeighborhoodRecord[]> {
  const rows = await db
    .select({
      id: schema.neighborhoods.id,
      name: schema.neighborhoods.name,
      zoneId: schema.neighborhoods.zoneId,
      zoneName: schema.zones.name,
      status: schema.neighborhoods.status,
      pauseReason: schema.neighborhoods.pauseReason,
      pausedUntil: schema.neighborhoods.pausedUntil,
      sortOrder: schema.neighborhoods.sortOrder,
    })
    .from(schema.neighborhoods)
    .innerJoin(schema.zones, eq(schema.neighborhoods.zoneId, schema.zones.id))
    .orderBy(asc(schema.zones.name), asc(schema.neighborhoods.sortOrder), asc(schema.neighborhoods.name));

  return rows;
}

export async function createNeighborhood(data: {
  name: string;
  zoneId: string;
  status?: "served" | "paused" | "not_served";
  pauseReason?: string | null;
  sortOrder?: number;
}): Promise<NeighborhoodRecord> {
  const [created] = await db
    .insert(schema.neighborhoods)
    .values({
      name: data.name.trim(),
      zoneId: data.zoneId,
      status: data.status ?? "not_served",
      pauseReason: data.pauseReason ?? null,
      sortOrder: data.sortOrder ?? 0,
    })
    .returning();

  return created!;
}

export async function updateNeighborhood(
  id: string,
  data: {
    name?: string;
    zoneId?: string;
    status?: "served" | "paused" | "not_served";
    pauseReason?: string | null;
    pausedUntil?: Date | null;
    sortOrder?: number;
  }
): Promise<void> {
  await db
    .update(schema.neighborhoods)
    .set({
      ...(data.name ? { name: data.name.trim() } : {}),
      ...(data.zoneId ? { zoneId: data.zoneId } : {}),
      ...(data.status ? { status: data.status } : {}),
      ...(data.pauseReason !== undefined ? { pauseReason: data.pauseReason } : {}),
      ...(data.pausedUntil !== undefined ? { pausedUntil: data.pausedUntil } : {}),
      ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
      updatedAt: new Date(),
    })
    .where(eq(schema.neighborhoods.id, id));
}

export async function getZoneFees(): Promise<ZoneFeeRecord[]> {
  const rows = await db
    .select({
      id: schema.zoneFees.id,
      customerZoneId: schema.zoneFees.customerZoneId,
      houseZoneId: schema.zoneFees.houseZoneId,
      deliveryFee: schema.zoneFees.deliveryFee,
      currency: schema.zoneFees.currency,
      distanceLevel: schema.zoneFees.distanceLevel,
      updatedAt: schema.zoneFees.updatedAt,
    })
    .from(schema.zoneFees);

  const zonesList = await getZones();
  const zoneNameMap = new Map(zonesList.map((z) => [z.id, z.name]));

  return rows.map((r) => ({
    ...r,
    customerZoneName: zoneNameMap.get(r.customerZoneId) ?? "Unknown",
    houseZoneName: zoneNameMap.get(r.houseZoneId) ?? "Unknown",
  }));
}

export async function upsertZoneFee(data: {
  customerZoneId: string;
  houseZoneId: string;
  deliveryFee: number;
  distanceLevel: number;
  currency?: "CDF" | "USD";
}): Promise<void> {
  await db
    .insert(schema.zoneFees)
    .values({
      customerZoneId: data.customerZoneId,
      houseZoneId: data.houseZoneId,
      deliveryFee: data.deliveryFee,
      distanceLevel: data.distanceLevel,
      currency: data.currency ?? "CDF",
    })
    .onConflictDoUpdate({
      target: [schema.zoneFees.customerZoneId, schema.zoneFees.houseZoneId],
      set: {
        deliveryFee: data.deliveryFee,
        distanceLevel: data.distanceLevel,
        currency: data.currency ?? "CDF",
        updatedAt: new Date(),
      },
    });
}

export async function getCoverageRequests(): Promise<CoverageRequestRecord[]> {
  const rows = await db
    .select({
      id: schema.coverageRequests.id,
      phone: schema.coverageRequests.phone,
      neighborhoodId: schema.coverageRequests.neighborhoodId,
      neighborhoodName: schema.neighborhoods.name,
      neighborhoodText: schema.coverageRequests.neighborhoodText,
      userId: schema.coverageRequests.userId,
      createdAt: schema.coverageRequests.createdAt,
      notifiedAt: schema.coverageRequests.notifiedAt,
    })
    .from(schema.coverageRequests)
    .leftJoin(
      schema.neighborhoods,
      eq(schema.coverageRequests.neighborhoodId, schema.neighborhoods.id)
    )
    .orderBy(desc(schema.coverageRequests.createdAt));

  return rows;
}

export async function getCoverageDemandRanked(): Promise<CoverageDemandSummary[]> {
  const requests = await getCoverageRequests();

  const grouped = new Map<string, CoverageDemandSummary>();

  for (const req of requests) {
    const key = req.neighborhoodId || req.neighborhoodText || "Unknown";
    const name = req.neighborhoodName || req.neighborhoodText || "Non spécifié";

    if (!grouped.has(key)) {
      grouped.set(key, {
        neighborhoodId: req.neighborhoodId,
        neighborhoodName: name,
        requestCount: 0,
        lastRequestedAt: req.createdAt,
        pendingNotificationCount: 0,
        samplePhones: [],
        pendingRequestIds: [],
      });
    }

    const item = grouped.get(key)!;
    item.requestCount += 1;
    if (req.createdAt > item.lastRequestedAt) {
      item.lastRequestedAt = req.createdAt;
    }
    if (!req.notifiedAt) {
      item.pendingNotificationCount += 1;
      item.pendingRequestIds.push(req.id);
      if (item.samplePhones.length < 5 && !item.samplePhones.includes(req.phone)) {
        item.samplePhones.push(req.phone);
      }
    }
  }

  return Array.from(grouped.values()).sort(
    (a, b) => b.requestCount - a.requestCount
  );
}

export async function markCoverageRequestsNotified(
  phonesOrIds: string[]
): Promise<void> {
  if (phonesOrIds.length === 0) return;

  await db
    .update(schema.coverageRequests)
    .set({ notifiedAt: new Date() })
    .where(
      or(
        inArray(schema.coverageRequests.id, phonesOrIds),
        inArray(schema.coverageRequests.phone, phonesOrIds)
      )
    );
}

export async function createCoverageRequest(data: {
  phone: string;
  neighborhoodId?: string | null;
  neighborhoodText?: string | null;
  userId?: string | null;
}): Promise<CoverageRequestRecord> {
  const [created] = await db
    .insert(schema.coverageRequests)
    .values({
      phone: data.phone.trim(),
      neighborhoodId: data.neighborhoodId || null,
      neighborhoodText: data.neighborhoodText?.trim() || null,
      userId: data.userId || null,
    })
    .returning();

  let neighborhoodName: string | null = null;
  if (created?.neighborhoodId) {
    const [n] = await db
      .select({ name: schema.neighborhoods.name })
      .from(schema.neighborhoods)
      .where(eq(schema.neighborhoods.id, created.neighborhoodId))
      .limit(1);
    neighborhoodName = n?.name ?? null;
  }

  return {
    ...created!,
    neighborhoodName,
  };
}
