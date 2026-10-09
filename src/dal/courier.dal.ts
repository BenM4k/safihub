import "server-only";
import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
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

export interface CourierAssignedMissionSummary {
  id: string;
  orderId: string;
  orderCode: string;
  type: "pickup" | "delivery";
  status: "unassigned" | "assigned" | "accepted" | "in_progress" | "completed" | "failed";
  slotStart: Date;
  slotEnd: Date;
  customerNeighborhood: string;
  customerLandmark: string | null;
  customerFirstName: string;
  customerPhone: string | null;
  houseName: string;
  houseNeighborhood: string;
  housePhone: string | null;
  courierPay: number | null;
  cashCollected: number | null;
  totalDue: number;
}

export interface CourierMissionDetailItem {
  id: string;
  itemId?: string | null;
  itemName?: string | null;
  fabricName?: string | null;
  serviceName?: string | null;
  customLabel?: string | null;
  declaredQuantity: number;
  pickupQuantity: number | null;
  receivedQuantity: number | null;
  unitPrice: number;
  conditionNote?: string | null;
  isFlagged: boolean;
  status: "accepted" | "returned";
}

export interface CourierMissionDetailPhoto {
  id: string;
  storageKey: string;
  type: string;
  orderItemId?: string | null;
  createdAt: Date;
}

export interface CourierMissionDetail {
  mission: CourierAssignedMissionSummary;
  orderStatus: string;
  deliveryConfirmationCode?: string | null;
  paymentCurrency: string;
  exchangeRateUsed?: string | null;
  items: CourierMissionDetailItem[];
  photos: CourierMissionDetailPhoto[];
  failedPickupCount: number;
  failedDeliveryCount: number;
}

export interface CourierCashOverview {
  courierId: string;
  cashHeld: number;
  cashCollected: number;
  cashRemitted: number;
  cashCeiling: number | null;
  securityDeposit: number;
  changeFloat: number;
  isCeilingExceeded: boolean;
  owedToHouses: number;
  owedToOwner: number;
  recentLedgerEntries: Array<{
    id: string;
    entryType: string;
    amount: number;
    currency: string;
    orderId?: string | null;
    note?: string | null;
    createdAt: Date;
  }>;
}

export interface CourierHistoryRecord {
  id: string;
  orderId: string;
  orderCode: string;
  type: "pickup" | "delivery";
  status: string;
  slotStart: Date;
  completedAt?: Date | null;
  courierPay: number | null;
  customerNeighborhood: string;
  failureReason?: string | null;
}

export interface CourierHistoryData {
  missions: CourierHistoryRecord[];
  totalEarningsCDF: number;
  completedCount: number;
  failedCount: number;
}

/**
 * Task 6.1: Courier sees only assigned missions with restricted projection.
 */
export async function getCourierAssignedMissions(
  courierId: string
): Promise<CourierAssignedMissionSummary[]> {
  const customerNeighborhoods = alias(schema.neighborhoods, "c_neigh");
  const houseNeighborhoods = alias(schema.neighborhoods, "h_neigh");

  const rows = await db
    .select({
      id: schema.missions.id,
      orderId: schema.missions.orderId,
      orderCode: schema.orders.code,
      type: schema.missions.type,
      status: schema.missions.status,
      slotStart: schema.missions.slotStart,
      slotEnd: schema.missions.slotEnd,
      courierPay: schema.missions.courierPay,
      cashCollected: schema.missions.cashCollected,
      totalDue: schema.orders.totalDue,
      customerName: schema.user.name,
      customerPhone: schema.orders.contactPhone,
      customerLandmark: schema.orders.landmark,
      customerNeighborhood: customerNeighborhoods.name,
      houseName: schema.houses.name,
      housePhone: schema.houses.contactPhone,
      houseNeighborhood: houseNeighborhoods.name,
    })
    .from(schema.missions)
    .innerJoin(schema.orders, eq(schema.missions.orderId, schema.orders.id))
    .innerJoin(schema.user, eq(schema.orders.customerId, schema.user.id))
    .innerJoin(schema.houses, eq(schema.orders.houseId, schema.houses.id))
    .leftJoin(customerNeighborhoods, eq(schema.orders.neighborhoodId, customerNeighborhoods.id))
    .leftJoin(houseNeighborhoods, eq(schema.houses.neighborhoodId, houseNeighborhoods.id))
    .where(eq(schema.missions.courierId, courierId))
    .orderBy(asc(schema.missions.slotStart));

  return rows.map((r) => {
    const isActive = ["assigned", "accepted", "in_progress"].includes(r.status);
    return {
      id: r.id,
      orderId: r.orderId,
      orderCode: r.orderCode,
      type: r.type,
      status: r.status,
      slotStart: r.slotStart,
      slotEnd: r.slotEnd,
      courierPay: r.courierPay,
      cashCollected: r.cashCollected,
      totalDue: r.totalDue,
      customerFirstName: (r.customerName || "Client").trim().split(" ")[0] || "Client",
      customerPhone: isActive ? r.customerPhone : null,
      customerLandmark: isActive ? r.customerLandmark : null,
      customerNeighborhood: r.customerNeighborhood || "Bukavu",
      houseName: r.houseName,
      housePhone: r.housePhone,
      houseNeighborhood: r.houseNeighborhood || "Bukavu",
    };
  });
}

