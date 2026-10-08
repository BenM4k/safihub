import "server-only";
import { and, asc, desc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db, schema } from "./db";

export interface CourierRecord {
  userId: string;
  name: string;
  email: string;
  contactPhone: string | null;
  cashCeiling: number | null;
  securityDeposit: number;
  changeFloat: number;
  payPerLeg: number | null;
  isActive: boolean;
  status: string;
  coveredZoneCount: number;
  shiftCount: number;
  createdAt: Date;
}

export interface CourierShiftRecord {
  id: string;
  courierId: string;
  weekday: number;
  startsAt: string;
  endsAt: string;
}

export interface CourierZoneRecord {
  courierId: string;
  zoneId: string;
  zoneName?: string;
}

export interface MissionRecord {
  id: string;
  orderId: string;
  orderCode?: string;
  type: "pickup" | "delivery";
  courierId: string | null;
  courierName?: string | null;
  status: "unassigned" | "assigned" | "accepted" | "in_progress" | "completed" | "failed";
  slotStart: Date;
  slotEnd: Date;
  customerZoneId?: string;
  customerZoneName?: string;
  houseZoneId?: string;
  houseZoneName?: string;
  landmark?: string | null;
  customerPhone?: string | null;
  houseName?: string | null;
  housePhone?: string | null;
  cashCollected: number | null;
  createdAt: Date;
}

export async function getCouriers(): Promise<CourierRecord[]> {
  const users = await db
    .select({
      id: schema.user.id,
      name: schema.user.name,
      email: schema.user.email,
      contactPhone: schema.user.contactPhone,
      status: schema.user.status,
    })
    .from(schema.user)
    .where(eq(schema.user.role, "courier"));

  const profiles = await db.select().from(schema.courierProfiles);
  const profileMap = new Map(profiles.map((p) => [p.userId, p]));

  const shifts = await db.select().from(schema.courierShifts);
  const shiftCounts = new Map<string, number>();
  for (const s of shifts) {
    shiftCounts.set(s.courierId, (shiftCounts.get(s.courierId) || 0) + 1);
  }

  const zones = await db.select().from(schema.courierZones);
  const zoneCounts = new Map<string, number>();
  for (const z of zones) {
    zoneCounts.set(z.courierId, (zoneCounts.get(z.courierId) || 0) + 1);
  }

  return users.map((u) => {
    const prof = profileMap.get(u.id);
    return {
      userId: u.id,
      name: u.name,
      email: u.email,
      contactPhone: u.contactPhone,
      cashCeiling: prof?.cashCeiling ?? null,
      securityDeposit: prof?.securityDeposit ?? 0,
      changeFloat: prof?.changeFloat ?? 0,
      payPerLeg: prof?.payPerLeg ?? null,
      isActive: prof?.isActive ?? true,
      status: u.status,
      coveredZoneCount: zoneCounts.get(u.id) || 0,
      shiftCount: shiftCounts.get(u.id) || 0,
      createdAt: prof?.createdAt ?? new Date(),
    };
  });
}

export async function getCourierById(courierId: string): Promise<CourierRecord | null> {
  const [u] = await db
    .select({
      id: schema.user.id,
      name: schema.user.name,
      email: schema.user.email,
      contactPhone: schema.user.contactPhone,
      status: schema.user.status,
    })
    .from(schema.user)
    .where(eq(schema.user.id, courierId))
    .limit(1);

  if (!u) return null;

  const [prof] = await db
    .select()
    .from(schema.courierProfiles)
    .where(eq(schema.courierProfiles.userId, courierId))
    .limit(1);

  const shifts = await getCourierShifts(courierId);
  const zones = await getCourierZones(courierId);

  return {
    userId: u.id,
    name: u.name,
    email: u.email,
    contactPhone: u.contactPhone,
    cashCeiling: prof?.cashCeiling ?? null,
    securityDeposit: prof?.securityDeposit ?? 0,
    changeFloat: prof?.changeFloat ?? 0,
    payPerLeg: prof?.payPerLeg ?? null,
    isActive: prof?.isActive ?? true,
    status: u.status,
    coveredZoneCount: zones.length,
    shiftCount: shifts.length,
    createdAt: prof?.createdAt ?? new Date(),
  };
}

