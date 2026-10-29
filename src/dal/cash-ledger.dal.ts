import "server-only";
import { and, desc, eq, inArray, like, notInArray, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db, schema } from "./db";

export interface DeliveryLedgerPostingParams {
  orderId: string;
  missionId: string;
  courierId: string;
  houseId: string;
  currency: "CDF" | "USD";
  cashCollected: number;
  itemsTotal: number;
  commissionAmount: number;
  deliveryFee: number;
  courierPay: number;
  note?: string;
  createdBy?: string;
}

export interface PostedDeliveryLedgerResult {
  cashCollectedEntryId: string;
  owedToHouseEntryId: string;
  owedToOwnerEntryId: string;
  courierPayEntryId: string;
  discrepancyEntryId?: string;
  owedToHouse: number;
  owedToOwner: number;
  courierPay: number;
  cashCollected: number;
}

/**
 * Task 8.1: Post per mission and currency on delivery:
 * 1. cash collected
 * 2. owed to the house (items total - commission)
 * 3. owed to the owner (commission + delivery fee net of courier pay)
 * 4. courier pay
 */
export async function postDeliveryMissionLedgerEntries(
  params: DeliveryLedgerPostingParams
): Promise<PostedDeliveryLedgerResult> {
  return await db.transaction(async (tx) => {
    const {
      orderId,
      missionId,
      courierId,
      houseId,
      currency,
      cashCollected,
      itemsTotal,
      commissionAmount,
      deliveryFee,
      courierPay,
      note,
      createdBy,
    } = params;

    const owedToHouse = Math.max(0, itemsTotal - commissionAmount);
    const courierPayEarned = Math.max(0, courierPay);
    const deliveryFeeNet = Math.max(0, deliveryFee - courierPayEarned);
    const owedToOwner = Math.max(0, commissionAmount + deliveryFeeNet);

    // 1. Cash collected
    const [cashEntry] = await tx
      .insert(schema.cashLedger)
      .values({
        entryType: "cash_collected",
        orderId,
        missionId,
        courierId,
        houseId,
        currency,
        amount: cashCollected,
        note: note ?? `Encaissé à la livraison : ${cashCollected} ${currency}`,
        createdBy: createdBy ?? courierId,
      })
      .returning();

    // 2. Owed to house
    const [houseEntry] = await tx
      .insert(schema.cashLedger)
      .values({
        entryType: "owed_to_house",
        orderId,
        missionId,
        courierId,
        houseId,
        currency,
        amount: owedToHouse,
        note: `Part pressing due : ${owedToHouse} ${currency} (${itemsTotal} - ${commissionAmount})`,
        createdBy: createdBy ?? courierId,
      })
      .returning();

    // 3. Owed to owner
    const [ownerEntry] = await tx
      .insert(schema.cashLedger)
      .values({
        entryType: "owed_to_owner",
        orderId,
        missionId,
        courierId,
        houseId,
        currency,
        amount: owedToOwner,
        note: `Part propriétaire (marge + frais nets) : ${owedToOwner} ${currency}`,
        createdBy: createdBy ?? courierId,
      })
      .returning();

    // 4. Courier pay
    const [courierEntry] = await tx
      .insert(schema.cashLedger)
      .values({
        entryType: "courier_pay",
        orderId,
        missionId,
        courierId,
        houseId,
        currency,
        amount: courierPayEarned,
        note: `Rémunération coursier pour la course : ${courierPayEarned} ${currency}`,
        createdBy: createdBy ?? courierId,
      })
      .returning();

    return {
      cashCollectedEntryId: cashEntry.id,
      owedToHouseEntryId: houseEntry.id,
      owedToOwnerEntryId: ownerEntry.id,
      courierPayEntryId: courierEntry.id,
      owedToHouse,
      owedToOwner,
      courierPay: courierPayEarned,
      cashCollected,
    };
  });
}

/**
 * Task 8.1: Reverse a ledger entry.
 * Ledger entries are NEVER updated or deleted, only reversed.
 */
export async function reverseLedgerEntry(params: {
  entryId: string;
  reason: string;
  reversedBy?: string;
}): Promise<{ ok: boolean; reversalId?: string; error?: string }> {
  return await db.transaction(async (tx) => {
    const [original] = await tx
      .select()
      .from(schema.cashLedger)
      .where(eq(schema.cashLedger.id, params.entryId))
      .for("update")
      .limit(1);

    if (!original) {
      return { ok: false, error: "Écriture de caisse introuvable" };
    }

    if (original.entryType === "reversal") {
      return { ok: false, error: "Une contre-passation ne peut pas être annulée" };
    }

    // Check if already reversed
    const [alreadyReversed] = await tx
      .select()
      .from(schema.cashLedger)
      .where(
        and(
          eq(schema.cashLedger.entryType, "reversal"),
          eq(schema.cashLedger.reversalOfId, original.id)
        )
      )
      .limit(1);

    if (alreadyReversed) {
      return { ok: false, error: "Cette écriture a déjà été contre-passée" };
    }

    const [reversal] = await tx
      .insert(schema.cashLedger)
      .values({
        entryType: "reversal",
        orderId: original.orderId,
        missionId: original.missionId,
        courierId: original.courierId,
        houseId: original.houseId,
        currency: original.currency,
        amount: original.amount,
        reversalOfId: original.id,
        note: `Contre-passation de ${original.id} : ${params.reason}`,
        createdBy: params.reversedBy ?? null,
      })
      .returning();

    // Keep courierProfiles balances consistent with the reversal
    if (original.courierId) {
      if (original.entryType === "deposit_held") {
        await tx
          .update(schema.courierProfiles)
          .set({
            securityDeposit: sql`greatest(0, ${schema.courierProfiles.securityDeposit} - ${original.amount})`,
            updatedAt: new Date(),
          })
          .where(eq(schema.courierProfiles.userId, original.courierId));
      } else if (original.entryType === "deposit_released") {
        await tx
          .update(schema.courierProfiles)
          .set({
            securityDeposit: sql`${schema.courierProfiles.securityDeposit} + ${original.amount}`,
            updatedAt: new Date(),
          })
          .where(eq(schema.courierProfiles.userId, original.courierId));
      } else if (original.entryType === "float_issued") {
        await tx
          .update(schema.courierProfiles)
          .set({
            changeFloat: sql`greatest(0, ${schema.courierProfiles.changeFloat} - ${original.amount})`,
            updatedAt: new Date(),
          })
          .where(eq(schema.courierProfiles.userId, original.courierId));
      } else if (original.entryType === "float_returned") {
        await tx
          .update(schema.courierProfiles)
          .set({
            changeFloat: sql`${schema.courierProfiles.changeFloat} + ${original.amount}`,
            updatedAt: new Date(),
          })
          .where(eq(schema.courierProfiles.userId, original.courierId));
      }
    }

    return { ok: true, reversalId: reversal.id };
  });
}

/**
 * Task 8.2: Get courier held cash, ceiling, security deposit, and change float.
 * Considers reversals: any entry with an active reversal is excluded.
 */
export async function getCourierCashBalances(courierId: string): Promise<{
  cashHeldCDF: number;
  cashHeldUSD: number;
  cashCeiling: number | null;
  isCeilingExceeded: boolean;
  securityDeposit: number;
  changeFloat: number;
  totalCollectedCDF: number;
  totalRemittedCDF: number;
}> {
  const [profile] = await db
    .select()
    .from(schema.courierProfiles)
    .where(eq(schema.courierProfiles.userId, courierId))
    .limit(1);

  // Subquery to find all reversed entry IDs
  const reversedEntryIds = db
    .select({ id: schema.cashLedger.reversalOfId })
    .from(schema.cashLedger)
    .where(
      and(
        eq(schema.cashLedger.entryType, "reversal"),
        sql`${schema.cashLedger.reversalOfId} is not null`
      )
    );

  const entries = await db
    .select({
      entryType: schema.cashLedger.entryType,
      amount: schema.cashLedger.amount,
      currency: schema.cashLedger.currency,
      exchangeRateUsed: schema.orders.exchangeRateUsed,
    })
    .from(schema.cashLedger)
    .leftJoin(schema.orders, eq(schema.cashLedger.orderId, schema.orders.id))
    .where(
      and(
        eq(schema.cashLedger.courierId, courierId),
        sql`${schema.cashLedger.entryType} <> 'reversal'`,
        notInArray(schema.cashLedger.id, reversedEntryIds)
      )
    );

  let cashHeldCDF = 0;
  let cashHeldUSD = 0;
  let totalCollectedCDF = 0;
  let totalRemittedCDF = 0;

  for (const entry of entries) {
    const rate = Number(entry.exchangeRateUsed) || 2800;
    const amountCDF =
      entry.currency === "USD" ? Math.round(entry.amount * rate) : entry.amount;

    if (entry.entryType === "cash_collected") {
      if (entry.currency === "USD") cashHeldUSD += entry.amount;
      else cashHeldCDF += entry.amount;
      totalCollectedCDF += amountCDF;
    } else if (entry.entryType === "float_issued") {
      if (entry.currency === "USD") cashHeldUSD += entry.amount;
      else cashHeldCDF += entry.amount;
    } else if (entry.entryType === "cash_remitted") {
      if (entry.currency === "USD") cashHeldUSD -= entry.amount;
      else cashHeldCDF -= entry.amount;
      totalRemittedCDF += amountCDF;
    } else if (entry.entryType === "float_returned") {
      if (entry.currency === "USD") cashHeldUSD -= entry.amount;
      else cashHeldCDF -= entry.amount;
    }
  }

  const effectiveHeldCDF = Math.max(0, cashHeldCDF);
  const ceiling = profile?.cashCeiling ?? null;

  return {
    cashHeldCDF: effectiveHeldCDF,
    cashHeldUSD: Math.max(0, cashHeldUSD),
    cashCeiling: ceiling,
    isCeilingExceeded: ceiling !== null && effectiveHeldCDF >= ceiling,
    securityDeposit: profile?.securityDeposit ?? 0,
    changeFloat: profile?.changeFloat ?? 0,
    totalCollectedCDF,
    totalRemittedCDF,
  };
}