/**
 * Task 6.1 & 6.2: Retrieve mission detail with restricted projection.
 */
export async function getCourierMissionDetail(
  courierId: string,
  missionId: string
): Promise<CourierMissionDetail | null> {
  const customerNeighborhoods = alias(schema.neighborhoods, "c_neigh_det");
  const houseNeighborhoods = alias(schema.neighborhoods, "h_neigh_det");

  const [row] = await db
    .select({
      id: schema.missions.id,
      orderId: schema.missions.orderId,
      orderCode: schema.orders.code,
      orderStatus: schema.orders.status,
      deliveryConfirmationCode: schema.orders.deliveryConfirmationCode,
      paymentCurrency: schema.orders.paymentCurrency,
      exchangeRateUsed: schema.orders.exchangeRateUsed,
      type: schema.missions.type,
      status: schema.missions.status,
      slotStart: schema.missions.slotStart,
      slotEnd: schema.missions.slotEnd,
      courierPay: schema.missions.courierPay,
      cashCollected: schema.missions.cashCollected,
      totalDue: schema.orders.totalDue,
      failedPickupCount: schema.orders.failedPickupCount,
      failedDeliveryCount: schema.orders.failedDeliveryCount,
      customerName: schema.user.name,
      customerPhone: schema.orders.contactPhone,
      customerLandmark: schema.orders.landmark,
      customerNeighborhood: customerNeighborhoods.name,
      houseName: schema.houses.name,
      housePhone: schema.houses.contactPhone,
      houseNeighborhood: houseNeighborhoods.name,
    })
    .from(schema.missions)
    .innerJoin(schema.orders, eq(schema.missions.orderId, schema.orders.id))
    .innerJoin(schema.user, eq(schema.orders.customerId, schema.user.id))
    .innerJoin(schema.houses, eq(schema.orders.houseId, schema.houses.id))
    .leftJoin(customerNeighborhoods, eq(schema.orders.neighborhoodId, customerNeighborhoods.id))
    .leftJoin(houseNeighborhoods, eq(schema.houses.neighborhoodId, houseNeighborhoods.id))
    .where(and(eq(schema.missions.id, missionId), eq(schema.missions.courierId, courierId)))
    .limit(1);

  if (!row) return null;

  // Items query with catalog names
  const itemsRows = await db
    .select({
      id: schema.orderItems.id,
      itemId: schema.orderItems.itemId,
      itemName: schema.items.nameFr,
      fabricName: schema.fabrics.nameFr,
      serviceName: schema.services.nameFr,
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
    .leftJoin(schema.items, eq(schema.orderItems.itemId, schema.items.id))
    .leftJoin(schema.fabrics, eq(schema.orderItems.fabricId, schema.fabrics.id))
    .leftJoin(schema.services, eq(schema.orderItems.serviceId, schema.services.id))
    .where(eq(schema.orderItems.orderId, row.orderId));

  // Photos query
  const photoRows = await db
    .select({
      id: schema.orderPhotos.id,
      storageKey: schema.orderPhotos.storageKey,
      type: schema.orderPhotos.type,
      orderItemId: schema.orderPhotos.orderItemId,
      createdAt: schema.orderPhotos.createdAt,
    })
    .from(schema.orderPhotos)
    .where(eq(schema.orderPhotos.orderId, row.orderId));

  const isActive = ["assigned", "accepted", "in_progress"].includes(row.status);

  return {
    mission: {
      id: row.id,
      orderId: row.orderId,
      orderCode: row.orderCode,
      type: row.type,
      status: row.status,
      slotStart: row.slotStart,
      slotEnd: row.slotEnd,
      courierPay: row.courierPay,
      cashCollected: row.cashCollected,
      totalDue: row.totalDue,
      customerFirstName: (row.customerName || "Client").trim().split(" ")[0] || "Client",
      customerPhone: isActive ? row.customerPhone : null,
      customerLandmark: isActive ? row.customerLandmark : null,
      customerNeighborhood: row.customerNeighborhood || "Bukavu",
      houseName: row.houseName,
      housePhone: row.housePhone,
      houseNeighborhood: row.houseNeighborhood || "Bukavu",
    },
    orderStatus: row.orderStatus,
    deliveryConfirmationCode: row.deliveryConfirmationCode,
    paymentCurrency: row.paymentCurrency,
    exchangeRateUsed: row.exchangeRateUsed,
    items: itemsRows.map((it) => ({
      id: it.id,
      itemId: it.itemId,
      itemName: it.itemName,
      fabricName: it.fabricName,
      serviceName: it.serviceName,
      customLabel: it.customLabel,
      declaredQuantity: it.declaredQuantity,
      pickupQuantity: it.pickupQuantity,
      receivedQuantity: it.receivedQuantity,
      unitPrice: it.unitPrice,
      conditionNote: it.conditionNote,
      isFlagged: it.isFlagged,
      status: it.status,
    })),
    photos: photoRows.map((p) => ({
      id: p.id,
      storageKey: p.storageKey,
      type: p.type,
      orderItemId: p.orderItemId,
      createdAt: p.createdAt,
    })),
    failedPickupCount: row.failedPickupCount,
    failedDeliveryCount: row.failedDeliveryCount,
  };
}

/**
 * Task 6.1: Accept assigned mission (assigned -> accepted).
 */
export async function acceptMissionAtomic(
  missionId: string,
  courierId: string
): Promise<boolean> {
  const [updated] = await db
    .update(schema.missions)
    .set({
      status: "accepted",
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(schema.missions.id, missionId),
        eq(schema.missions.courierId, courierId),
        eq(schema.missions.status, "assigned")
      )
    )
    .returning({ id: schema.missions.id });

  return Boolean(updated);
}

/**
 * Task 6.2: Start pickup mission (accepted -> in_progress, order: pickup_assigned -> pickup_in_progress).
 */
export async function startPickupMissionAtomic(
  missionId: string,
  courierId: string
): Promise<{ ok: boolean; error?: string }> {
  return await db.transaction(async (tx) => {
    const [mission] = await tx
      .select()
      .from(schema.missions)
      .where(and(eq(schema.missions.id, missionId), eq(schema.missions.courierId, courierId)))
      .limit(1);

    if (!mission) return { ok: false, error: "Mission introuvable" };
    if (mission.status === "in_progress") return { ok: true }; // Idempotent
    if (mission.status !== "accepted") {
      return { ok: false, error: `Statut de mission invalide (${mission.status})` };
    }

    const [order] = await tx
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.id, mission.orderId))
      .limit(1);

    if (!order) return { ok: false, error: "Commande introuvable" };

    await tx
      .update(schema.missions)
      .set({
        status: "in_progress",
        startedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schema.missions.id, missionId));

    if (order.status === "pickup_assigned") {
      await tx
        .update(schema.orders)
        .set({
          status: "pickup_in_progress",
          updatedAt: new Date(),
        })
        .where(eq(schema.orders.id, order.id));

      await tx.insert(schema.orderEvents).values({
        orderId: order.id,
        type: "status_change",
        fromStatus: "pickup_assigned",
        toStatus: "pickup_in_progress",
        actorId: courierId,
        actorRole: "courier",
        note: "Coursier en route pour la collecte",
      });
    }

    return { ok: true };
  });
}