export async function upsertCourierProfile(data: {
  userId: string;
  cashCeiling?: number | null;
  securityDeposit?: number;
  changeFloat?: number;
  payPerLeg?: number | null;
  isActive?: boolean;
}): Promise<void> {
  await db
    .insert(schema.courierProfiles)
    .values({
      userId: data.userId,
      cashCeiling: data.cashCeiling ?? null,
      securityDeposit: data.securityDeposit ?? 0,
      changeFloat: data.changeFloat ?? 0,
      payPerLeg: data.payPerLeg ?? null,
      isActive: data.isActive ?? true,
    })
    .onConflictDoUpdate({
      target: schema.courierProfiles.userId,
      set: {
        ...(data.cashCeiling !== undefined ? { cashCeiling: data.cashCeiling } : {}),
        ...(data.securityDeposit !== undefined ? { securityDeposit: data.securityDeposit } : {}),
        ...(data.changeFloat !== undefined ? { changeFloat: data.changeFloat } : {}),
        ...(data.payPerLeg !== undefined ? { payPerLeg: data.payPerLeg } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
        updatedAt: new Date(),
      },
    });
}

export async function getCourierShifts(courierId: string): Promise<CourierShiftRecord[]> {
  return db
    .select()
    .from(schema.courierShifts)
    .where(eq(schema.courierShifts.courierId, courierId))
    .orderBy(asc(schema.courierShifts.weekday), asc(schema.courierShifts.startsAt));
}

export async function setCourierShifts(
  courierId: string,
  shifts: Array<{ weekday: number; startsAt: string; endsAt: string }>
): Promise<void> {
  await db
    .delete(schema.courierShifts)
    .where(eq(schema.courierShifts.courierId, courierId));

  if (shifts.length > 0) {
    await db.insert(schema.courierShifts).values(
      shifts.map((s) => ({
        courierId,
        weekday: s.weekday,
        startsAt: s.startsAt,
        endsAt: s.endsAt,
      }))
    );
  }
}

export async function getCourierZones(courierId: string): Promise<CourierZoneRecord[]> {
  const rows = await db
    .select({
      courierId: schema.courierZones.courierId,
      zoneId: schema.courierZones.zoneId,
      zoneName: schema.zones.name,
    })
    .from(schema.courierZones)
    .innerJoin(schema.zones, eq(schema.courierZones.zoneId, schema.zones.id))
    .where(eq(schema.courierZones.courierId, courierId));

  return rows;
}

export async function setCourierZones(
  courierId: string,
  zoneIds: string[]
): Promise<void> {
  await db
    .delete(schema.courierZones)
    .where(eq(schema.courierZones.courierId, courierId));

  if (zoneIds.length > 0) {
    await db.insert(schema.courierZones).values(
      zoneIds.map((zId) => ({
        courierId,
        zoneId: zId,
      }))
    );
  }
}

/**
 * AC 20: Only couriers covering BOTH customer zone and house zone are offered.
 */
export async function getEligibleCouriersForZones(
  customerZoneId: string,
  houseZoneId: string
): Promise<CourierRecord[]> {
  const allCouriers = await getCouriers();
  const activeCouriers = allCouriers.filter((c) => c.isActive && c.status === "active");

  const eligible: CourierRecord[] = [];

  for (const courier of activeCouriers) {
    const courierZones = await getCourierZones(courier.userId);
    const coveredZoneIds = new Set(courierZones.map((z) => z.zoneId));

    const coversCustomer = coveredZoneIds.has(customerZoneId);
    const coversHouse = coveredZoneIds.has(houseZoneId);

    if (coversCustomer && coversHouse) {
      eligible.push(courier);
    }
  }

  return eligible;
}

export async function getMissionById(missionId: string): Promise<MissionRecord | null> {
  const customerNeighborhoods = alias(schema.neighborhoods, "cust_neigh_single");
  const houseNeighborhoods = alias(schema.neighborhoods, "house_neigh_single");
  const customerZones = alias(schema.zones, "cust_zone_single");
  const houseZones = alias(schema.zones, "house_zone_single");

  const [row] = await db
    .select({
      id: schema.missions.id,
      orderId: schema.missions.orderId,
      orderCode: schema.orders.code,
      type: schema.missions.type,
      courierId: schema.missions.courierId,
      courierName: schema.user.name,
      status: schema.missions.status,
      slotStart: schema.missions.slotStart,
      slotEnd: schema.missions.slotEnd,
      cashCollected: schema.missions.cashCollected,
      createdAt: schema.missions.createdAt,
      landmark: schema.orders.landmark,
      customerPhone: schema.orders.contactPhone,
      customerZoneId: customerZones.id,
      customerZoneName: customerZones.name,
      houseZoneId: houseZones.id,
      houseZoneName: houseZones.name,
      houseName: schema.houses.name,
      housePhone: schema.houses.contactPhone,
    })
    .from(schema.missions)
    .innerJoin(schema.orders, eq(schema.missions.orderId, schema.orders.id))
    .leftJoin(schema.user, eq(schema.missions.courierId, schema.user.id))
    .leftJoin(schema.houses, eq(schema.orders.houseId, schema.houses.id))
    .leftJoin(customerNeighborhoods, eq(schema.orders.neighborhoodId, customerNeighborhoods.id))
    .leftJoin(customerZones, eq(customerNeighborhoods.zoneId, customerZones.id))
    .leftJoin(houseNeighborhoods, eq(schema.houses.neighborhoodId, houseNeighborhoods.id))
    .leftJoin(houseZones, eq(houseNeighborhoods.zoneId, houseZones.id))
    .where(eq(schema.missions.id, missionId))
    .limit(1);

  return (row as MissionRecord) ?? null;
}

export async function getMissions(filters?: {
  status?: (typeof schema.missionStatusEnum.enumValues)[number];
  type?: "pickup" | "delivery";
  limit?: number;
}): Promise<MissionRecord[]> {
  const customerNeighborhoods = alias(schema.neighborhoods, "cust_neigh_list");
  const houseNeighborhoods = alias(schema.neighborhoods, "house_neigh_list");
  const customerZones = alias(schema.zones, "cust_zone_list");
  const houseZones = alias(schema.zones, "house_zone_list");

  const conditions = [];
  if (filters?.status) {
    conditions.push(eq(schema.missions.status, filters.status));
  }
  if (filters?.type) {
    conditions.push(eq(schema.missions.type, filters.type));
  }

  const rows = await db
    .select({
      id: schema.missions.id,
      orderId: schema.missions.orderId,
      orderCode: schema.orders.code,
      type: schema.missions.type,
      courierId: schema.missions.courierId,
      courierName: schema.user.name,
      status: schema.missions.status,
      slotStart: schema.missions.slotStart,
      slotEnd: schema.missions.slotEnd,
      cashCollected: schema.missions.cashCollected,
      createdAt: schema.missions.createdAt,
      landmark: schema.orders.landmark,
      customerPhone: schema.orders.contactPhone,
      customerZoneId: customerZones.id,
      customerZoneName: customerZones.name,
      houseZoneId: houseZones.id,
      houseZoneName: houseZones.name,
      houseName: schema.houses.name,
      housePhone: schema.houses.contactPhone,
    })
    .from(schema.missions)
    .innerJoin(schema.orders, eq(schema.missions.orderId, schema.orders.id))
    .leftJoin(schema.user, eq(schema.missions.courierId, schema.user.id))
    .leftJoin(schema.houses, eq(schema.orders.houseId, schema.houses.id))
    .leftJoin(customerNeighborhoods, eq(schema.orders.neighborhoodId, customerNeighborhoods.id))
    .leftJoin(customerZones, eq(customerNeighborhoods.zoneId, customerZones.id))
    .leftJoin(houseNeighborhoods, eq(schema.houses.neighborhoodId, houseNeighborhoods.id))
    .leftJoin(houseZones, eq(houseNeighborhoods.zoneId, houseZones.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(schema.missions.createdAt))
    .limit(filters?.limit ?? 100);

  return rows as MissionRecord[];
}

export async function assignMission(
  missionId: string,
  courierId: string
): Promise<boolean> {
  const result = await db
    .update(schema.missions)
    .set({
      courierId,
      status: "assigned",
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(schema.missions.id, missionId),
        eq(schema.missions.status, "unassigned")
      )
    )
    .returning({ id: schema.missions.id });

  return result.length > 0;
}
