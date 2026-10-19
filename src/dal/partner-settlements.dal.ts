import "server-only";

import { and, desc, eq, inArray, notInArray, sql } from "drizzle-orm";
import { db, schema } from "./db";
import type {
  PartnerDeliveredOrderDTO,
  PartnerPayoutDTO,
  PartnerSettlementAlertsData,
  PartnerSettlementHeroData,
  PartnerSettlementKpiData,
  PartnerSettlementsPageData,
  PeriodType,
} from "@/types/partner-settlements";

export interface GetPartnerSettlementsParams {
  houseId: string;
  period?: PeriodType;
  from?: string;
  to?: string;
}

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
  const current = new Date(now);

  if (period === "custom" && customFrom && customTo) {
    const start = new Date(`${customFrom}T00:00:00Z`);
    const end = new Date(`${customTo}T23:59:59.999Z`);
    const durationMs = Math.max(86400000, end.getTime() - start.getTime());
    const prevEnd = new Date(start.getTime() - 1);
    const prevStart = new Date(prevEnd.getTime() - durationMs);
    return { start, end, prevStart, prevEnd };
  }

  if (period === "week") {
    // Current week: Monday 00:00 to Sunday 23:59:59
    const day = current.getDay(); // 0 is Sunday, 1 is Monday
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(current);
    monday.setDate(current.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const prevMonday = new Date(monday);
    prevMonday.setDate(monday.getDate() - 7);
    const prevSunday = new Date(sunday);
    prevSunday.setDate(sunday.getDate() - 7);

    return { start: monday, end: sunday, prevStart: prevMonday, prevEnd: prevSunday };
  }

  if (period === "last30") {
    const end = new Date(current);
    end.setHours(23, 59, 59, 999);
    const start = new Date(end.getTime() - 30 * 86400000);
    start.setHours(0, 0, 0, 0);

    const prevEnd = new Date(start.getTime() - 1);
    const prevStart = new Date(prevEnd.getTime() - 30 * 86400000);
    return { start, end, prevStart, prevEnd };
  }

  // Default: "month"
  const start = new Date(current.getFullYear(), current.getMonth(), 1, 0, 0, 0, 0);
  const end = new Date(current.getFullYear(), current.getMonth() + 1, 0, 23, 59, 59, 999);

  const prevStart = new Date(current.getFullYear(), current.getMonth() - 1, 1, 0, 0, 0, 0);
  const prevEnd = new Date(current.getFullYear(), current.getMonth(), 0, 23, 59, 59, 999);

  return { start, end, prevStart, prevEnd };
}

/**
 * Masks phone numbers for partner privacy compliance.
 * e.g. "+243 99 123 4567" -> "+243 99 ••• 4567"
 */
export function maskPhoneNumber(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const cleaned = phone.trim();
  if (cleaned.length < 7) return cleaned;

  if (cleaned.startsWith("+243")) {
    const withoutPrefix = cleaned.slice(4).trim();
    const networkCode = withoutPrefix.slice(0, 2);
    const lastFour = cleaned.slice(-4);
    return `+243 ${networkCode} ••• ${lastFour}`;
  }

  const firstFour = cleaned.slice(0, 4);
  const lastFour = cleaned.slice(-4);
  return `${firstFour} ••• ${lastFour}`;
}

/**
 * Calculates next upcoming settlement date (Mondays weekly in Bukavu).
 */
export function getNextPayoutDate(now: Date = new Date()): string {
  const d = new Date(now);
  const day = d.getDay();
  // Monday is 1. If today is Monday, next payout is next Monday (or 7 days later).
  const daysUntilNextMonday = ((1 + 7 - day) % 7) || 7;
  const nextMonday = new Date(d);
  nextMonday.setDate(d.getDate() + daysUntilNextMonday);

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
  let remainingInCurrentSettlement =
    chronologicalSettlements.length > 0 ? chronologicalSettlements[0].amount : 0;

  for (const order of chronologicalOrders) {
    if (order.disputeId && order.disputeStatus === "open") {
      // Disputed orders are held and not settled
      continue;
    }

    const netOwed = Math.max(
      0,
      (order.adjustedItemsTotal ?? order.itemsTotal) - order.commissionAmount
    );

    if (settlementIdx < chronologicalSettlements.length) {
      const activeSettlement = chronologicalSettlements[settlementIdx];
      if (remainingInCurrentSettlement >= netOwed) {
        remainingInCurrentSettlement -= netOwed;
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

        if (remainingInCurrentSettlement <= 0) {
          settlementIdx++;
          if (settlementIdx < chronologicalSettlements.length) {
            remainingInCurrentSettlement = chronologicalSettlements[settlementIdx].amount;
          }
        }
      }
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

  const commissionRatePercent = house.commissionBps ? Math.round(house.commissionBps / 100) : 20;

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
