import "server-only";
import { desc, eq, sql } from "drizzle-orm";
import { db, schema } from "./db";
import { getSuccessCriteriaDashboard } from "./cash-ledger.dal";

export interface SettingsRecord {
  id: number;
  defaultCommissionBps: number;
  acceptanceDelayMinutes: number;
  acceptanceReminderPercent: number;
  acceptanceEscalationPercent: number;
  receptionWindowMinutes: number;
  slotLengthMinutes: number;
  maxCoverageDistanceLevel: number;
  defaultCashCeiling: number | null;
  defaultCourierPayPerLeg: number | null;
  firstOrderScreening: boolean;
  maxOpenOrdersPerCustomer: number;
  maxItemsPerOrder: number;
  maxFreeTextLines: number;
  failedPickupBlockThreshold: number;
  photoRetentionDays: number;
  timezone: string;
  updatedAt: Date | null;
}

export interface ExchangeRateRecord {
  id: string;
  baseCurrency: "CDF" | "USD";
  quoteCurrency: "CDF" | "USD";
  rate: string;
  effectiveDate: string;
  setBy: string | null;
  createdAt: Date;
}

export interface AdminDashboardMetrics {
  totalOrders: number;
  ordersByStatus: Record<string, number>;
  ordersPendingAcceptance: number;
  activeDisputes: number;
  pendingCoverageRequests: number;
  activeHousesCount: number;
  activeCouriersCount: number;
  totalCashCollectedCDF: number;
  unassignedMissionsCount: number;
  ordersPerWeek: number;
  acceptanceRatePercent: number;
  marginPerOrderCDF: number;
  cashDiscrepanciesCount: number;
  cashDiscrepancyPercent: number;
  disputeRatePercent: number;
  adminMinutesPerOrder: number | null;
}

export async function getSettings(): Promise<SettingsRecord> {
  const [row] = await db
    .select()
    .from(schema.settings)
    .where(eq(schema.settings.id, 1))
    .limit(1);

  if (!row) {
    // Insert defaults if missing
    const [inserted] = await db
      .insert(schema.settings)
      .values({ id: 1 })
      .returning();
    return inserted!;
  }

  return row;
}

export async function updateSettings(
  data: Partial<Omit<SettingsRecord, "id" | "updatedAt">>
): Promise<SettingsRecord> {
  const [updated] = await db
    .update(schema.settings)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(schema.settings.id, 1))
    .returning();

  return updated!;
}

export async function getExchangeRates(limit = 20): Promise<ExchangeRateRecord[]> {
  const rows = await db
    .select()
    .from(schema.exchangeRates)
    .orderBy(desc(schema.exchangeRates.effectiveDate), desc(schema.exchangeRates.createdAt))
    .limit(limit);

  return rows as ExchangeRateRecord[];
}

export async function getLatestExchangeRate(
  baseCurrency: "CDF" | "USD" = "USD",
  quoteCurrency: "CDF" | "USD" = "CDF"
): Promise<ExchangeRateRecord | null> {
  const [row] = await db
    .select()
    .from(schema.exchangeRates)
    .where(
      sql`${schema.exchangeRates.baseCurrency} = ${baseCurrency} and ${schema.exchangeRates.quoteCurrency} = ${quoteCurrency}`
    )
    .orderBy(desc(schema.exchangeRates.effectiveDate), desc(schema.exchangeRates.createdAt))
    .limit(1);

  return (row as ExchangeRateRecord) ?? null;
}

export async function createExchangeRate(data: {
  baseCurrency: "CDF" | "USD";
  quoteCurrency: "CDF" | "USD";
  rate: string;
  effectiveDate: string;
  setBy?: string | null;
}): Promise<ExchangeRateRecord> {
  const [created] = await db
    .insert(schema.exchangeRates)
    .values({
      baseCurrency: data.baseCurrency,
      quoteCurrency: data.quoteCurrency,
      rate: data.rate,
      effectiveDate: data.effectiveDate,
      setBy: data.setBy ?? null,
    })
    .onConflictDoUpdate({
      target: [
        schema.exchangeRates.baseCurrency,
        schema.exchangeRates.quoteCurrency,
        schema.exchangeRates.effectiveDate,
      ],
      set: {
        rate: data.rate,
        setBy: data.setBy ?? null,
      },
    })
    .returning();

  return created as ExchangeRateRecord;
}

