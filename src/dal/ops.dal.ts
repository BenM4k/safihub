import "server-only";
import { and, count, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db, escapeLikePattern, schema } from "./db";
import {
  clampExportLimit,
  clampExportOffset,
  DEFAULT_EXPORT_LIMIT,
  MAX_EXPORT_LIMIT,
} from "@/lib/export-limits";

export { clampExportLimit, clampExportOffset, DEFAULT_EXPORT_LIMIT, MAX_EXPORT_LIMIT };
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
    // Insert defaults if missing (conflict-safe under concurrent calls)
    const [inserted] = await db
      .insert(schema.settings)
      .values({ id: 1 })
      .onConflictDoNothing({ target: schema.settings.id })
      .returning();

    if (inserted) {
      return inserted;
    }

    const [existing] = await db
      .select()
      .from(schema.settings)
      .where(eq(schema.settings.id, 1))
      .limit(1);
    return existing!;
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
  const [
    statusCounts,
    [activeHouses],
    [activeCouriers],
    [pendingCoverage],
    [unassignedMissions],
    [disputesCount],
    criteria,
  ] = await Promise.all([
    db
      .select({
        status: schema.orders.status,
        count: sql<number>`count(*)::int`,
      })
      .from(schema.orders)
      .groupBy(schema.orders.status),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.houses)
      .where(eq(schema.houses.isActive, true)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.courierProfiles)
      .innerJoin(schema.user, eq(schema.courierProfiles.userId, schema.user.id))
      .where(
        and(
          eq(schema.courierProfiles.isActive, true),
          eq(schema.user.status, "active")
        )
      ),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.coverageRequests)
      .where(sql`${schema.coverageRequests.notifiedAt} is null`),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.missions)
      .where(eq(schema.missions.status, "unassigned")),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.disputes)
      .where(eq(schema.disputes.status, "open")),
    getSuccessCriteriaDashboard(),
  ]);

  const ordersByStatus: Record<string, number> = {};
  let totalOrders = 0;
  for (const row of statusCounts) {
    ordersByStatus[row.status] = Number(row.count);
    totalOrders += Number(row.count);
  }

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

export interface AdminExportQueryOptions {
  limit?: number;
  offset?: number;
  probeExtraRow?: boolean;
}

export async function getAdminOrdersExportData(options?: AdminExportQueryOptions) {
  const effectiveLimit = clampExportLimit(options?.limit);
  const queryLimit = options?.probeExtraRow ? effectiveLimit + 1 : effectiveLimit;
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
    .orderBy(desc(schema.orders.createdAt))
    .limit(queryLimit)
    .offset(clampExportOffset(options?.offset));
}

export async function getAdminLedgerExportData(options?: AdminExportQueryOptions) {
  const effectiveLimit = clampExportLimit(options?.limit);
  const queryLimit = options?.probeExtraRow ? effectiveLimit + 1 : effectiveLimit;
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
    .orderBy(desc(schema.cashLedger.createdAt))
    .limit(queryLimit)
    .offset(clampExportOffset(options?.offset));
}

export async function getAdminCustomersExportData(options?: AdminExportQueryOptions) {
  const effectiveLimit = clampExportLimit(options?.limit);
  const queryLimit = options?.probeExtraRow ? effectiveLimit + 1 : effectiveLimit;
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
    .orderBy(desc(schema.user.createdAt))
    .limit(queryLimit)
    .offset(clampExportOffset(options?.offset));
}

export interface AdminDisputeRecord {
  id: string;
  orderId: string;
  orderCode: string | null;
  openedBy: string;
  type: string;
  description: string;
  status: string;
  resolution: string | null;
  compensationAmount: number | null;
  currency: string;
  resolvedAt: Date | null;
  createdAt: Date;
}

export async function getAdminDisputes(): Promise<AdminDisputeRecord[]> {
  return await db
    .select({
      id: schema.disputes.id,
      orderId: schema.disputes.orderId,
      orderCode: schema.orders.code,
      openedBy: schema.disputes.openedBy,
      type: schema.disputes.type,
      description: schema.disputes.description,
      status: schema.disputes.status,
      resolution: schema.disputes.resolution,
      compensationAmount: schema.disputes.compensationAmount,
      currency: schema.disputes.currency,
      resolvedAt: schema.disputes.resolvedAt,
      createdAt: schema.disputes.createdAt,
    })
    .from(schema.disputes)
    .leftJoin(schema.orders, eq(schema.disputes.orderId, schema.orders.id))
    .orderBy(desc(schema.disputes.createdAt));
}