/**
 * Task 6.2: Complete pickup mission with item count, condition notes, flags, and optional on-site approval.
 * AC 8: Count discrepancy triggers price adjustment.
 * AC 9: Flagged valuable or damaged items require photo.
 */
export async function completePickupMissionAtomic(params: {
  missionId: string;
  courierId: string;
  items: Array<{
    orderItemId: string;
    pickupQuantity: number;
    conditionNote?: string | null;
    isFlagged?: boolean;
  }>;
  onSiteApproved?: boolean;
  note?: string | null;
}): Promise<{ ok: boolean; error?: string; hasCountDiscrepancy?: boolean }> {
  return await db.transaction(async (tx) => {
    const [mission] = await tx
      .select()
      .from(schema.missions)
      .where(and(eq(schema.missions.id, params.missionId), eq(schema.missions.courierId, params.courierId)))
      .for("update")
      .limit(1);

    if (!mission) return { ok: false, error: "Mission introuvable" };
    if (mission.status === "completed") return { ok: true }; // Idempotent
    if (mission.type !== "pickup") {
      return { ok: false, error: "Type de mission invalide (collecte attendue)" };
    }
    if (mission.status !== "in_progress" && mission.status !== "accepted") {
      return { ok: false, error: "Statut de mission invalide pour la finalisation" };
    }

    const [order] = await tx
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.id, mission.orderId))
      .limit(1);

    if (!order) return { ok: false, error: "Commande introuvable" };

    // Fetch existing order items to check quantities and AC 9 photo requirements
    const existingItems = await tx
      .select()
      .from(schema.orderItems)
      .where(eq(schema.orderItems.orderId, order.id));

    const existingPhotos = await tx
      .select()
      .from(schema.orderPhotos)
      .where(eq(schema.orderPhotos.orderId, order.id));

    const photosByItem = new Set(
      existingPhotos.filter((p) => p.orderItemId).map((p) => p.orderItemId as string)
    );

    let hasCountDiscrepancy = false;

    for (const it of params.items) {
      const match = existingItems.find((e) => e.id === it.orderItemId);
      if (!match) continue;

      if (it.isFlagged) {
        // AC 9 check: must have at least one photo attached for this specific item
        const hasPhoto = photosByItem.has(it.orderItemId);
        if (!hasPhoto) {
          return {
            ok: false,
            error: "Au moins une photo est requise pour chaque article signalé précieux ou endommagé (AC 9)",
          };
        }
      }

      if (it.pickupQuantity !== match.declaredQuantity) {
        hasCountDiscrepancy = true;
      }

      await tx
        .update(schema.orderItems)
        .set({
          pickupQuantity: it.pickupQuantity,
          conditionNote: it.conditionNote ?? match.conditionNote,
          isFlagged: it.isFlagged ?? match.isFlagged,
        })
        .where(eq(schema.orderItems.id, it.orderItemId));
    }

    // Complete mission
    await tx
      .update(schema.missions)
      .set({
        status: "completed",
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schema.missions.id, params.missionId));

    // Update order status: pickup_in_progress -> picked_up
    await tx
      .update(schema.orders)
      .set({
        status: "picked_up",
        updatedAt: new Date(),
      })
      .where(eq(schema.orders.id, order.id));

    await tx.insert(schema.orderEvents).values({
      orderId: order.id,
      type: "status_change",
      fromStatus: order.status,
      toStatus: "picked_up",
      actorId: params.courierId,
      actorRole: "courier",
      note: params.note || (hasCountDiscrepancy ? "Collecte terminée avec écart de comptage" : "Collecte terminée avec succès"),
      payload: {
        hasCountDiscrepancy,
        onSiteApproved: Boolean(params.onSiteApproved),
      },
    });

    if (hasCountDiscrepancy && params.onSiteApproved) {
      await tx.insert(schema.orderEvents).values({
        orderId: order.id,
        type: "approval",
        actorId: params.courierId,
        actorRole: "courier",
        approvalMethod: "on_the_spot",
        note: "Accord sur place enregistré par le coursier avec le client (AC 8)",
      });
    }

    return { ok: true, hasCountDiscrepancy };
  });
}