/**
 * Task 8.2: Security deposit management (Hold/Withhold deposit).
 */
export async function holdCourierDeposit(params: {
  courierId: string;
  amount: number;
  currency?: "CDF" | "USD";
  note?: string;
  adminId?: string;
}): Promise<{ ok: boolean; newDeposit: number }> {
  return await db.transaction(async (tx) => {
    const currency = params.currency ?? "CDF";
    await tx.insert(schema.cashLedger).values({
      entryType: "deposit_held",
      courierId: params.courierId,
      currency,
      amount: params.amount,
      note: params.note ?? `Caution de sécurité retenue : ${params.amount} ${currency}`,
      createdBy: params.adminId ?? null,
    });

    const [updated] = await tx
      .update(schema.courierProfiles)
      .set({
        securityDeposit: sql`${schema.courierProfiles.securityDeposit} + ${params.amount}`,
        updatedAt: new Date(),
      })
      .where(eq(schema.courierProfiles.userId, params.courierId))
      .returning();

    return { ok: true, newDeposit: updated?.securityDeposit ?? params.amount };
  });
}

/**
 * Task 8.2: Security deposit release / refund.
 */
export async function releaseCourierDeposit(params: {
  courierId: string;
  amount: number;
  currency?: "CDF" | "USD";
  note?: string;
  adminId?: string;
}): Promise<{ ok: boolean; newDeposit: number }> {
  return await db.transaction(async (tx) => {
    const currency = params.currency ?? "CDF";
    const [profile] = await tx
      .select()
      .from(schema.courierProfiles)
      .where(eq(schema.courierProfiles.userId, params.courierId))
      .for("update")
      .limit(1);

    const currentDeposit = profile?.securityDeposit ?? 0;
    const amountToRelease = Math.min(params.amount, currentDeposit);

    await tx.insert(schema.cashLedger).values({
      entryType: "deposit_released",
      courierId: params.courierId,
      currency,
      amount: amountToRelease,
      note: params.note ?? `Caution libérée/restituée : ${amountToRelease} ${currency}`,
      createdBy: params.adminId ?? null,
    });

    const [updated] = await tx
      .update(schema.courierProfiles)
      .set({
        securityDeposit: Math.max(0, currentDeposit - amountToRelease),
        updatedAt: new Date(),
      })
      .where(eq(schema.courierProfiles.userId, params.courierId))
      .returning();

    return { ok: true, newDeposit: updated?.securityDeposit ?? 0 };
  });
}

/**
 * Task 8.2: Change float issuance.
 */
export async function issueCourierFloat(params: {
  courierId: string;
  amount: number;
  currency?: "CDF" | "USD";
  note?: string;
  adminId?: string;
}): Promise<{ ok: boolean; newFloat: number }> {
  return await db.transaction(async (tx) => {
    const currency = params.currency ?? "CDF";
    await tx.insert(schema.cashLedger).values({
      entryType: "float_issued",
      courierId: params.courierId,
      currency,
      amount: params.amount,
      note: params.note ?? `Fond de caisse remis : ${params.amount} ${currency}`,
      createdBy: params.adminId ?? null,
    });

    const [updated] = await tx
      .update(schema.courierProfiles)
      .set({
        changeFloat: sql`${schema.courierProfiles.changeFloat} + ${params.amount}`,
        updatedAt: new Date(),
      })
      .where(eq(schema.courierProfiles.userId, params.courierId))
      .returning();

    return { ok: true, newFloat: updated?.changeFloat ?? params.amount };
  });
}

/**
 * Task 8.2: Change float return.
 */
export async function returnCourierFloat(params: {
  courierId: string;
  amount: number;
  currency?: "CDF" | "USD";
  note?: string;
  adminId?: string;
}): Promise<{ ok: boolean; newFloat: number }> {
  return await db.transaction(async (tx) => {
    const currency = params.currency ?? "CDF";
    const [profile] = await tx
      .select()
      .from(schema.courierProfiles)
      .where(eq(schema.courierProfiles.userId, params.courierId))
      .for("update")
      .limit(1);

    const currentFloat = profile?.changeFloat ?? 0;
    const amountToReturn = Math.min(params.amount, currentFloat);

    await tx.insert(schema.cashLedger).values({
      entryType: "float_returned",
      courierId: params.courierId,
      currency,
      amount: amountToReturn,
      note: params.note ?? `Fond de caisse retourné : ${amountToReturn} ${currency}`,
      createdBy: params.adminId ?? null,
    });

    const [updated] = await tx
      .update(schema.courierProfiles)
      .set({
        changeFloat: Math.max(0, currentFloat - amountToReturn),
        updatedAt: new Date(),
      })
      .where(eq(schema.courierProfiles.userId, params.courierId))
      .returning();

    return { ok: true, newFloat: updated?.changeFloat ?? 0 };
  });
}

/**
 * Task 8.3: Daily Courier Reconciliation Data.
 * Fetches per courier for a given businessDate:
 * - expected cash collected on that day
 * - total unremitted cash
 * - deposit & float
 * - reconciliation status and difference
 */
export async function getDailyCourierReconciliationData(businessDate: string): Promise<{
  couriers: Array<{
    courierId: string;
    name: string | null;
    phone: string | null;
    expectedCashCDF: number;
    expectedCashUSD: number;
    heldCashCDF: number;
    securityDeposit: number;
    changeFloat: number;
    reconciliationId: string | null;
    status: "open" | "confirmed";
    receivedAmount: number;
    difference: number;
    currency: "CDF" | "USD";
    note: string | null;
    reconciledByName?: string | null;
    reconciledAt?: Date | null;
    orders?: Array<{
      id: string;
      code: string;
      amount: number;
      currency: "CDF" | "USD";
      customerPhone: string | null;
      createdAt: Date;
    }>;
  }>;
  summary: {
    totalExpectedCDF: number;
    totalReceivedCDF: number;
    totalDiscrepancyCDF: number;
  };
}> {
  const activeCouriers = await db
    .select({
      id: schema.user.id,
      name: schema.user.name,
      phone: schema.user.contactPhone,
      securityDeposit: schema.courierProfiles.securityDeposit,
      changeFloat: schema.courierProfiles.changeFloat,
      cashCeiling: schema.courierProfiles.cashCeiling,
    })
    .from(schema.courierProfiles)
    .innerJoin(schema.user, eq(schema.courierProfiles.userId, schema.user.id))
    .where(eq(schema.courierProfiles.isActive, true));

  const reversedSubquery = db
    .select({ id: schema.cashLedger.reversalOfId })
    .from(schema.cashLedger)
    .where(
      and(
        eq(schema.cashLedger.entryType, "reversal"),
        sql`${schema.cashLedger.reversalOfId} is not null`
      )
    );

  const results = [];
  let sumExpectedCDF = 0;
  let sumReceivedCDF = 0;
  let sumDiscrepancyCDF = 0;

  for (const c of activeCouriers) {
    // Expected cash for this specific businessDate (from cash_collected ledger entries)
    const dayEntries = await db
      .select({
        amount: schema.cashLedger.amount,
        currency: schema.cashLedger.currency,
        exchangeRateUsed: schema.orders.exchangeRateUsed,
        orderId: schema.cashLedger.orderId,
        orderCode: schema.orders.code,
        customerPhone: schema.orders.contactPhone,
        createdAt: schema.cashLedger.createdAt,
      })
      .from(schema.cashLedger)
      .leftJoin(schema.orders, eq(schema.cashLedger.orderId, schema.orders.id))
      .where(
        and(
          eq(schema.cashLedger.courierId, c.id),
          eq(schema.cashLedger.entryType, "cash_collected"),
          sql`to_char(${schema.cashLedger.createdAt} at time zone 'Africa/Lubumbashi', 'YYYY-MM-DD') = ${businessDate}`,
          notInArray(schema.cashLedger.id, reversedSubquery)
        )
      );

    let expectedCashCDF = 0;
    let expectedCashUSD = 0;
    for (const e of dayEntries) {
      const rate = Number(e.exchangeRateUsed) || 2800;
      if (e.currency === "USD") {
        expectedCashUSD += e.amount;
        expectedCashCDF += Math.round(e.amount * rate);
      } else {
        expectedCashCDF += e.amount;
      }
    }

    const courierOrders = dayEntries
      .filter((e) => e.orderId)
      .map((e) => ({
        id: e.orderId as string,
        code: e.orderCode ?? "—",
        amount: e.amount,
        currency: (e.currency as "CDF" | "USD") ?? "CDF",
        customerPhone: e.customerPhone ?? null,
        createdAt: e.createdAt,
      }));

    // Held cash overall
    const balances = await getCourierCashBalances(c.id);

    // Existing reconciliation record for this date with operator name
    const [recon] = await db
      .select({
        id: schema.cashReconciliations.id,
        receivedAmount: schema.cashReconciliations.receivedAmount,
        difference: schema.cashReconciliations.difference,
        status: schema.cashReconciliations.status,
        currency: schema.cashReconciliations.currency,
        note: schema.cashReconciliations.note,
        reconciledBy: schema.cashReconciliations.reconciledBy,
        createdAt: schema.cashReconciliations.createdAt,
        reconciledByName: schema.user.name,
      })
      .from(schema.cashReconciliations)
      .leftJoin(schema.user, eq(schema.cashReconciliations.reconciledBy, schema.user.id))
      .where(
        and(
          eq(schema.cashReconciliations.courierId, c.id),
          eq(schema.cashReconciliations.businessDate, businessDate)
        )
      )
      .limit(1);

    const receivedAmount = recon?.receivedAmount ?? 0;
    const difference = recon ? recon.difference : -expectedCashCDF;
    const status = recon?.status ?? "open";

    sumExpectedCDF += expectedCashCDF;
    sumReceivedCDF += receivedAmount;
    if (recon) {
      sumDiscrepancyCDF += recon.difference;
    }

    results.push({
      courierId: c.id,
      name: c.name,
      phone: c.phone,
      expectedCashCDF,
      expectedCashUSD,
      heldCashCDF: balances.cashHeldCDF,
      securityDeposit: c.securityDeposit ?? 0,
      changeFloat: c.changeFloat ?? 0,
      reconciliationId: recon?.id ?? null,
      status,
      receivedAmount,
      difference,
      currency: (recon?.currency as "CDF" | "USD") ?? "CDF",
      note: recon?.note ?? null,
      reconciledByName: recon?.reconciledByName ?? null,
      reconciledAt: recon?.createdAt ?? null,
      orders: courierOrders,
    });
  }

  return {
    couriers: results,
    summary: {
      totalExpectedCDF: sumExpectedCDF,
      totalReceivedCDF: sumReceivedCDF,
      totalDiscrepancyCDF: sumDiscrepancyCDF,
    },
  };
}

