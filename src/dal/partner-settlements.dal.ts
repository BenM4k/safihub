import "server-only";

import { and, desc, eq, inArray, notInArray, sql } from "drizzle-orm";
import { db, schema } from "./db";
import { err, ok, type Result } from "@/lib/result";
import type {
  PartnerDeliveredOrderDTO,
  PartnerPayoutDTO,
  PartnerSettlementAlertsData,
  PartnerSettlementHeroData,
  PartnerSettlementKpiData,
  PartnerSettlementsPageData,
  PeriodType,
} from "@/types/partner-settlements";

import { toBukavuDateTime } from "@/services/availability/bukavu-time";

export interface GetPartnerSettlementsParams {
  houseId: string;
  period?: PeriodType;
  from?: string;
  to?: string;
}

const BUKAVU_OFFSET_MS = 2 * 60 * 60 * 1000;

/**
 * Computes date bounds in Africa/Lubumbashi (UTC+2) for consistent Bukavu business days.
 */
export function computePeriodBounds(
  period: PeriodType = "month",
  customFrom?: string,
  customTo?: string,
  now: Date = new Date()
): {
  start: Date;
  end: Date;
  prevStart: Date;
  prevEnd: Date;
} {
  const bukavuNow = toBukavuDateTime(now);

  if (period === "custom" && customFrom && customTo) {
    const start = new Date(`${customFrom}T00:00:00.000+02:00`);
    const end = new Date(`${customTo}T23:59:59.999+02:00`);
    const durationMs = Math.max(86400000, end.getTime() - start.getTime());
    const prevEnd = new Date(start.getTime() - 1);
    const prevStart = new Date(prevEnd.getTime() - durationMs);
    return { start, end, prevStart, prevEnd };
  }

  if (period === "week") {
    // Current week: Monday 00:00 to Sunday 23:59:59 in Bukavu (weekday: 1=Mon ... 7=Sun)
    const diffToMonday = 1 - bukavuNow.weekday;
    const startMs =
      Date.UTC(bukavuNow.year, bukavuNow.month - 1, bukavuNow.day + diffToMonday, 0, 0, 0, 0) -
      BUKAVU_OFFSET_MS;
    const start = new Date(startMs);
    const end = new Date(startMs + 7 * 86400000 - 1);

    const prevStart = new Date(startMs - 7 * 86400000);
    const prevEnd = new Date(startMs - 1);

    return { start, end, prevStart, prevEnd };
  }

  if (period === "last30") {
    // Exactly 30 calendar days ending at end of today in Bukavu
    const endMs =
      Date.UTC(bukavuNow.year, bukavuNow.month - 1, bukavuNow.day, 23, 59, 59, 999) -
      BUKAVU_OFFSET_MS;
    const startMs = endMs - 30 * 86400000 + 1;
    const start = new Date(startMs);
    const end = new Date(endMs);

    const prevEnd = new Date(startMs - 1);
    const prevStart = new Date(prevEnd.getTime() - 30 * 86400000 + 1);
    return { start, end, prevStart, prevEnd };
  }

  // Default: "month"
  const startMs =
    Date.UTC(bukavuNow.year, bukavuNow.month - 1, 1, 0, 0, 0, 0) - BUKAVU_OFFSET_MS;
  const nextMonthMs =
    Date.UTC(bukavuNow.year, bukavuNow.month, 1, 0, 0, 0, 0) - BUKAVU_OFFSET_MS;
  const start = new Date(startMs);
  const end = new Date(nextMonthMs - 1);

  const prevStartMs =
    Date.UTC(bukavuNow.year, bukavuNow.month - 2, 1, 0, 0, 0, 0) - BUKAVU_OFFSET_MS;
  const prevStart = new Date(prevStartMs);
  const prevEnd = new Date(startMs - 1);

  return { start, end, prevStart, prevEnd };
}

import { maskPhoneNumber } from "@/lib/phone-utils";
export { maskPhoneNumber };


/**
 * Calculates next upcoming settlement date (Mondays weekly in Bukavu).
 */