/**
 * Task 6.2: Fail pickup mission with reason and increment failed attempt counter.
 */
export async function failPickupMissionAtomic(params: {
  missionId: string;
  courierId: string;
  reason: string;
}): Promise<{ ok: boolean; error?: string }> {
  return await db.transaction(async (tx) => {
    const [mission] = await tx
      .select()
      .from(schema.missions)
      .where(and(eq(schema.missions.id, params.missionId), eq(schema.missions.courierId, params.courierId)))
      .for("update")
      .limit(1);

    if (!mission) return { ok: false, error: "Mission introuvable" };
    if (mission.status === "failed") return { ok: true };
    if (mission.type !== "pickup") {
      return { ok: false, error: "Type de mission invalide (collecte attendue)" };
    }
    if (
      mission.status !== "assigned" &&
      mission.status !== "accepted" &&
      mission.status !== "in_progress"
    ) {
      return { ok: false, error: "Statut de mission invalide pour signaler un échec" };
    }

    const [order] = await tx
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.id, mission.orderId))
      .limit(1);

    if (!order) return { ok: false, error: "Commande introuvable" };

    await tx
      .update(schema.missions)
      .set({
        status: "failed",
        failureReason: params.reason,
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schema.missions.id, params.missionId));

    await tx
      .update(schema.orders)
      .set({
        status: "pickup_failed",
        failedPickupCount: sql`${schema.orders.failedPickupCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(schema.orders.id, order.id));

    await tx.insert(schema.orderEvents).values({
      orderId: order.id,
      type: "status_change",
      fromStatus: order.status,
      toStatus: "pickup_failed",
      actorId: params.courierId,
      actorRole: "courier",
      note: params.reason,
    });

    return { ok: true };
  });
}

/**
 * Task 6.3: Start delivery mission.
 * AC 13: Enforces courier cash ceiling lockout.
 */
export async function startDeliveryMissionAtomic(
  missionId: string,
  courierId: string
): Promise<{ ok: boolean; error?: string }> {
  return await db.transaction(async (tx) => {
    const [mission] = await tx
      .select()
      .from(schema.missions)
      .where(and(eq(schema.missions.id, missionId), eq(schema.missions.courierId, courierId)))
      .for("update")
      .limit(1);

    if (!mission) return { ok: false, error: "Mission introuvable" };
    if (mission.status === "in_progress") return { ok: true };
    if (mission.type !== "delivery") {
      return { ok: false, error: "Type de mission invalide (livraison attendue)" };
    }
    if (mission.status !== "assigned" && mission.status !== "accepted") {
      return { ok: false, error: "Statut de mission invalide pour le démarrage" };
    }

    // AC 13: Check courier held cash vs cash ceiling
    const [profile] = await tx
      .select()
      .from(schema.courierProfiles)
      .where(eq(schema.courierProfiles.userId, courierId))
      .limit(1);

    const ledgerEntries = await tx
      .select({
        entryType: schema.cashLedger.entryType,
        amount: schema.cashLedger.amount,
        currency: schema.cashLedger.currency,
        exchangeRateUsed: schema.orders.exchangeRateUsed,
      })
      .from(schema.cashLedger)
      .leftJoin(schema.orders, eq(schema.cashLedger.orderId, schema.orders.id))
      .where(eq(schema.cashLedger.courierId, courierId));

    let cashCollected = 0;
    let cashRemitted = 0;
    for (const entry of ledgerEntries) {
      const rate = Number(entry.exchangeRateUsed) || 2800;
      const amountCDF =
        entry.currency === "USD" ? Math.round(entry.amount * rate) : entry.amount;
      if (entry.entryType === "cash_collected") cashCollected += amountCDF;
      else if (entry.entryType === "cash_remitted") cashRemitted += amountCDF;
    }

    const cashHeld = Math.max(0, cashCollected - cashRemitted);

    const ceiling = profile?.cashCeiling ?? null;
    if (ceiling !== null && cashHeld >= ceiling) {
      return {
        ok: false,
        error: `Plafond de trésorerie dépassé (${cashHeld.toLocaleString()} / ${ceiling.toLocaleString()} CDF). Versement requis avant de démarrer une nouvelle livraison (AC 13).`,
      };
    }

    const [order] = await tx
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.id, mission.orderId))
      .limit(1);

    if (!order) return { ok: false, error: "Commande introuvable" };

    await tx
      .update(schema.missions)
      .set({
        status: "in_progress",
        startedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schema.missions.id, missionId));

    if (order.status === "delivery_assigned") {
      await tx
        .update(schema.orders)
        .set({
          status: "delivery_in_progress",
          updatedAt: new Date(),
        })
        .where(eq(schema.orders.id, order.id));

      await tx.insert(schema.orderEvents).values({
        orderId: order.id,
        type: "status_change",
        fromStatus: "delivery_assigned",
        toStatus: "delivery_in_progress",
        actorId: courierId,
        actorRole: "courier",
        note: "Coursier en route pour la livraison",
      });
    }

    return { ok: true };
  });
}

/**
 * Task 6.3: Complete delivery mission, check confirmation code, record cash collected, post ledger entry.
 * AC 12: Delivery completed, cash collected recorded in cash_ledger, discrepancy flagged if mismatch.
 */
export async function completeDeliveryMissionAtomic(params: {
  missionId: string;
  courierId: string;
  confirmationCode: string;
  cashCollected: number;
  cashCurrency?: "CDF" | "USD";
}): Promise<{ ok: boolean; error?: string; discrepancyFlagged?: boolean }> {
  return await db.transaction(async (tx) => {
    const [mission] = await tx
      .select()
      .from(schema.missions)
      .where(and(eq(schema.missions.id, params.missionId), eq(schema.missions.courierId, params.courierId)))
      .for("update")
      .limit(1);

    if (!mission) return { ok: false, error: "Mission introuvable" };
    if (mission.status === "completed") return { ok: true };
    if (mission.type !== "delivery") {
      return { ok: false, error: "Type de mission invalide (livraison attendue)" };
    }
    if (mission.status !== "in_progress" && mission.status !== "accepted") {
      return { ok: false, error: "Statut de mission invalide pour la finalisation" };
    }

    const [order] = await tx
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.id, mission.orderId))
      .limit(1);

    if (!order) return { ok: false, error: "Commande introuvable" };

    // Verify delivery confirmation code
    const enteredCode = params.confirmationCode.trim().toUpperCase();
    const expectedCode = (order.deliveryConfirmationCode || "").trim().toUpperCase();

    if (expectedCode && enteredCode !== expectedCode) {
      return {
        ok: false,
        error: "Code de confirmation de livraison invalide. Demandez le code au client.",
      };
    }

    const currency = params.cashCurrency || "CDF";
    const exchangeRate = Number(order.exchangeRateUsed) || 2800;
    const collectedInCDF =
      currency === "USD" ? Math.round(params.cashCollected * exchangeRate) : params.cashCollected;
    const expectedInCDF =
      order.paymentCurrency === "USD" ? Math.round(order.totalDue * exchangeRate) : order.totalDue;
    const discrepancyFlagged = collectedInCDF !== expectedInCDF;

    // Update mission
    await tx
      .update(schema.missions)
      .set({
        status: "completed",
        completedAt: new Date(),
        cashCollected: params.cashCollected,
        cashCurrency: currency,
        updatedAt: new Date(),
      })
      .where(eq(schema.missions.id, params.missionId));

    // Update order status: delivery_in_progress -> delivered
    await tx
      .update(schema.orders)
      .set({
        status: "delivered",
        updatedAt: new Date(),
      })
      .where(eq(schema.orders.id, order.id));

    // Set retention deadline (90 days) on order photos upon delivery completion
    const deleteAfter = new Date();
    deleteAfter.setDate(deleteAfter.getDate() + 90);
    await tx
      .update(schema.orderPhotos)
      .set({ deleteAfter })
      .where(eq(schema.orderPhotos.orderId, order.id));

    // Post to cash_ledger (AC 12)
    if (params.cashCollected > 0) {
      await tx.insert(schema.cashLedger).values({
        entryType: "cash_collected",
        orderId: order.id,
        missionId: params.missionId,
        courierId: params.courierId,
        houseId: order.houseId,
        currency,
        amount: params.cashCollected,
        note: discrepancyFlagged
          ? `Encaissé : ${params.cashCollected} ${currency} (Écart détecté vs dû : ${order.totalDue} ${currency})`
          : `Paiement à la livraison complet : ${params.cashCollected} ${currency}`,
        createdBy: params.courierId,
      });
    }

    // Write audit event
    await tx.insert(schema.orderEvents).values({
      orderId: order.id,
      type: "status_change",
      fromStatus: order.status,
      toStatus: "delivered",
      actorId: params.courierId,
      actorRole: "courier",
      note: `Livraison effectuée. Montant encaissé : ${params.cashCollected} ${currency}${discrepancyFlagged ? " [Écart signalé]" : ""}`,
      payload: {
        cashCollected: params.cashCollected,
        currency,
        totalDue: order.totalDue,
        discrepancyFlagged,
      },
    });

    return { ok: true, discrepancyFlagged };
  });
}

/**
 * Task 6.3: Fail delivery mission with reason and increment counter.
 */
export async function failDeliveryMissionAtomic(params: {
  missionId: string;
  courierId: string;
  reason: string;
}): Promise<{ ok: boolean; error?: string }> {
  return await db.transaction(async (tx) => {
    const [mission] = await tx
      .select()
      .from(schema.missions)
      .where(and(eq(schema.missions.id, params.missionId), eq(schema.missions.courierId, params.courierId)))
      .for("update")
      .limit(1);

    if (!mission) return { ok: false, error: "Mission introuvable" };
    if (mission.status === "failed") return { ok: true };
    if (mission.type !== "delivery") {
      return { ok: false, error: "Type de mission invalide (livraison attendue)" };
    }
    if (
      mission.status !== "assigned" &&
      mission.status !== "accepted" &&
      mission.status !== "in_progress"
    ) {
      return { ok: false, error: "Statut de mission invalide pour signaler un échec" };
    }

    const [order] = await tx
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.id, mission.orderId))
      .limit(1);

    if (!order) return { ok: false, error: "Commande introuvable" };

    await tx
      .update(schema.missions)
      .set({
        status: "failed",
        failureReason: params.reason,
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schema.missions.id, params.missionId));

    await tx
      .update(schema.orders)
      .set({
        status: "delivery_failed",
        failedDeliveryCount: sql`${schema.orders.failedDeliveryCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(schema.orders.id, order.id));

    await tx.insert(schema.orderEvents).values({
      orderId: order.id,
      type: "status_change",
      fromStatus: order.status,
      toStatus: "delivery_failed",
      actorId: params.courierId,
      actorRole: "courier",
      note: params.reason,
    });

    return { ok: true };
  });
}