/**
 * Task 8.3: Record Daily Courier Reconciliation.
 * Reconciles expected vs received amount, posts cash_remitted,
 * logs discrepancies and optionally deducts from courier security deposit.
 */
export async function recordDailyCourierReconciliation(params: {
  courierId: string;
  businessDate: string;
  currency: "CDF" | "USD";
  expectedAmount: number;
  receivedAmount: number;
  note?: string;
  reconciledBy?: string;
  deductFromDeposit?: boolean;
}): Promise<{
  ok: boolean;
  reconciliationId?: string;
  discrepancyLogged: boolean;
  depositDeducted: boolean;
  error?: string;
}> {
  return await db.transaction(async (tx) => {
    const {
      courierId,
      businessDate,
      currency,
      receivedAmount,
      note,
      reconciledBy,
      deductFromDeposit,
    } = params;

    // Calculate expectedAmount on the server from non-reversed cash_collected entries for that businessDate
    const reversedSubquery = tx
      .select({ id: schema.cashLedger.reversalOfId })
      .from(schema.cashLedger)
      .where(
        and(
          eq(schema.cashLedger.entryType, "reversal"),
          sql`${schema.cashLedger.reversalOfId} is not null`
        )
      );

    const dayEntries = await tx
      .select({
        amount: schema.cashLedger.amount,
        currency: schema.cashLedger.currency,
        exchangeRateUsed: schema.orders.exchangeRateUsed,
      })
      .from(schema.cashLedger)
      .leftJoin(schema.orders, eq(schema.cashLedger.orderId, schema.orders.id))
      .where(
        and(
          eq(schema.cashLedger.courierId, courierId),
          eq(schema.cashLedger.entryType, "cash_collected"),
          sql`to_char(${schema.cashLedger.createdAt} at time zone 'Africa/Lubumbashi', 'YYYY-MM-DD') = ${businessDate}`,
          notInArray(schema.cashLedger.id, reversedSubquery)
        )
      );

    let calculatedExpected = 0;
    for (const e of dayEntries) {
      const rate = Number(e.exchangeRateUsed) || 2800;
      if (currency === "USD") {
        if (e.currency === "USD") calculatedExpected += e.amount;
      } else {
        if (e.currency === "USD") calculatedExpected += Math.round(e.amount * rate);
        else calculatedExpected += e.amount;
      }
    }

    const expectedAmount = calculatedExpected;
    const difference = receivedAmount - expectedAmount;
    const discrepancyLogged = difference !== 0;
    let depositDeducted = false;

    // Check existing reconciliation record for idempotency
    const [existing] = await tx
      .select()
      .from(schema.cashReconciliations)
      .where(
        and(
          eq(schema.cashReconciliations.courierId, courierId),
          eq(schema.cashReconciliations.businessDate, businessDate),
          eq(schema.cashReconciliations.currency, currency)
        )
      )
      .for("update")
      .limit(1);

    if (existing && existing.status === "confirmed") {
      // Idempotent retry: if same received amount, return existing record without re-applying ledger entries
      if (existing.receivedAmount === receivedAmount) {
        return {
          ok: true,
          reconciliationId: existing.id,
          discrepancyLogged: existing.difference !== 0,
          depositDeducted: false,
        };
      }
      return {
        ok: false,
        error: "Cette journée a déjà été réconciliée pour ce coursier",
        discrepancyLogged: false,
        depositDeducted: false,
      };
    }

    let reconId = existing?.id;
    if (existing) {
      await tx
        .update(schema.cashReconciliations)
        .set({
          expectedAmount,
          receivedAmount,
          difference,
          status: "confirmed",
          note: note ?? null,
          reconciledBy: reconciledBy ?? null,
        })
        .where(eq(schema.cashReconciliations.id, existing.id));
    } else {
      const [recon] = await tx
        .insert(schema.cashReconciliations)
        .values({
          courierId,
          businessDate,
          currency,
          expectedAmount,
          receivedAmount,
          difference,
          status: "confirmed",
          note: note ?? null,
          reconciledBy: reconciledBy ?? null,
        })
        .returning();
      reconId = recon.id;
    }

    // 2. Post cash_remitted to cash_ledger if received > 0
    if (receivedAmount > 0) {
      await tx.insert(schema.cashLedger).values({
        entryType: "cash_remitted",
        courierId,
        currency,
        amount: receivedAmount,
        note: `Versement journalier validé (${businessDate}) [RECON: ${reconId}] : ${receivedAmount} ${currency}`,
        createdBy: reconciledBy ?? null,
      });
    }

    // 3. Post discrepancy to cash_ledger if difference != 0
    if (discrepancyLogged) {
      await tx.insert(schema.cashLedger).values({
        entryType: "discrepancy",
        courierId,
        currency,
        amount: Math.abs(difference),
        note: `Écart journalier (${businessDate}) [RECON: ${reconId}] : ${difference} ${currency} (${
          difference < 0 ? "Déficit constaté" : "Surplus constaté"
        })`,
        createdBy: reconciledBy ?? null,
      });
    }

    // 4. Deduct shortfall from deposit if requested and difference < 0
    if (deductFromDeposit && difference < 0) {
      const shortfall = Math.abs(difference);
      const [profile] = await tx
        .select()
        .from(schema.courierProfiles)
        .where(eq(schema.courierProfiles.userId, courierId))
        .for("update")
        .limit(1);

      const currentDeposit = profile?.securityDeposit ?? 0;
      const deductionAmount = Math.min(shortfall, currentDeposit);

      if (deductionAmount > 0) {
        await tx.insert(schema.cashLedger).values({
          entryType: "deposit_released",
          courierId,
          currency,
          amount: deductionAmount,
          note: `Déduction de caution suite à écart de caisse du ${businessDate} [RECON: ${reconId}] (-${deductionAmount} ${currency})`,
          createdBy: reconciledBy ?? null,
        });

        await tx
          .update(schema.courierProfiles)
          .set({
            securityDeposit: Math.max(0, currentDeposit - deductionAmount),
            updatedAt: new Date(),
          })
          .where(eq(schema.courierProfiles.userId, courierId));

        depositDeducted = true;
      }
    }

    return {
      ok: true,
      reconciliationId: reconId,
      discrepancyLogged,
      depositDeducted,
    };
  });
}

/**
 * Task 8.3: Get past reconciliation and discrepancy logs.
 */
export async function getReconciliationLogs(limit = 100): Promise<
  Array<{
    id: string;
    courierId: string;
    courierName: string | null;
    courierPhone: string | null;
    businessDate: string;
    currency: "CDF" | "USD";
    expectedAmount: number;
    receivedAmount: number;
    difference: number;
    status: string;
    note: string | null;
    reconciledBy: string | null;
    reconcilerName: string | null;
    createdAt: Date;
  }>