export async function getAdminDashboardMetrics(): Promise<AdminDashboardMetrics> {
  const statusCounts = await db
    .select({
      status: schema.orders.status,
      count: sql<number>`count(*)::int`,
    })
    .from(schema.orders)
    .groupBy(schema.orders.status);

  const ordersByStatus: Record<string, number> = {};
  let totalOrders = 0;
  for (const row of statusCounts) {
    ordersByStatus[row.status] = Number(row.count);
    totalOrders += Number(row.count);
  }

  const [activeHouses] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.houses)
    .where(eq(schema.houses.isActive, true));

  const [activeCouriers] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.courierProfiles)
    .where(eq(schema.courierProfiles.isActive, true));

  const [pendingCoverage] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.coverageRequests)
    .where(sql`${schema.coverageRequests.notifiedAt} is null`);

  const [unassignedMissions] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.missions)
    .where(eq(schema.missions.status, "unassigned"));

  const [disputesCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.disputes)
    .where(eq(schema.disputes.status, "open"));

  const criteria = await getSuccessCriteriaDashboard();

  return {
    totalOrders,
    ordersByStatus,
    ordersPendingAcceptance: ordersByStatus["created"] || 0,
    activeDisputes: disputesCount?.count ?? 0,
    pendingCoverageRequests: pendingCoverage?.count ?? 0,
    activeHousesCount: activeHouses?.count ?? 0,
    activeCouriersCount: activeCouriers?.count ?? 0,
    totalCashCollectedCDF: criteria.totalCollectedCashCDF,
    unassignedMissionsCount: unassignedMissions?.count ?? 0,
    ordersPerWeek: criteria.ordersPerWeek,
    acceptanceRatePercent: criteria.acceptanceRatePercent,
    marginPerOrderCDF: criteria.marginPerOrderCDF,
    cashDiscrepanciesCount: criteria.cashDiscrepanciesCount,
    cashDiscrepancyPercent: criteria.cashDiscrepancyPercent,
    disputeRatePercent: criteria.disputeRatePercent,
    adminMinutesPerOrder: criteria.adminMinutesPerOrder,
  };
}

export async function getAdminOrdersExportData() {
  return await db
    .select({
      id: schema.orders.id,
      code: schema.orders.code,
      status: schema.orders.status,
      source: schema.orders.source,
      totalDue: schema.orders.totalDue,
      currency: schema.orders.currency,
      itemsTotal: schema.orders.itemsTotal,
      deliveryFee: schema.orders.deliveryFee,
      commissionAmount: schema.orders.commissionAmount,
      customerName: schema.user.name,
      customerPhone: schema.orders.contactPhone,
      houseName: schema.houses.name,
      neighborhoodName: schema.neighborhoods.name,
      pickupSlotStart: schema.orders.pickupSlotStart,
      pickupSlotEnd: schema.orders.pickupSlotEnd,
      deliverySlotStart: schema.orders.deliverySlotStart,
      deliverySlotEnd: schema.orders.deliverySlotEnd,
      createdAt: schema.orders.createdAt,
    })
    .from(schema.orders)
    .leftJoin(schema.user, eq(schema.orders.customerId, schema.user.id))
    .leftJoin(schema.houses, eq(schema.orders.houseId, schema.houses.id))
    .leftJoin(
      schema.neighborhoods,
      eq(schema.orders.neighborhoodId, schema.neighborhoods.id)
    )
    .orderBy(desc(schema.orders.createdAt));
}

export async function getAdminLedgerExportData() {
  return await db
    .select({
      id: schema.cashLedger.id,
      entryType: schema.cashLedger.entryType,
      amount: schema.cashLedger.amount,
      currency: schema.cashLedger.currency,
      orderId: schema.cashLedger.orderId,
      courierId: schema.cashLedger.courierId,
      houseId: schema.cashLedger.houseId,
      note: schema.cashLedger.note,
      createdAt: schema.cashLedger.createdAt,
    })
    .from(schema.cashLedger)
    .orderBy(desc(schema.cashLedger.createdAt));
}

export async function getAdminCustomersExportData() {
  return await db
    .select({
      id: schema.user.id,
      name: schema.user.name,
      email: schema.user.email,
      contactPhone: schema.user.contactPhone,
      status: schema.user.status,
      isGuest: schema.user.isGuest,
      createdAt: schema.user.createdAt,
    })
    .from(schema.user)
    .where(eq(schema.user.role, "customer"))
    .orderBy(desc(schema.user.createdAt));
}