/**
 * Task 6.4: Retrieve courier cash held, ceiling, settlements, and breakdown of amounts owed to parties.
 */
export async function getCourierCashOverview(
  courierId: string
): Promise<CourierCashOverview> {
  const [profile] = await db
    .select()
    .from(schema.courierProfiles)
    .where(eq(schema.courierProfiles.userId, courierId))
    .limit(1);

  const ledgerRows = await db
    .select({
      entryType: schema.cashLedger.entryType,
      amount: schema.cashLedger.amount,
      currency: schema.cashLedger.currency,
      exchangeRateUsed: schema.orders.exchangeRateUsed,
    })
    .from(schema.cashLedger)
    .leftJoin(schema.orders, eq(schema.cashLedger.orderId, schema.orders.id))
    .where(eq(schema.cashLedger.courierId, courierId));

  let cashCollected = 0;
  let cashRemitted = 0;
  for (const row of ledgerRows) {
    const rate = Number(row.exchangeRateUsed) || 2800;
    const amountCDF =
      row.currency === "USD" ? Math.round(row.amount * rate) : row.amount;
    if (row.entryType === "cash_collected") cashCollected += amountCDF;
    else if (row.entryType === "cash_remitted") cashRemitted += amountCDF;
  }

  const cashHeld = Math.max(0, cashCollected - cashRemitted);
  const cashCeiling = profile?.cashCeiling ?? null;

  // Breakdown of amounts owed to parties for delivered orders where this courier collected cash
  const ordersDelivered = await db
    .select({
      itemsTotal: schema.orders.itemsTotal,
      adjustedItemsTotal: schema.orders.adjustedItemsTotal,
      commissionAmount: schema.orders.commissionAmount,
      deliveryFee: schema.orders.deliveryFee,
      totalDue: schema.orders.totalDue,
    })
    .from(schema.missions)
    .innerJoin(schema.orders, eq(schema.missions.orderId, schema.orders.id))
    .where(
      and(
        eq(schema.missions.courierId, courierId),
        eq(schema.missions.type, "delivery"),
        eq(schema.missions.status, "completed")
      )
    );

  let owedToHouses = 0;
  let owedToOwner = 0;

  for (const o of ordersDelivered) {
    const finalItemsTotal = o.adjustedItemsTotal ?? o.itemsTotal;
    owedToHouses += Math.max(0, finalItemsTotal - o.commissionAmount);
    owedToOwner += o.commissionAmount + o.deliveryFee;
  }

  const recentLedger = await db
    .select({
      id: schema.cashLedger.id,
      entryType: schema.cashLedger.entryType,
      amount: schema.cashLedger.amount,
      currency: schema.cashLedger.currency,
      orderId: schema.cashLedger.orderId,
      note: schema.cashLedger.note,
      createdAt: schema.cashLedger.createdAt,
    })
    .from(schema.cashLedger)
    .where(eq(schema.cashLedger.courierId, courierId))
    .orderBy(desc(schema.cashLedger.createdAt))
    .limit(20);

  return {
    courierId,
    cashHeld,
    cashCollected,
    cashRemitted,
    cashCeiling,
    securityDeposit: profile?.securityDeposit ?? 0,
    changeFloat: profile?.changeFloat ?? 0,
    isCeilingExceeded: cashCeiling !== null && cashHeld >= cashCeiling,
    owedToHouses,
    owedToOwner,
    recentLedgerEntries: recentLedger,
  };
}