> {
  const reconcilerUser = alias(schema.user, "reconciler_user");

  const rows = await db
    .select({
      id: schema.cashReconciliations.id,
      courierId: schema.cashReconciliations.courierId,
      courierName: schema.user.name,
      courierPhone: schema.user.contactPhone,
      businessDate: schema.cashReconciliations.businessDate,
      currency: schema.cashReconciliations.currency,
      expectedAmount: schema.cashReconciliations.expectedAmount,
      receivedAmount: schema.cashReconciliations.receivedAmount,
      difference: schema.cashReconciliations.difference,
      status: schema.cashReconciliations.status,
      note: schema.cashReconciliations.note,
      reconciledBy: schema.cashReconciliations.reconciledBy,
      reconcilerName: reconcilerUser.name,
      createdAt: schema.cashReconciliations.createdAt,
    })
    .from(schema.cashReconciliations)
    .innerJoin(schema.user, eq(schema.cashReconciliations.courierId, schema.user.id))
    .leftJoin(reconcilerUser, eq(schema.cashReconciliations.reconciledBy, reconcilerUser.id))
    .orderBy(desc(schema.cashReconciliations.businessDate), desc(schema.cashReconciliations.createdAt))
    .limit(limit);

  return rows.map((r) => ({
    ...r,
    currency: r.currency as "CDF" | "USD",
  }));
}

/**
 * Reverses a daily courier reconciliation and its posted ledger entries.
 * Logs the audit trail and preserves the record with 'Annulée' state.
 */
export async function reverseCourierReconciliation(params: {
  reconciliationId: string;
  reason: string;
  reversedBy: string;
}): Promise<{ ok: boolean; reversalId?: string; error?: string }> {
  return await db.transaction(async (tx) => {
    const [recon] = await tx
      .select()
      .from(schema.cashReconciliations)
      .where(eq(schema.cashReconciliations.id, params.reconciliationId))
      .for("update")
      .limit(1);

    if (!recon) {
      return { ok: false, error: "Réconciliation introuvable" };
    }

    if (recon.note?.includes("[ANNULÉE")) {
      return { ok: false, error: "Cette réconciliation a déjà été annulée" };
    }

    // Find linked ledger entries for this specific reconciliation
    const reconTag = `[RECON: ${recon.id}]`;
    const linkedEntries = await tx
      .select()
      .from(schema.cashLedger)
      .where(
        and(
          eq(schema.cashLedger.courierId, recon.courierId),
          like(schema.cashLedger.note, `%${reconTag}%`)
        )
      );

    if (recon.status === "confirmed" && linkedEntries.length === 0) {
      return { ok: false, error: "Aucune écriture liée à cette réconciliation à annuler" };
    }

    let lastReversalId: string | undefined;
    for (const entry of linkedEntries) {
      const [alreadyReversed] = await tx
        .select()
        .from(schema.cashLedger)
        .where(
          and(
            eq(schema.cashLedger.entryType, "reversal"),
            eq(schema.cashLedger.reversalOfId, entry.id)
          )
        )
        .limit(1);

      if (!alreadyReversed) {
        const [reversal] = await tx
          .insert(schema.cashLedger)
          .values({
            entryType: "reversal",
            courierId: entry.courierId,
            currency: entry.currency,
            amount: entry.amount,
            reversalOfId: entry.id,
            note: `Annulation ${entry.entryType} (${recon.businessDate}) : ${params.reason}`,
            createdBy: params.reversedBy,
          })
          .returning();
        lastReversalId = reversal.id;

        if (entry.entryType === "deposit_released") {
          const courierUserId = entry.courierId ?? recon.courierId;
          const [profile] = await tx
            .select()
            .from(schema.courierProfiles)
            .where(eq(schema.courierProfiles.userId, courierUserId))
            .for("update")
            .limit(1);

          if (profile) {
            await tx
              .update(schema.courierProfiles)
              .set({
                securityDeposit: (profile.securityDeposit ?? 0) + entry.amount,
                updatedAt: new Date(),
              })
              .where(eq(schema.courierProfiles.userId, courierUserId));
          }
        }
      }
    }

    // Get operator details
    const [adminUser] = await tx
      .select({ name: schema.user.name })
      .from(schema.user)
      .where(eq(schema.user.id, params.reversedBy))
      .limit(1);

    const adminName = adminUser?.name || "Opérateur";
    const auditNote = `[ANNULÉE par ${adminName} : ${params.reason}] ${recon.note || ""}`.trim();

    await tx
      .update(schema.cashReconciliations)
      .set({
        status: "open",
        receivedAmount: 0,
        difference: -recon.expectedAmount,
        note: auditNote,
      })
      .where(eq(schema.cashReconciliations.id, recon.id));

    return { ok: true, reversalId: lastReversalId };
  });
}

/**
 * Lightweight batch query for unpaid house balances (used by /admin/houses list).
 */
export async function getHouseBalancesMap(): Promise<Map<string, number>> {
  const reversedSubquery = db
    .select({ id: schema.cashLedger.reversalOfId })
    .from(schema.cashLedger)
    .where(
      and(
        eq(schema.cashLedger.entryType, "reversal"),
        sql`${schema.cashLedger.reversalOfId} is not null`
      )
    );

  const entries = await db
    .select({
      houseId: schema.cashLedger.houseId,
      entryType: schema.cashLedger.entryType,
      amount: schema.cashLedger.amount,
      currency: schema.cashLedger.currency,
      exchangeRateUsed: schema.orders.exchangeRateUsed,
    })
    .from(schema.cashLedger)
    .leftJoin(schema.orders, eq(schema.cashLedger.orderId, schema.orders.id))
    .where(
      and(
        sql`${schema.cashLedger.houseId} is not null`,
        inArray(schema.cashLedger.entryType, ["owed_to_house", "house_settlement_paid"]),
        notInArray(schema.cashLedger.id, reversedSubquery)
      )
    );

  const totalsByHouse = new Map<string, { owed: number; settled: number }>();

  for (const e of entries) {
    if (!e.houseId) continue;
    const current = totalsByHouse.get(e.houseId) ?? { owed: 0, settled: 0 };
    if (e.entryType === "owed_to_house") {
      const rate = Number(e.exchangeRateUsed) || 2800;
      current.owed += e.currency === "USD" ? Math.round(e.amount * rate) : e.amount;
    } else if (e.entryType === "house_settlement_paid") {
      current.settled += e.currency === "USD" ? Math.round(e.amount * 2800) : e.amount;
    }
    totalsByHouse.set(e.houseId, current);
  }

  const balanceMap = new Map<string, number>();
  for (const [houseId, totals] of totalsByHouse.entries()) {
    balanceMap.set(houseId, Math.max(0, totals.owed - totals.settled));
  }
  return balanceMap;
}

/**
 * Task 8.4: Get house settlements summary for admin.
 */