export interface PaginatedAdminDisputesResult {
  disputes: AdminDisputeRecord[];
  totalCount: number;
  openCount: number;
  resolvedCount: number;
  totalAllCount: number;
  page: number;
  pageSize: number;
}

export async function getAdminDisputesPaginated(params: {
  search?: string;
  status?: "all" | "open" | "resolved";
  page?: number;
  pageSize?: number;
}): Promise<PaginatedAdminDisputesResult> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, params.pageSize ?? 10));
  const status = params.status ?? "all";
  const search = params.search?.trim() ?? "";

  const conditions = [];
  if (status === "open" || status === "resolved") {
    conditions.push(eq(schema.disputes.status, status));
  }

  if (search) {
    const q = `%${escapeLikePattern(search)}%`;
    conditions.push(
      or(
        ilike(schema.disputes.description, q),
        ilike(schema.orders.code, q),
        sql`${schema.disputes.type}::text ilike ${q}`
      )
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [[filteredCount], [statusCounts]] = await Promise.all([
    db
      .select({ total: count() })
      .from(schema.disputes)
      .leftJoin(schema.orders, eq(schema.disputes.orderId, schema.orders.id))
      .where(whereClause),
    db
      .select({
        totalAllCount: sql<number>`count(*)::int`,
        openCount: sql<number>`count(*) filter (where ${schema.disputes.status} = 'open')::int`,
        resolvedCount: sql<number>`count(*) filter (where ${schema.disputes.status} = 'resolved')::int`,
      })
      .from(schema.disputes),
  ]);

  const totalCount = Number(filteredCount?.total ?? 0);
  const totalPages = totalCount > 0 ? Math.ceil(totalCount / pageSize) : 1;
  const effectivePage = totalCount > 0 ? Math.min(page, totalPages) : 1;
  const offset = (effectivePage - 1) * pageSize;

  const rows = await db
    .select({
      id: schema.disputes.id,
      orderId: schema.disputes.orderId,
      orderCode: schema.orders.code,
      openedBy: schema.disputes.openedBy,
      type: schema.disputes.type,
      description: schema.disputes.description,
      status: schema.disputes.status,
      resolution: schema.disputes.resolution,
      compensationAmount: schema.disputes.compensationAmount,
      currency: schema.disputes.currency,
      resolvedAt: schema.disputes.resolvedAt,
      createdAt: schema.disputes.createdAt,
    })
    .from(schema.disputes)
    .leftJoin(schema.orders, eq(schema.disputes.orderId, schema.orders.id))
    .where(whereClause)
    .orderBy(desc(schema.disputes.createdAt), desc(schema.disputes.id))
    .limit(pageSize)
    .offset(offset);

  return {
    disputes: rows,
    totalCount,
    openCount: statusCounts?.openCount ?? 0,
    resolvedCount: statusCounts?.resolvedCount ?? 0,
    totalAllCount: statusCounts?.totalAllCount ?? 0,
    page: effectivePage,
    pageSize,
  };
}

export async function resolveAdminDisputeTransaction(params: {
  disputeId: string;
  resolution: string;
  compensationAmount?: number | null;
  currency?: "CDF" | "USD";
  adminId: string;
}): Promise<
  | { status: "not_found" }
  | { status: "already_resolved" }
  | { status: "resolved"; orderId: string; resolvedAt: Date }
> {
  return await db.transaction(async (tx) => {
    const [locked] = await tx
      .select({
        id: schema.disputes.id,
        orderId: schema.disputes.orderId,
        status: schema.disputes.status,
        currency: schema.disputes.currency,
      })
      .from(schema.disputes)
      .where(eq(schema.disputes.id, params.disputeId))
      .for("update");

    if (!locked) {
      return { status: "not_found" as const };
    }

    if (locked.status !== "open") {
      return { status: "already_resolved" as const };
    }

    const resolvedAt = new Date();
    const resolvedCurrency = params.currency ?? locked.currency;

    await tx
      .update(schema.disputes)
      .set({
        status: "resolved",
        resolution: params.resolution,
        compensationAmount: params.compensationAmount ?? null,
        currency: resolvedCurrency,
        resolvedBy: params.adminId,
        resolvedAt,
      })
      .where(eq(schema.disputes.id, params.disputeId));

    await tx.insert(schema.orderEvents).values({
      orderId: locked.orderId,
      type: "note",
      actorId: params.adminId,
      actorRole: "admin",
      recordedBy: params.adminId,
      note: params.resolution,
      payload: {
        category: "dispute_resolved",
        disputeId: params.disputeId,
        compensationAmount: params.compensationAmount ?? null,
        currency: resolvedCurrency,
      },
    });

    return {
      status: "resolved" as const,
      orderId: locked.orderId,
      resolvedAt,
    };
  });
}