/**
 * Task 6.4: Retrieve courier past missions and earnings.
 */
export async function getCourierHistory(
  courierId: string
): Promise<CourierHistoryData> {
  const customerNeighborhoods = alias(schema.neighborhoods, "c_neigh_hist");

  const rows = await db
    .select({
      id: schema.missions.id,
      orderId: schema.missions.orderId,
      orderCode: schema.orders.code,
      type: schema.missions.type,
      status: schema.missions.status,
      slotStart: schema.missions.slotStart,
      completedAt: schema.missions.completedAt,
      courierPay: schema.missions.courierPay,
      customerNeighborhood: customerNeighborhoods.name,
      failureReason: schema.missions.failureReason,
    })
    .from(schema.missions)
    .innerJoin(schema.orders, eq(schema.missions.orderId, schema.orders.id))
    .leftJoin(customerNeighborhoods, eq(schema.orders.neighborhoodId, customerNeighborhoods.id))
    .where(
      and(
        eq(schema.missions.courierId, courierId),
        inArray(schema.missions.status, ["completed", "failed"])
      )
    )
    .orderBy(desc(schema.missions.completedAt), desc(schema.missions.slotStart));

  let totalEarningsCDF = 0;
  let completedCount = 0;
  let failedCount = 0;

  for (const r of rows) {
    if (r.status === "completed") {
      completedCount++;
      totalEarningsCDF += r.courierPay || 0;
    } else if (r.status === "failed") {
      failedCount++;
    }
  }

  return {
    missions: rows.map((r) => ({
      id: r.id,
      orderId: r.orderId,
      orderCode: r.orderCode,
      type: r.type,
      status: r.status,
      slotStart: r.slotStart,
      completedAt: r.completedAt,
      courierPay: r.courierPay,
      customerNeighborhood: r.customerNeighborhood || "Bukavu",
      failureReason: r.failureReason,
    })),
    totalEarningsCDF,
    completedCount,
    failedCount,
  };
}

/**
 * Add photo record to order_photos (e.g. pickup condition, delivery proof).
 */
export async function addOrderPhotoRecord(params: {
  orderId: string;
  storageKey: string;
  type: "pickup_condition" | "delivery_proof" | "dispute";
  takenBy: string;
  orderItemId?: string | null;
  missionId?: string | null;
  sizeBytes?: number;
}): Promise<string> {
  const [created] = await db
    .insert(schema.orderPhotos)
    .values({
      orderId: params.orderId,
      orderItemId: params.orderItemId ?? null,
      missionId: params.missionId ?? null,
      type: params.type,
      storageKey: params.storageKey,
      sizeBytes: params.sizeBytes ?? null,
      takenBy: params.takenBy,
    })
    .returning({ id: schema.orderPhotos.id });

  return created!.id;
}