export async function getHouseSettlementsOverview(): Promise<{
  houses: Array<{
    houseId: string;
    name: string;
    neighborhoodName: string | null;
    grossTotalCDF: number;
    commissionTotalCDF: number;
    totalOwedCDF: number;
    totalSettledCDF: number;
    balanceOwedCDF: number;
    lastSettlementAmount: number | null;
    lastSettlementAt: Date | null;
    deliveredOrdersCount: number;
    oldestUnpaidDate: Date | null;
    deliveredOrders: Array<{
      id: string;
      code: string;
      itemsTotal: number;
      commissionAmount: number;
      owedToHouse: number;
      deliveredAt: Date | null;
    }>;
  }>;
  totalOwedToHousesCDF: number;
  housesWithBalanceCount: number;
  oldestUnpaidDays: number | null;
}> {
  const reversedSubquery = db
    .select({ id: schema.cashLedger.reversalOfId })
    .from(schema.cashLedger)
    .where(
      and(
        eq(schema.cashLedger.entryType, "reversal"),
        sql`${schema.cashLedger.reversalOfId} is not null`
      )
    );

  const [allHouses, allDeliveredOrders, allHouseLedgerEntries] = await Promise.all([
    db
      .select({
        id: schema.houses.id,
        name: schema.houses.name,
        neighborhoodName: schema.neighborhoods.name,
      })
      .from(schema.houses)
      .leftJoin(schema.neighborhoods, eq(schema.houses.neighborhoodId, schema.neighborhoods.id))
      .where(eq(schema.houses.isActive, true)),
    db
      .select({
        id: schema.orders.id,
        houseId: schema.orders.houseId,
        code: schema.orders.code,
        itemsTotal: schema.orders.itemsTotal,
        adjustedItemsTotal: schema.orders.adjustedItemsTotal,
        commissionAmount: schema.orders.commissionAmount,
        updatedAt: schema.orders.updatedAt,
      })
      .from(schema.orders)
      .innerJoin(schema.houses, eq(schema.orders.houseId, schema.houses.id))
      .where(
        and(
          eq(schema.houses.isActive, true),
          eq(schema.orders.status, "delivered")
        )
      )
      .orderBy(desc(schema.orders.updatedAt)),
    db
      .select({
        houseId: schema.cashLedger.houseId,
        entryType: schema.cashLedger.entryType,
        amount: schema.cashLedger.amount,
        currency: schema.cashLedger.currency,
        exchangeRateUsed: schema.orders.exchangeRateUsed,
        createdAt: schema.cashLedger.createdAt,
      })
      .from(schema.cashLedger)
      .innerJoin(schema.houses, eq(schema.cashLedger.houseId, schema.houses.id))
      .leftJoin(schema.orders, eq(schema.cashLedger.orderId, schema.orders.id))
      .where(
        and(
          eq(schema.houses.isActive, true),
          inArray(schema.cashLedger.entryType, ["owed_to_house", "house_settlement_paid"]),
          notInArray(schema.cashLedger.id, reversedSubquery)
        )
      )
      .orderBy(desc(schema.cashLedger.createdAt)),
  ]);

  const ordersByHouseId = new Map<string, typeof allDeliveredOrders>();
  for (const order of allDeliveredOrders) {
    const list = ordersByHouseId.get(order.houseId);
    if (list) list.push(order);
    else ordersByHouseId.set(order.houseId, [order]);
  }

  const owedByHouseId = new Map<string, typeof allHouseLedgerEntries>();
  const settledByHouseId = new Map<string, typeof allHouseLedgerEntries>();
  for (const entry of allHouseLedgerEntries) {
    if (!entry.houseId) continue;
    if (entry.entryType === "owed_to_house") {
      const list = owedByHouseId.get(entry.houseId);
      if (list) list.push(entry);
      else owedByHouseId.set(entry.houseId, [entry]);
    } else if (entry.entryType === "house_settlement_paid") {
      const list = settledByHouseId.get(entry.houseId);
      if (list) list.push(entry);
      else settledByHouseId.set(entry.houseId, [entry]);
    }
  }

  const housesSummary = [];
  let totalPendingOwed = 0;
  const now = new Date();
  let maxUnpaidAgeDays: number | null = null;

  for (const h of allHouses) {
    const ordersList = ordersByHouseId.get(h.id) ?? [];

    let grossTotalCDF = 0;
    let commissionTotalCDF = 0;

    const deliveredOrders = ordersList.map((o) => {
      const finalItems = o.adjustedItemsTotal ?? o.itemsTotal;
      const owed = Math.max(0, finalItems - o.commissionAmount);
      grossTotalCDF += finalItems;
      commissionTotalCDF += o.commissionAmount;
      return {
        id: o.id,
        code: o.code ?? "—",
        itemsTotal: finalItems,
        commissionAmount: o.commissionAmount,
        owedToHouse: owed,
        deliveredAt: o.updatedAt,
      };
    });

    const owedEntries = owedByHouseId.get(h.id) ?? [];
    const totalOwedCDF = owedEntries.reduce((sum, e) => {
      const rate = Number(e.exchangeRateUsed) || 2800;
      return sum + (e.currency === "USD" ? Math.round(e.amount * rate) : e.amount);
    }, 0);

    const settledEntries = settledByHouseId.get(h.id) ?? [];
    const totalSettledCDF = settledEntries.reduce((sum, e) => {
      return sum + (e.currency === "USD" ? Math.round(e.amount * 2800) : e.amount);
    }, 0);
    const balanceOwedCDF = Math.max(0, totalOwedCDF - totalSettledCDF);
    totalPendingOwed += balanceOwedCDF;

    const lastSettlementAmount = settledEntries[0]
      ? (settledEntries[0].currency === "USD" ? Math.round(settledEntries[0].amount * 2800) : settledEntries[0].amount)
      : null;
    const lastSettlementAt = settledEntries[0]?.createdAt ?? null;

    // Oldest unpaid order date calculated via FIFO allocation of settled amounts
    let oldestUnpaidDate: Date | null = null;
    if (balanceOwedCDF > 0 && deliveredOrders.length > 0) {
      const chronologicalOrders = [...deliveredOrders].sort((a, b) => {
        const timeA = a.deliveredAt ? new Date(a.deliveredAt).getTime() : 0;
        const timeB = b.deliveredAt ? new Date(b.deliveredAt).getTime() : 0;
        return timeA - timeB;
      });

      let remainingSettled = totalSettledCDF;
      for (const order of chronologicalOrders) {
        if (remainingSettled >= order.owedToHouse) {
          remainingSettled -= order.owedToHouse;
        } else {
          oldestUnpaidDate = order.deliveredAt;
          break;
        }
      }

      if (oldestUnpaidDate) {
        const days = Math.max(0, Math.floor((now.getTime() - new Date(oldestUnpaidDate).getTime()) / (1000 * 3600 * 24)));
        if (maxUnpaidAgeDays === null || days > maxUnpaidAgeDays) {
          maxUnpaidAgeDays = days;
        }
      }
    }

    housesSummary.push({
      houseId: h.id,
      name: h.name,
      neighborhoodName: h.neighborhoodName,
      grossTotalCDF,
      commissionTotalCDF,
      totalOwedCDF,
      totalSettledCDF,
      balanceOwedCDF,
      lastSettlementAmount,
      lastSettlementAt,
      deliveredOrdersCount: ordersList.length,
      oldestUnpaidDate,
      deliveredOrders,
    });
  }

  const housesWithBalanceCount = housesSummary.filter((h) => h.balanceOwedCDF > 0).length;

  return {
    houses: housesSummary,
    totalOwedToHousesCDF: totalPendingOwed,
    housesWithBalanceCount,
    oldestUnpaidDays: maxUnpaidAgeDays,
  };
}

/**
 * Task 8.4: Get house settlement details for the house portal (/house/settlements).
 */
export async function getHouseSettlementDetail(houseId: string): Promise<{
  houseId: string;
  name: string;
  totalRevenueCDF: number;
  totalCommissionCDF: number;
  totalOwedCDF: number;
  totalSettledCDF: number;
  balanceOwedCDF: number;
  settlements: Array<{
    id: string;
    amount: number;
    currency: "CDF" | "USD";
    note: string | null;
    createdAt: Date;
  }>;
  orders: Array<{
    id: string;
    code: string;
    itemsTotal: number;
    commissionAmount: number;
    owedToHouse: number;
    deliveredAt: Date | null;
  }>;
}> {
  const [house] = await db
    .select({ id: schema.houses.id, name: schema.houses.name })
    .from(schema.houses)
    .where(eq(schema.houses.id, houseId))
    .limit(1);

  if (!house) throw new Error("Pressing introuvable");

  const reversedSubquery = db
    .select({ id: schema.cashLedger.reversalOfId })
    .from(schema.cashLedger)
    .where(
      and(
        eq(schema.cashLedger.entryType, "reversal"),
        sql`${schema.cashLedger.reversalOfId} is not null`
      )
    );

  // Settlement payments
  const settlements = await db
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

  const totalSettledCDF = settlements.reduce((sum, s) => {
    return sum + (s.currency === "USD" ? Math.round(s.amount * 2800) : s.amount);
  }, 0);

  // Calculate totalOwedCDF from the same non-reversed owed_to_house ledger entries
  const owedEntries = await db
    .select({
      amount: schema.cashLedger.amount,
      currency: schema.cashLedger.currency,
      exchangeRateUsed: schema.orders.exchangeRateUsed,
    })
    .from(schema.cashLedger)
    .leftJoin(schema.orders, eq(schema.cashLedger.orderId, schema.orders.id))
    .where(
      and(
        eq(schema.cashLedger.houseId, houseId),
        eq(schema.cashLedger.entryType, "owed_to_house"),
        notInArray(schema.cashLedger.id, reversedSubquery)
      )
    );

  const totalOwedCDF = owedEntries.reduce((sum, e) => {
    const rate = Number(e.exchangeRateUsed) || 2800;
    return sum + (e.currency === "USD" ? Math.round(e.amount * rate) : e.amount);
  }, 0);

  // Delivered orders (for display)
  const ordersList = await db
    .select({
      id: schema.orders.id,
      code: schema.orders.code,
      itemsTotal: schema.orders.itemsTotal,
      adjustedItemsTotal: schema.orders.adjustedItemsTotal,
      commissionAmount: schema.orders.commissionAmount,
      updatedAt: schema.orders.updatedAt,
    })
    .from(schema.orders)
    .where(
      and(
        eq(schema.orders.houseId, houseId),
        eq(schema.orders.status, "delivered")
      )
    )
    .orderBy(desc(schema.orders.updatedAt));

  let totalRevenueCDF = 0;
  let totalCommissionCDF = 0;

  const orders = ordersList.map((o) => {
    const finalItems = o.adjustedItemsTotal ?? o.itemsTotal;
    const owed = Math.max(0, finalItems - o.commissionAmount);
    totalRevenueCDF += finalItems;
    totalCommissionCDF += o.commissionAmount;
    return {
      id: o.id,
      code: o.code,
      itemsTotal: finalItems,
      commissionAmount: o.commissionAmount,
      owedToHouse: owed,
      deliveredAt: o.updatedAt,
    };
  });

  const balanceOwedCDF = Math.max(0, totalOwedCDF - totalSettledCDF);

  return {
    houseId: house.id,
    name: house.name,
    totalRevenueCDF,
    totalCommissionCDF,
    totalOwedCDF,
    totalSettledCDF,
    balanceOwedCDF,
    settlements,
    orders,
  };
}