export function getNextPayoutDate(now: Date = new Date()): string {
  const bukavuNow = toBukavuDateTime(now);
  // Monday is 1 in BukavuDateTime (1=Mon ... 7=Sun)
  const daysUntilNextMonday = ((1 + 7 - bukavuNow.weekday) % 7) || 7;
  const nextMondayMs =
    Date.UTC(bukavuNow.year, bukavuNow.month - 1, bukavuNow.day + daysUntilNextMonday, 0, 0, 0, 0) -
    BUKAVU_OFFSET_MS;
  const nextMonday = new Date(nextMondayMs);

  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Africa/Lubumbashi",
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(nextMonday);
}

/**
 * Fetches comprehensive, strictly house-scoped settlement earnings data for the Partner portal.
 */
export async function getPartnerSettlementsData(
  params: GetPartnerSettlementsParams
): Promise<PartnerSettlementsPageData> {
  const { houseId, period = "month", from, to } = params;

  // 1. House details
  const [house] = await db
    .select({
      id: schema.houses.id,
      name: schema.houses.name,
      slug: schema.houses.slug,
      contactPhone: schema.houses.contactPhone,
      commissionBps: schema.houses.commissionBps,
    })
    .from(schema.houses)
    .where(eq(schema.houses.id, houseId))
    .limit(1);

  if (!house) throw new Error("Pressing introuvable");

  const now = new Date();
  const { start, end, prevStart, prevEnd } = computePeriodBounds(period, from, to, now);

  // Subquery for reversed entries
  const reversedSubquery = db
    .select({ id: schema.cashLedger.reversalOfId })
    .from(schema.cashLedger)
    .where(
      and(
        eq(schema.cashLedger.entryType, "reversal"),
        sql`${schema.cashLedger.reversalOfId} is not null`
      )
    );

  // 2. Fetch all settlements for this house
  const rawSettlements = await db
    .select({
      id: schema.cashLedger.id,
      amount: schema.cashLedger.amount,
      currency: schema.cashLedger.currency,
      note: schema.cashLedger.note,
      createdAt: schema.cashLedger.createdAt,
    })
    .from(schema.cashLedger)
    .where(
      and(
        eq(schema.cashLedger.houseId, houseId),
        eq(schema.cashLedger.entryType, "house_settlement_paid"),
        notInArray(schema.cashLedger.id, reversedSubquery)
      )
    )
    .orderBy(desc(schema.cashLedger.createdAt));

  // Check reversed settlements for alerts
  const reversedSettlements = await db
    .select({
      id: schema.cashLedger.id,
      note: schema.cashLedger.note,
    })
    .from(schema.cashLedger)
    .where(
      and(
        eq(schema.cashLedger.houseId, houseId),
        eq(schema.cashLedger.entryType, "house_settlement_paid"),
        inArray(schema.cashLedger.id, reversedSubquery)
      )
    );

  // 3. Fetch all delivered orders for this house
  const rawOrders = await db
    .select({
      id: schema.orders.id,
      code: schema.orders.code,
      itemsTotal: schema.orders.itemsTotal,
      adjustedItemsTotal: schema.orders.adjustedItemsTotal,
      commissionAmount: schema.orders.commissionAmount,
      commissionBps: schema.orders.commissionBps,
      updatedAt: schema.orders.updatedAt,
      deliveredAt: schema.orders.deliverySlotEnd,
      customerRawName: schema.user.name,
      disputeId: schema.disputes.id,
      disputeStatus: schema.disputes.status,
    })
    .from(schema.orders)
    .innerJoin(schema.user, eq(schema.orders.customerId, schema.user.id))
    .leftJoin(
      schema.disputes,
      and(
        eq(schema.disputes.orderId, schema.orders.id),
        eq(schema.disputes.status, "open")
      )
    )
    .where(
      and(
        eq(schema.orders.houseId, houseId),
        eq(schema.orders.status, "delivered")
      )
    )
    .orderBy(desc(schema.orders.updatedAt));

  // 4. FIFO settlement-to-order reconciliation
  // Sort delivered orders chronologically (oldest delivery first)
  const chronologicalOrders = [...rawOrders].sort((a, b) => {
    const timeA = new Date(a.deliveredAt || a.updatedAt).getTime();
    const timeB = new Date(b.deliveredAt || b.updatedAt).getTime();
    return timeA - timeB;
  });

  // Sort settlements chronologically (oldest first)
  const chronologicalSettlements = [...rawSettlements].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const orderSettlementMap = new Map<
    string,
    { settlementId: string; settlementRef: string; status: "settled" }
  >();

  const settlementOrdersMap = new Map<
    string,
    Array<{
      id: string;
      code: string;
      shortReference: string;
      customerDisplayName: string;
      netAmount: number;
      deliveredAt: string | null;
    }>
  >();

  let settlementIdx = 0;
  let availableSettlementFunds = 0;

  for (const order of chronologicalOrders) {
    if (order.disputeId && order.disputeStatus === "open") {
      // Disputed orders are held and not settled
      continue;
    }

    const netOwed = Math.max(
      0,
      (order.adjustedItemsTotal ?? order.itemsTotal) - order.commissionAmount
    );

    // Accumulate settlement amounts in chronological order until they cover netOwed
    while (availableSettlementFunds < netOwed && settlementIdx < chronologicalSettlements.length) {
      availableSettlementFunds += chronologicalSettlements[settlementIdx].amount;
      settlementIdx++;
    }

    if (availableSettlementFunds >= netOwed) {
      availableSettlementFunds -= netOwed;
      const activeSettlement = chronologicalSettlements[Math.max(0, settlementIdx - 1)];
      const refMatch =
        activeSettlement.note?.match(/\[RÉF:\s*([^\]]+)\]/i) ||
        activeSettlement.note?.match(/Réf[^\w]*([a-zA-Z0-9_-]+)/i);
      const refStr = refMatch ? refMatch[1] : `#${activeSettlement.id.slice(0, 8)}`;

      orderSettlementMap.set(order.id, {
        settlementId: activeSettlement.id,
        settlementRef: refStr,
        status: "settled",
      });

      // Add to settlement included orders
      const rawName = (order.customerRawName ?? "").trim();
      const parts = rawName.split(" ").filter(Boolean);
      const firstName = parts[0] || "Client";
      const initial = parts.length > 1 ? ` ${parts[1][0]}.` : "";
      const customerDisplayName = `${firstName}${initial}`;

      const existingList = settlementOrdersMap.get(activeSettlement.id) || [];
      existingList.push({
        id: order.id,
        code: order.code,
        shortReference: order.code.replace(/^SF-/, "#"),
        customerDisplayName,
        netAmount: netOwed,
        deliveredAt: (order.deliveredAt || order.updatedAt)?.toISOString() ?? null,
      });
      settlementOrdersMap.set(activeSettlement.id, existingList);
    } else {
      // Stop allocating subsequent orders when available funds cannot cover next order
      break;
    }
  }

  // 5. Build DTOs
  const SETTLEMENT_OVERDUE_DAYS_THRESHOLD = 7;
  let oldestUnsettledDays: number | null = null;
  let overdueOrdersCount = 0;

  const ordersDTO: PartnerDeliveredOrderDTO[] = rawOrders.map((o) => {
    const finalItems = o.adjustedItemsTotal ?? o.itemsTotal;
    const net = Math.max(0, finalItems - o.commissionAmount);
    const isDisputed = Boolean(o.disputeId && o.disputeStatus === "open");
    const settledInfo = orderSettlementMap.get(o.id);

    let settlementStatus: "pending" | "settled" | "disputed" = "pending";
    if (isDisputed) {
      settlementStatus = "disputed";
    } else if (settledInfo) {
      settlementStatus = "settled";
    } else {
      settlementStatus = "pending";
      const deliveryDate = o.deliveredAt || o.updatedAt;
      if (deliveryDate) {
        const days = Math.max(
          0,
          Math.floor((now.getTime() - new Date(deliveryDate).getTime()) / (1000 * 3600 * 24))
        );
        if (days > SETTLEMENT_OVERDUE_DAYS_THRESHOLD) {
          overdueOrdersCount++;
          if (oldestUnsettledDays === null || days > oldestUnsettledDays) {
            oldestUnsettledDays = days;
          }
        }
      }
    }

    const rawName = (o.customerRawName ?? "").trim();
    const parts = rawName.split(" ").filter(Boolean);
    const firstName = parts[0] || "Client";
    const initial = parts.length > 1 ? ` ${parts[1][0]}.` : "";

    return {
      id: o.id,
      code: o.code,
      shortReference: o.code.replace(/^SF-/, "#"),
      customerDisplayName: `${firstName}${initial}`,
      deliveredAt: (o.deliveredAt || o.updatedAt)?.toISOString() ?? null,
      itemsTotal: finalItems,
      commissionAmount: o.commissionAmount,
      commissionBps: o.commissionBps,
      netReceivable: net,
      settlementStatus,
      settlementId: settledInfo?.settlementId ?? null,
      settlementReference: settledInfo?.settlementRef ?? null,
    };
  });

  const payoutsDTO: PartnerPayoutDTO[] = rawSettlements.map((s) => {
    const note = s.note || "";
    const methodTag = note.match(/\[MÉTHODE:\s*([^\]]+)\]/i);
    let method: "mobile_money" | "bank" | "cash" = "mobile_money";
    if (methodTag) {
      const m = methodTag[1].toLowerCase();
      if (m.includes("bank")) method = "bank";
      else if (m.includes("cash")) method = "cash";
      else method = "mobile_money";
    }

    const refTag = note.match(/\[RÉF:\s*([^\]]+)\]/i) || note.match(/Réf[^\w]*([a-zA-Z0-9_-]+)/i);
    const reference = refTag ? refTag[1] : `#${s.id.slice(0, 8)}`;

    const periodTag = note.match(/\[PÉRIODE:\s*([^\]]+)\]/i);
    const periodCovered = periodTag ? periodTag[1] : null;

    const includedOrders = settlementOrdersMap.get(s.id) || [];

    return {
      id: s.id,
      date: s.createdAt.toISOString(),
      periodCovered,
      method,
      amount: s.amount,
      currency: s.currency,
      status: "paid",
      reference,
      note: note.replace(/\[[^\]]+\]/g, "").trim() || null,
      ordersCount: includedOrders.length,
      includedOrders,
    };
  });

  // 6. All-Time Reconciliation calculations
  const totalAllTimeNetCDF = ordersDTO.reduce((sum, o) => sum + o.netReceivable, 0);
  const totalAllTimeSettledCDF = payoutsDTO.reduce((sum, p) => sum + p.amount, 0);
  const balanceOwedCDF = Math.max(0, totalAllTimeNetCDF - totalAllTimeSettledCDF);

  // 7. Period calculations (filtered by selected start and end)
  const periodOrders = ordersDTO.filter((o) => {
    if (!o.deliveredAt) return false;
    const time = new Date(o.deliveredAt).getTime();
    return time >= start.getTime() && time <= end.getTime();
  });

  const periodPayouts = payoutsDTO.filter((p) => {
    const time = new Date(p.date).getTime();
    return time >= start.getTime() && time <= end.getTime();
  });

  const grossRevenueCDF = periodOrders.reduce((sum, o) => sum + o.itemsTotal, 0);
  const commissionCDF = periodOrders.reduce((sum, o) => sum + o.commissionAmount, 0);
  const netReceivableCDF = periodOrders.reduce((sum, o) => sum + o.netReceivable, 0);
  const totalSettledCDF = periodPayouts.reduce((sum, p) => sum + p.amount, 0);

  // Adjustments check: grossRevenue - commission = netReceivable
  const calculatedNet = grossRevenueCDF - commissionCDF;
  const adjustmentsCDF = netReceivableCDF - calculatedNet;

  // Previous period calculations for trends
  const prevPeriodOrders = ordersDTO.filter((o) => {
    if (!o.deliveredAt) return false;
    const time = new Date(o.deliveredAt).getTime();
    return time >= prevStart.getTime() && time <= prevEnd.getTime();
  });

  const prevGrossRevenueCDF = prevPeriodOrders.reduce((sum, o) => sum + o.itemsTotal, 0);
  const prevNetReceivableCDF = prevPeriodOrders.reduce((sum, o) => sum + o.netReceivable, 0);

  const grossTrendDiffCDF = grossRevenueCDF - prevGrossRevenueCDF;
  const grossTrendPercent =
    prevGrossRevenueCDF > 0
      ? Math.round((grossTrendDiffCDF / prevGrossRevenueCDF) * 100)
      : null;

  const netTrendDiffCDF = netReceivableCDF - prevNetReceivableCDF;
  const netTrendPercent =
    prevNetReceivableCDF > 0
      ? Math.round((netTrendDiffCDF / prevNetReceivableCDF) * 100)
      : null;

  const commissionRatePercent =
    house.commissionBps != null ? house.commissionBps / 100 : 20;

  const isPayoutConfigured = Boolean(house.contactPhone && house.contactPhone.trim().length > 5);

  const hero: PartnerSettlementHeroData = {
    balanceOwedCDF,
    totalAllTimeNetCDF,
    totalAllTimeSettledCDF,
    nextPayoutDate: getNextPayoutDate(now),
    payoutCycle: "Hebdomadaire (chaque lundi)",
    payoutMethodName: isPayoutConfigured ? "Mobile Money" : "Non configuré",
    maskedAccount: maskPhoneNumber(house.contactPhone),
    isPayoutMethodConfigured: isPayoutConfigured,
    minPayoutThresholdCDF: null, // No threshold required
  };

  const alerts: PartnerSettlementAlertsData = {
    missingPayoutMethod: !isPayoutConfigured,
    failedPayoutCount: reversedSettlements.length,
    failedPayoutNote:
      reversedSettlements.length > 0 ? reversedSettlements[0].note || null : null,
    overdueOrdersCount,
    oldestUnsettledDays,
  };

  const kpis: PartnerSettlementKpiData = {
    grossRevenueCDF,
    commissionCDF,
    commissionRatePercent,
    netReceivableCDF,
    totalSettledCDF,
    adjustmentsCDF,
    grossTrendPercent,
    grossTrendDiffCDF,
    netTrendPercent,
    netTrendDiffCDF,
    settledTrendDiffCDF: null,
  };

  return {
    houseId: house.id,
    houseName: house.name,
    houseSlug: house.slug,
    selectedPeriod: period,
    periodStartDate: start.toISOString(),
    periodEndDate: end.toISOString(),
    hero,
    alerts,
    kpis,
    orders: periodOrders,
    payouts: periodPayouts,
    allOrders: ordersDTO,
    allPayouts: payoutsDTO,
    config: {
      commissionRatePercent,
      settlementDelayNotice: "Commandes livrées jusqu'au dimanche 23h59 réglées le lundi",
      overdueThresholdDays: SETTLEMENT_OVERDUE_DAYS_THRESHOLD,
    },
  };
}