/**
 * Task 8.4: Settle House Balance.
 * Posts house_settlement_paid ledger entry. Zeroes or reduces the balance owed.
 */
export async function settleHouseBalance(params: {
  houseId: string;
  amount: number;
  currency?: "CDF" | "USD";
  reference?: string;
  method?: "mobile_money" | "bank" | "cash";
  period?: string;
  note?: string;
  adminId?: string;
}): Promise<{ ok: boolean; settlementId?: string; newBalanceCDF: number; error?: string }> {
  return await db.transaction(async (tx) => {
    // 1. Lock house row to serialize settlements per house
    const [house] = await tx
      .select()
      .from(schema.houses)
      .where(eq(schema.houses.id, params.houseId))
      .for("update")
      .limit(1);

    if (!house) {
      return { ok: false, error: "Pressing introuvable", newBalanceCDF: 0 };
    }

    const reversedSubquery = tx
      .select({ id: schema.cashLedger.reversalOfId })
      .from(schema.cashLedger)
      .where(
        and(
          eq(schema.cashLedger.entryType, "reversal"),
          sql`${schema.cashLedger.reversalOfId} is not null`
        )
      );

    const owedEntries = await tx
      .select({
        amount: schema.cashLedger.amount,
        currency: schema.cashLedger.currency,
        exchangeRateUsed: schema.orders.exchangeRateUsed,
      })
      .from(schema.cashLedger)
      .leftJoin(schema.orders, eq(schema.cashLedger.orderId, schema.orders.id))
      .where(
        and(
          eq(schema.cashLedger.houseId, params.houseId),
          eq(schema.cashLedger.entryType, "owed_to_house"),
          notInArray(schema.cashLedger.id, reversedSubquery)
        )
      );

    const totalOwedCDF = owedEntries.reduce((sum, e) => {
      const rate = Number(e.exchangeRateUsed) || 2800;
      return sum + (e.currency === "USD" ? Math.round(e.amount * rate) : e.amount);
    }, 0);

    const settledEntries = await tx
      .select({
        amount: schema.cashLedger.amount,
        currency: schema.cashLedger.currency,
      })
      .from(schema.cashLedger)
      .where(
        and(
          eq(schema.cashLedger.houseId, params.houseId),
          eq(schema.cashLedger.entryType, "house_settlement_paid"),
          notInArray(schema.cashLedger.id, reversedSubquery)
        )
      );

    const totalSettledCDF = settledEntries.reduce((sum, e) => {
      return sum + (e.currency === "USD" ? Math.round(e.amount * 2800) : e.amount);
    }, 0);

    const currentBalanceCDF = Math.max(0, totalOwedCDF - totalSettledCDF);
    const amountInCDF = params.currency === "USD" ? Math.round(params.amount * 2800) : params.amount;

    if (amountInCDF > currentBalanceCDF) {
      return {
        ok: false,
        error: `Le montant saisi (${amountInCDF.toLocaleString()} CDF) ne peut pas dépasser le solde restant dû (${currentBalanceCDF.toLocaleString()} CDF)`,
        newBalanceCDF: currentBalanceCDF,
      };
    }

    const currency = params.currency ?? "CDF";
    const methodTag = params.method ? `[MÉTHODE: ${params.method}]` : "";
    const refTag = params.reference ? `[RÉF: ${params.reference}]` : "";
    const periodTag = params.period ? `[PÉRIODE: ${params.period}]` : "";
    const customNote = params.note?.trim() ?? "";
    const combinedParts = [methodTag, refTag, periodTag, customNote].filter(Boolean);
    const finalNote =
      combinedParts.length > 0
        ? combinedParts.join(" ")
        : params.reference
          ? `Règlement pressing : ${params.reference}`
          : `Règlement hebdomadaire pressing (${params.amount} ${currency})`;

    const [entry] = await tx
      .insert(schema.cashLedger)
      .values({
        entryType: "house_settlement_paid",
        houseId: params.houseId,
        currency,
        amount: params.amount,
        note: finalNote,
        createdBy: params.adminId ?? null,
      })
      .returning();

    return {
      ok: true,
      settlementId: entry.id,
      newBalanceCDF: currentBalanceCDF - amountInCDF,
    };
  });
}

/**
 * Task 8.4: Get Courier Settlements Overview (Courier Pay).
 */
export async function getCourierSettlementsOverview(): Promise<{
  couriers: Array<{
    courierId: string;
    name: string | null;
    phone: string | null;
    missionsCount: number;
    totalEarnedCDF: number;
    totalPaidCDF: number;
    balanceOwedCDF: number;
    lastPaymentAmount: number | null;
    lastPaymentAt: Date | null;
    cashDiscrepancyCDF: number;
    cashHeldCDF: number;
    oldestUnpaidDate: Date | null;
    deliveredOrders: Array<{
      id: string;
      code: string;
      amount: number;
      createdAt: Date;
    }>;
  }>;
  totalOwedToCouriersCDF: number;
  couriersWithBalanceCount: number;
  oldestUnpaidDays: number | null;
}> {
  const reversedSubquery = db
    .select({ id: schema.cashLedger.reversalOfId })
    .from(schema.cashLedger)
    .where(
      and(
        eq(schema.cashLedger.entryType, "reversal"),
        sql`${schema.cashLedger.reversalOfId} is not null`
      )
    );

  const [activeCouriers, allCourierLedgerEntries] = await Promise.all([
    db
      .select({
        id: schema.user.id,
        name: schema.user.name,
        phone: schema.user.contactPhone,
      })
      .from(schema.courierProfiles)
      .innerJoin(schema.user, eq(schema.courierProfiles.userId, schema.user.id))
      .where(eq(schema.courierProfiles.isActive, true)),
    db
      .select({
        id: schema.cashLedger.id,
        courierId: schema.cashLedger.courierId,
        entryType: schema.cashLedger.entryType,
        amount: schema.cashLedger.amount,
        currency: schema.cashLedger.currency,
        note: schema.cashLedger.note,
        exchangeRateUsed: schema.orders.exchangeRateUsed,
        orderId: schema.cashLedger.orderId,
        orderCode: schema.orders.code,
        createdAt: schema.cashLedger.createdAt,
      })
      .from(schema.cashLedger)
      .innerJoin(
        schema.courierProfiles,
        eq(schema.cashLedger.courierId, schema.courierProfiles.userId)
      )
      .leftJoin(schema.orders, eq(schema.cashLedger.orderId, schema.orders.id))
      .where(
        and(
          eq(schema.courierProfiles.isActive, true),
          sql`${schema.cashLedger.entryType} <> 'reversal'`,
          notInArray(schema.cashLedger.id, reversedSubquery)
        )
      )
      .orderBy(desc(schema.cashLedger.createdAt)),
  ]);

  const entriesByCourierId = new Map<string, typeof allCourierLedgerEntries>();
  for (const entry of allCourierLedgerEntries) {
    if (!entry.courierId) continue;
    const list = entriesByCourierId.get(entry.courierId);
    if (list) list.push(entry);
    else entriesByCourierId.set(entry.courierId, [entry]);
  }

  const couriersList = [];
  let totalPendingOwed = 0;
  const now = new Date();
  let maxUnpaidAgeDays: number | null = null;

  for (const c of activeCouriers) {
    const courierEntries = entriesByCourierId.get(c.id) ?? [];

    const earnedEntries = [];
    const paidEntries = [];
    const discrepancyRows = [];
    let cashHeldCDF = 0;

    for (const entry of courierEntries) {
      if (entry.entryType === "courier_pay") {
        earnedEntries.push(entry);
      } else if (entry.entryType === "courier_pay_paid") {
        paidEntries.push(entry);
      } else if (entry.entryType === "discrepancy") {
        discrepancyRows.push(entry);
      } else if (entry.entryType === "cash_collected" || entry.entryType === "float_issued") {
        if (entry.currency !== "USD") cashHeldCDF += entry.amount;
      } else if (entry.entryType === "cash_remitted" || entry.entryType === "float_returned") {
        if (entry.currency !== "USD") cashHeldCDF -= entry.amount;
      }
    }

    const totalEarnedCDF = earnedEntries.reduce((sum, e) => {
      const rate = Number(e.exchangeRateUsed) || 2800;
      return sum + (e.currency === "USD" ? Math.round(e.amount * rate) : e.amount);
    }, 0);

    const totalPaidCDF = paidEntries.reduce((sum, p) => {
      return sum + (p.currency === "USD" ? Math.round(p.amount * 2800) : p.amount);
    }, 0);

    const balanceOwedCDF = Math.max(0, totalEarnedCDF - totalPaidCDF);
    totalPendingOwed += balanceOwedCDF;

    const lastPaymentAmount = paidEntries[0]
      ? (paidEntries[0].currency === "USD" ? Math.round(paidEntries[0].amount * 2800) : paidEntries[0].amount)
      : null;
    const lastPaymentAt = paidEntries[0]?.createdAt ?? null;

    const cashDiscrepancyCDF = discrepancyRows.reduce((sum, d) => {
      const rate = Number(d.exchangeRateUsed) || 2800;
      const amountCDF = d.currency === "USD" ? Math.round(d.amount * rate) : d.amount;
      const isShortage = d.note ? (d.note.includes("Déficit") || d.note.includes(" : -")) : false;
      const signedAmountCDF = isShortage ? -amountCDF : amountCDF;
      return sum + signedAmountCDF;
    }, 0);

    const deliveredOrders = earnedEntries.map((e) => ({
      id: e.orderId ?? e.id,
      code: e.orderCode ?? "—",
      amount: e.currency === "USD" ? Math.round(e.amount * (Number(e.exchangeRateUsed) || 2800)) : e.amount,
      createdAt: e.createdAt,
    }));

    // Oldest unpaid date calculated via FIFO allocation of paid amounts
    let oldestUnpaidDate: Date | null = null;
    if (balanceOwedCDF > 0 && earnedEntries.length > 0) {
      const chronologicalEarned = [...earnedEntries].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      let remainingPaid = totalPaidCDF;
      for (const entry of chronologicalEarned) {
        const rate = Number(entry.exchangeRateUsed) || 2800;
        const entryAmountCDF = entry.currency === "USD" ? Math.round(entry.amount * rate) : entry.amount;
        if (remainingPaid >= entryAmountCDF) {
          remainingPaid -= entryAmountCDF;
        } else {
          oldestUnpaidDate = entry.createdAt;
          break;
        }
      }
      if (oldestUnpaidDate) {
        const days = Math.max(0, Math.floor((now.getTime() - new Date(oldestUnpaidDate).getTime()) / (1000 * 3600 * 24)));
        if (maxUnpaidAgeDays === null || days > maxUnpaidAgeDays) {
          maxUnpaidAgeDays = days;
        }
      }
    }

    couriersList.push({
      courierId: c.id,
      name: c.name,
      phone: c.phone,
      missionsCount: earnedEntries.length,
      totalEarnedCDF,
      totalPaidCDF,
      balanceOwedCDF,
      lastPaymentAmount,
      lastPaymentAt,
      cashDiscrepancyCDF,
      cashHeldCDF: Math.max(0, cashHeldCDF),
      oldestUnpaidDate,
      deliveredOrders,
    });
  }

  const couriersWithBalanceCount = couriersList.filter((c) => c.balanceOwedCDF > 0).length;

  return {
    couriers: couriersList,
    totalOwedToCouriersCDF: totalPendingOwed,
    couriersWithBalanceCount,
    oldestUnpaidDays: maxUnpaidAgeDays,
  };
}

/**
 * Task 8.4: Settle Courier Pay.
 */
export async function settleCourierPay(params: {
  courierId: string;
  amount: number;
  currency?: "CDF" | "USD";
  reference?: string;
  method?: "mobile_money" | "bank" | "cash";
  period?: string;
  note?: string;
  adminId?: string;
}): Promise<{ ok: boolean; settlementId?: string; newBalanceCDF: number; error?: string }> {
  return await db.transaction(async (tx) => {
    // 1. Lock courier profile row to serialize settlements per courier
    const [profile] = await tx
      .select()
      .from(schema.courierProfiles)
      .where(eq(schema.courierProfiles.userId, params.courierId))
      .for("update")
      .limit(1);

    if (!profile) {
      return { ok: false, error: "Coursier introuvable", newBalanceCDF: 0 };
    }

    const reversedSubquery = tx
      .select({ id: schema.cashLedger.reversalOfId })
      .from(schema.cashLedger)
      .where(
        and(
          eq(schema.cashLedger.entryType, "reversal"),
          sql`${schema.cashLedger.reversalOfId} is not null`
        )
      );

    const earnedEntries = await tx
      .select({
        amount: schema.cashLedger.amount,
        currency: schema.cashLedger.currency,
        exchangeRateUsed: schema.orders.exchangeRateUsed,
      })
      .from(schema.cashLedger)
      .leftJoin(schema.orders, eq(schema.cashLedger.orderId, schema.orders.id))
      .where(
        and(
          eq(schema.cashLedger.courierId, params.courierId),
          eq(schema.cashLedger.entryType, "courier_pay"),
          notInArray(schema.cashLedger.id, reversedSubquery)
        )
      );

    const paidEntries = await tx
      .select({
        amount: schema.cashLedger.amount,
        currency: schema.cashLedger.currency,
      })
      .from(schema.cashLedger)
      .where(
        and(
          eq(schema.cashLedger.courierId, params.courierId),
          eq(schema.cashLedger.entryType, "courier_pay_paid"),
          notInArray(schema.cashLedger.id, reversedSubquery)
        )
      );

    const totalEarnedCDF = earnedEntries.reduce((sum, e) => {
      const rate = Number(e.exchangeRateUsed) || 2800;
      return sum + (e.currency === "USD" ? Math.round(e.amount * rate) : e.amount);
    }, 0);

    const totalPaidCDF = paidEntries.reduce((sum, p) => {
      return sum + (p.currency === "USD" ? Math.round(p.amount * 2800) : p.amount);
    }, 0);

    const currentBalanceCDF = Math.max(0, totalEarnedCDF - totalPaidCDF);
    const amountInCDF = params.currency === "USD" ? Math.round(params.amount * 2800) : params.amount;

    if (amountInCDF > currentBalanceCDF) {
      return {
        ok: false,
        error: `Le montant saisi (${amountInCDF.toLocaleString()} CDF) ne peut pas dépasser le solde restant dû (${currentBalanceCDF.toLocaleString()} CDF)`,
        newBalanceCDF: currentBalanceCDF,
      };
    }

    const currency = params.currency ?? "CDF";
    const methodTag = params.method ? `[MÉTHODE: ${params.method}]` : "";
    const refTag = params.reference ? `[RÉF: ${params.reference}]` : "";
    const periodTag = params.period ? `[PÉRIODE: ${params.period}]` : "";
    const customNote = params.note?.trim() ?? "";
    const combinedParts = [methodTag, refTag, periodTag, customNote].filter(Boolean);
    const finalNote =
      combinedParts.length > 0
        ? combinedParts.join(" ")
        : params.reference
          ? `Règlement rémunération : ${params.reference}`
          : `Règlement des courses du coursier (${params.amount} ${currency})`;

    const [entry] = await tx
      .insert(schema.cashLedger)
      .values({
        entryType: "courier_pay_paid",
        courierId: params.courierId,
        currency,
        amount: params.amount,
        note: finalNote,
        createdBy: params.adminId ?? null,
      })
      .returning();

    return {
      ok: true,
      settlementId: entry.id,
      newBalanceCDF: currentBalanceCDF - amountInCDF,
    };
  });
}

/**
 * Task 8.4: Get past settlement and payout logs for both houses and couriers.
 */
export async function getSettlementHistoryLogs(limit = 100): Promise<
  Array<{
    id: string;
    entryType: "house_settlement_paid" | "courier_pay_paid";
    payeeType: "house" | "courier";
    payeeId: string;
    payeeName: string;
    payeePhone: string | null;
    payeeNeighborhood: string | null;
    amount: number;
    currency: "CDF" | "USD";
    method: "mobile_money" | "bank" | "cash";
    reference: string | null;
    period: string | null;
    note: string | null;
    operatorId: string | null;
    operatorName: string | null;
    createdAt: Date;
    isReversed: boolean;
    reversalReason: string | null;
    reversedAt: Date | null;
    reversedByName: string | null;
  }>