export async function recordSettlementSupportReport(params: {
  houseId: string;
  userId: string;
  ticketReference: string;
  reference: string;
  targetType: "order" | "settlement";
  orderId?: string;
  settlementId?: string;
  reasonCategory: string;
  message: string;
}): Promise<Result<void>> {
  if (params.targetType === "order" && params.orderId) {
    const [order] = await db
      .select({ id: schema.orders.id, houseId: schema.orders.houseId })
      .from(schema.orders)
      .where(
        and(
          eq(schema.orders.id, params.orderId),
          eq(schema.orders.houseId, params.houseId)
        )
      )
      .limit(1);

    if (!order) {
      return err("La commande spécifiée n'appartient pas à ce pressing.");
    }

    await db.insert(schema.disputes).values({
      id: crypto.randomUUID(),
      orderId: params.orderId,
      openedBy: params.userId,
      type: "payment",
      description: `[Ticket ${params.ticketReference}] Catégorie: ${params.reasonCategory}. Message: ${params.message}`,
      status: "open",
    });
  }

  if (params.targetType === "settlement") {
    const adminUsers = await db
      .select({ id: schema.user.id })
      .from(schema.user)
      .where(eq(schema.user.role, "admin"));

    for (const admin of adminUsers) {
      await db.insert(schema.notifications).values({
        id: crypto.randomUUID(),
        userId: admin.id,
        channel: "in_app",
        templateKey: "admin_settlement_issue_reported",
        locale: "fr",
        title: `[Support] Signalement versement ${params.ticketReference}`,
        body: `Signalement reçu du pressing ${params.houseId} pour le versement ${params.settlementId ?? params.reference}. Catégorie: ${params.reasonCategory}. Message: ${params.message}`,
        status: "pending",
      });
    }
  }

  await db.insert(schema.notifications).values({
    id: crypto.randomUUID(),
    userId: params.userId,
    channel: "in_app",
    templateKey: "partner_settlement_issue_reported",
    locale: "fr",
    title: `Signalement ${params.ticketReference} reçu`,
    body: `Votre signalement concernant la référence ${params.reference} a été transmis à l'équipe support SafiHub. Réf ticket : ${params.ticketReference}`,
    status: "pending",
  });

  return ok(undefined);
}