> {
  const operatorUser = alias(schema.user, "operator_user");
  const reversedUser = alias(schema.user, "reversed_user");
  const reversalLedger = alias(schema.cashLedger, "reversal_ledger");

  const rows = await db
    .select({
      id: schema.cashLedger.id,
      entryType: schema.cashLedger.entryType,
      houseId: schema.cashLedger.houseId,
      houseName: schema.houses.name,
      courierId: schema.cashLedger.courierId,
      courierName: schema.user.name,
      courierPhone: schema.user.contactPhone,
      neighborhoodName: schema.neighborhoods.name,
      amount: schema.cashLedger.amount,
      currency: schema.cashLedger.currency,
      note: schema.cashLedger.note,
      createdAt: schema.cashLedger.createdAt,
      createdBy: schema.cashLedger.createdBy,
      operatorName: operatorUser.name,
      reversalId: reversalLedger.id,
      reversalNote: reversalLedger.note,
      reversalCreatedAt: reversalLedger.createdAt,
      reversedByName: reversedUser.name,
    })
    .from(schema.cashLedger)
    .leftJoin(schema.houses, eq(schema.cashLedger.houseId, schema.houses.id))
    .leftJoin(schema.neighborhoods, eq(schema.houses.neighborhoodId, schema.neighborhoods.id))
    .leftJoin(schema.user, eq(schema.cashLedger.courierId, schema.user.id))
    .leftJoin(operatorUser, eq(schema.cashLedger.createdBy, operatorUser.id))
    .leftJoin(
      reversalLedger,
      and(
        eq(reversalLedger.entryType, "reversal"),
        eq(reversalLedger.reversalOfId, schema.cashLedger.id)
      )
    )
    .leftJoin(reversedUser, eq(reversalLedger.createdBy, reversedUser.id))
    .where(
      inArray(schema.cashLedger.entryType, ["house_settlement_paid", "courier_pay_paid"])
    )
    .orderBy(desc(schema.cashLedger.createdAt))
    .limit(limit);

  return rows.map((r) => {
    const isHouse = r.entryType === "house_settlement_paid";
    const payeeType = isHouse ? "house" : "courier";
    const payeeId = (isHouse ? r.houseId : r.courierId) ?? "";
    const payeeName = (isHouse ? r.houseName : r.courierName) ?? "Bénéficiaire";

    const note = r.note ?? "";
    const methodTagMatch = note.match(/\[MÉTHODE:\s*([^\]]+)\]/i);
    let method: "mobile_money" | "bank" | "cash" = "cash";

    if (methodTagMatch) {
      const parsedMethod = methodTagMatch[1].trim().toLowerCase();
      if (parsedMethod === "mobile_money") {
        method = "mobile_money";
      } else if (parsedMethod === "bank") {
        method = "bank";
      } else if (parsedMethod === "cash") {
        method = "cash";
      }
    } else {
      if (
        note.includes("mobile_money") ||
        note.includes("M-Pesa") ||
        note.includes("Airtel") ||
        note.includes("Orange")
      ) {
        method = "mobile_money";
      } else if (note.includes("bank") || note.includes("Virement") || note.includes("Banque")) {
        method = "bank";
      }
    }

    const refMatch =
      note.match(/\[RÉF:\s*([^\]]+)\]/i) || note.match(/(?:Réf|Référence)\s*[:#]\s*([^\s,;]+)/i);
    const reference = refMatch ? refMatch[1].trim() : null;

    const periodMatch = note.match(/\[PÉRIODE:\s*([^\]]+)\]/i);
    const period = periodMatch ? periodMatch[1].trim() : null;

    const cleanNote = note
      .replace(/\[MÉTHODE:[^\]]+\]/gi, "")
      .replace(/\[RÉF:[^\]]+\]/gi, "")
      .replace(/\[PÉRIODE:[^\]]+\]/gi, "")
      .trim();

    return {
      id: r.id,
      entryType: r.entryType as "house_settlement_paid" | "courier_pay_paid",
      payeeType,
      payeeId,
      payeeName,
      payeePhone: isHouse ? null : r.courierPhone,
      payeeNeighborhood: isHouse ? r.neighborhoodName : null,
      amount: r.amount,
      currency: r.currency as "CDF" | "USD",
      method,
      reference,
      period,
      note: cleanNote || null,
      operatorId: r.createdBy,
      operatorName: r.operatorName ?? "Opérateur",
      createdAt: r.createdAt,
      isReversed: Boolean(r.reversalId),
      reversalReason: r.reversalNote,
      reversedAt: r.reversalCreatedAt,
      reversedByName: r.reversedByName,
    };
  });
}

/**
 * Task 8.6: Comprehensive Success Criteria Metrics for /admin dashboard.
 * - Orders per week (pilot target: >= 20)
 * - House acceptance rate (pilot target: >= 80%)
 * - Average margin per order in CDF (pilot target: > 0)
 * - Cash discrepancies count & % of cash collected (pilot target: < 2%)
 * - Dispute rate % (pilot target: < 5%)
 * - Admin minutes per order (pilot target: <= 10 min)
 */
export async function getSuccessCriteriaDashboard(): Promise<{
  ordersPerWeek: number;
  acceptanceRatePercent: number;
  marginPerOrderCDF: number;
  cashDiscrepanciesCount: number;
  cashDiscrepancyPercent: number;
  disputeRatePercent: number;
  adminMinutesPerOrder: number | null;
  totalDeliveredOrders: number;
  totalCollectedCashCDF: number;
}> {
  // 1. Orders per week (count orders in last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [recentOrders] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.orders)
    .where(sql`${schema.orders.createdAt} >= ${sevenDaysAgo}`);

  const ordersPerWeek = recentOrders?.count ?? 0;

  // 2. Acceptance rate: accepted / (accepted + rejected + expired)
  const [acceptedOrders] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.orders)
    .where(
      sql`${schema.orders.acceptedAt} is not null or ${schema.orders.status} in ('accepted', 'pickup_assigned', 'pickup_in_progress', 'picked_up', 'received', 'washing', 'ready', 'delivery_assigned', 'delivery_in_progress', 'delivered')`
    );

  const [terminalBeforeAccepted] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.orders)
    .where(sql`${schema.orders.status} in ('rejected', 'expired')`);

  const acceptedCount = acceptedOrders?.count ?? 0;
  const rejectedExpiredCount = terminalBeforeAccepted?.count ?? 0;
  const totalDecided = acceptedCount + rejectedExpiredCount;
  const acceptanceRatePercent =
    totalDecided > 0 ? Math.round((acceptedCount / totalDecided) * 100) : 100;

  // 3. Margin per order (CDF): sum(owed_to_owner) / delivered orders count
  const reversedSubquery = db
    .select({ id: schema.cashLedger.reversalOfId })
    .from(schema.cashLedger)
    .where(
      and(
        eq(schema.cashLedger.entryType, "reversal"),
        sql`${schema.cashLedger.reversalOfId} is not null`
      )
    );

  const [deliveredOrders] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.orders)
    .where(eq(schema.orders.status, "delivered"));

  const deliveredCount = deliveredOrders?.count ?? 0;

  const ownerEntries = await db
    .select({
      amount: schema.cashLedger.amount,
      currency: schema.cashLedger.currency,
      exchangeRateUsed: schema.orders.exchangeRateUsed,
    })
    .from(schema.cashLedger)
    .leftJoin(schema.orders, eq(schema.cashLedger.orderId, schema.orders.id))
    .where(
      and(
        eq(schema.cashLedger.entryType, "owed_to_owner"),
        notInArray(schema.cashLedger.id, reversedSubquery)
      )
    );

  const totalOwnerMargin = ownerEntries.reduce((sum, e) => {
    const rate = Number(e.exchangeRateUsed) || 2800;
    return sum + (e.currency === "USD" ? Math.round(e.amount * rate) : e.amount);
  }, 0);

  const marginPerOrderCDF =
    deliveredCount > 0 ? Math.round(totalOwnerMargin / deliveredCount) : 0;

  // 4. Cash discrepancies: count and % of cash collected
  const collectedEntries = await db
    .select({
      amount: schema.cashLedger.amount,
      currency: schema.cashLedger.currency,
      exchangeRateUsed: schema.orders.exchangeRateUsed,
    })
    .from(schema.cashLedger)
    .leftJoin(schema.orders, eq(schema.cashLedger.orderId, schema.orders.id))
    .where(
      and(
        eq(schema.cashLedger.entryType, "cash_collected"),
        notInArray(schema.cashLedger.id, reversedSubquery)
      )
    );

  const totalCollectedCashCDF = collectedEntries.reduce((sum, e) => {
    const rate = Number(e.exchangeRateUsed) || 2800;
    return sum + (e.currency === "USD" ? Math.round(e.amount * rate) : e.amount);
  }, 0);

  const discrepancyEntries = await db
    .select({
      amount: schema.cashLedger.amount,
      currency: schema.cashLedger.currency,
      exchangeRateUsed: schema.orders.exchangeRateUsed,
    })
    .from(schema.cashLedger)
    .leftJoin(schema.orders, eq(schema.cashLedger.orderId, schema.orders.id))
    .where(
      and(
        eq(schema.cashLedger.entryType, "discrepancy"),
        sql`${schema.cashLedger.missionId} is not null`,
        notInArray(schema.cashLedger.id, reversedSubquery)
      )
    );

  const discrepanciesCount = discrepancyEntries.length;
  const sumDiscrepancyAmount = discrepancyEntries.reduce((sum, e) => {
    const rate = Number(e.exchangeRateUsed) || 2800;
    return sum + (e.currency === "USD" ? Math.round(e.amount * rate) : e.amount);
  }, 0);

  const cashDiscrepancyPercent =
    totalCollectedCashCDF > 0
      ? Number(((sumDiscrepancyAmount / totalCollectedCashCDF) * 100).toFixed(1))
      : 0;

  // 5. Dispute rate: orders ending in dispute or cancellation after pickup / total orders picked up
  const [allOrdersTotal] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.orders);

  const [disputesTotal] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.disputes);

  const totalOrdersCount = allOrdersTotal?.count ?? 0;
  const totalDisputesCount = disputesTotal?.count ?? 0;
  const disputeRatePercent =
    totalOrdersCount > 0
      ? Number(((totalDisputesCount / totalOrdersCount) * 100).toFixed(1))
      : 0;

  // 6. Admin minutes per order (unmeasured benchmark; null until observed metric exists)
  const adminMinutesPerOrder: number | null = null;

  return {
    ordersPerWeek,
    acceptanceRatePercent,
    marginPerOrderCDF,
    cashDiscrepanciesCount: discrepanciesCount,
    cashDiscrepancyPercent,
    disputeRatePercent,
    adminMinutesPerOrder,
    totalDeliveredOrders: deliveredCount,
    totalCollectedCashCDF,
  };
}
