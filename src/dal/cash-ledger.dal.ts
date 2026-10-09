import "server-only";
import { and, desc, eq, notInArray, sql } from "drizzle-orm";
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

    // Held cash overall
    const balances = await getCourierCashBalances(c.id);

    // Existing reconciliation record for this date
    const [recon] = await db
      .select()
      .from(schema.cashReconciliations)
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
        note: `Versement journalier validé (${businessDate}) : ${receivedAmount} ${currency}`,
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
        note: `Écart journalier (${businessDate}) : ${difference} ${currency} (${
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
          note: `Déduction de caution suite à écart de caisse du ${businessDate} (-${deductionAmount} ${currency})`,
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
export async function getReconciliationLogs(limit = 30): Promise<
  Array<{
    id: string;
    courierId: string;
    courierName: string | null;
    businessDate: string;
    currency: "CDF" | "USD";
    expectedAmount: number;
    receivedAmount: number;
    difference: number;
    status: string;
    note: string | null;
    reconciledBy: string | null;
    createdAt: Date;
  }>
> {
  const rows = await db
    .select({
      id: schema.cashReconciliations.id,
      courierId: schema.cashReconciliations.courierId,
      courierName: schema.user.name,
      businessDate: schema.cashReconciliations.businessDate,
      currency: schema.cashReconciliations.currency,
      expectedAmount: schema.cashReconciliations.expectedAmount,
      receivedAmount: schema.cashReconciliations.receivedAmount,
      difference: schema.cashReconciliations.difference,
      status: schema.cashReconciliations.status,
      note: schema.cashReconciliations.note,
      reconciledBy: schema.cashReconciliations.reconciledBy,
      createdAt: schema.cashReconciliations.createdAt,
    })
    .from(schema.cashReconciliations)
    .innerJoin(schema.user, eq(schema.cashReconciliations.courierId, schema.user.id))
    .orderBy(desc(schema.cashReconciliations.businessDate), desc(schema.cashReconciliations.createdAt))
    .limit(limit);

  return rows.map((r) => ({
    ...r,
    currency: r.currency as "CDF" | "USD",
  }));
}

/**
 * Task 8.4: Get house settlements summary for admin.
 */
export async function getHouseSettlementsOverview(): Promise<{
  houses: Array<{
    houseId: string;
    name: string;
    neighborhoodName: string | null;
    totalOwedCDF: number;
    totalSettledCDF: number;
    balanceOwedCDF: number;
    lastSettlementAt: Date | null;
    deliveredOrdersCount: number;
  }>;
  totalOwedToHousesCDF: number;
}> {
  const allHouses = await db
    .select({
      id: schema.houses.id,
      name: schema.houses.name,
      neighborhoodName: schema.neighborhoods.name,
    })
    .from(schema.houses)
    .leftJoin(schema.neighborhoods, eq(schema.houses.neighborhoodId, schema.neighborhoods.id))
    .where(eq(schema.houses.isActive, true));

  const reversedSubquery = db
    .select({ id: schema.cashLedger.reversalOfId })
    .from(schema.cashLedger)
    .where(
      and(
        eq(schema.cashLedger.entryType, "reversal"),
        sql`${schema.cashLedger.reversalOfId} is not null`
      )
    );

  const housesSummary = [];
  let totalPendingOwed = 0;

  for (const h of allHouses) {
    // Total owed_to_house entries
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
          eq(schema.cashLedger.houseId, h.id),
          eq(schema.cashLedger.entryType, "owed_to_house"),
          notInArray(schema.cashLedger.id, reversedSubquery)
        )
      );

    const totalOwedCDF = owedEntries.reduce((sum, e) => {
      const rate = Number(e.exchangeRateUsed) || 2800;
      return sum + (e.currency === "USD" ? Math.round(e.amount * rate) : e.amount);
    }, 0);

    // Total house_settlement_paid entries
    const settledEntries = await db
      .select({
        amount: schema.cashLedger.amount,
        currency: schema.cashLedger.currency,
        createdAt: schema.cashLedger.createdAt,
      })
      .from(schema.cashLedger)
      .where(
        and(
          eq(schema.cashLedger.houseId, h.id),
          eq(schema.cashLedger.entryType, "house_settlement_paid"),
          notInArray(schema.cashLedger.id, reversedSubquery)
        )
      )
      .orderBy(desc(schema.cashLedger.createdAt));

    const totalSettledCDF = settledEntries.reduce((sum, e) => {
      return sum + (e.currency === "USD" ? Math.round(e.amount * 2800) : e.amount);
    }, 0);
    const balanceOwedCDF = Math.max(0, totalOwedCDF - totalSettledCDF);
    totalPendingOwed += balanceOwedCDF;

    const [ordersCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.orders)
      .where(
        and(
          eq(schema.orders.houseId, h.id),
          eq(schema.orders.status, "delivered")
        )
      );

    housesSummary.push({
      houseId: h.id,
      name: h.name,
      neighborhoodName: h.neighborhoodName,
      totalOwedCDF,
      totalSettledCDF,
      balanceOwedCDF,
      lastSettlementAt: settledEntries[0]?.createdAt ?? null,
      deliveredOrdersCount: ordersCount?.count ?? 0,
    });
  }

  return {
    houses: housesSummary,
    totalOwedToHousesCDF: totalPendingOwed,
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
  adminId?: string;
}): Promise<{ ok: boolean; settlementId?: string; newBalanceCDF: number; error?: string }> {
  return await db.transaction(async (tx) => {
    const currency = params.currency ?? "CDF";
    const [entry] = await tx
      .insert(schema.cashLedger)
      .values({
        entryType: "house_settlement_paid",
        houseId: params.houseId,
        currency,
        amount: params.amount,
        note: params.reference
          ? `Règlement pressing : ${params.reference}`
          : `Règlement hebdomadaire pressing (${params.amount} ${currency})`,
        createdBy: params.adminId ?? null,
      })
      .returning();

    // Query new balance
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

    const newBalanceCDF = Math.max(0, totalOwedCDF - totalSettledCDF);

    return {
      ok: true,
      settlementId: entry.id,
      newBalanceCDF,
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
    totalEarnedCDF: number;
    totalPaidCDF: number;
    balanceOwedCDF: number;
    lastPaymentAt: Date | null;
  }>;
  totalOwedToCouriersCDF: number;
}> {
  const activeCouriers = await db
    .select({
      id: schema.user.id,
      name: schema.user.name,
      phone: schema.user.contactPhone,
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

  const couriersList = [];
  let totalPendingOwed = 0;

  for (const c of activeCouriers) {
    const earnedEntries = await db
      .select({
        amount: schema.cashLedger.amount,
        currency: schema.cashLedger.currency,
        exchangeRateUsed: schema.orders.exchangeRateUsed,
      })
      .from(schema.cashLedger)
      .leftJoin(schema.orders, eq(schema.cashLedger.orderId, schema.orders.id))
      .where(
        and(
          eq(schema.cashLedger.courierId, c.id),
          eq(schema.cashLedger.entryType, "courier_pay"),
          notInArray(schema.cashLedger.id, reversedSubquery)
        )
      );

    const paidEntries = await db
      .select({
        amount: schema.cashLedger.amount,
        currency: schema.cashLedger.currency,
        createdAt: schema.cashLedger.createdAt,
      })
      .from(schema.cashLedger)
      .where(
        and(
          eq(schema.cashLedger.courierId, c.id),
          eq(schema.cashLedger.entryType, "courier_pay_paid"),
          notInArray(schema.cashLedger.id, reversedSubquery)
        )
      )
      .orderBy(desc(schema.cashLedger.createdAt));

    const totalEarnedCDF = earnedEntries.reduce((sum, e) => {
      const rate = Number(e.exchangeRateUsed) || 2800;
      return sum + (e.currency === "USD" ? Math.round(e.amount * rate) : e.amount);
    }, 0);

    const totalPaidCDF = paidEntries.reduce((sum, p) => {
      return sum + (p.currency === "USD" ? Math.round(p.amount * 2800) : p.amount);
    }, 0);

    const balanceOwedCDF = Math.max(0, totalEarnedCDF - totalPaidCDF);
    totalPendingOwed += balanceOwedCDF;

    couriersList.push({
      courierId: c.id,
      name: c.name,
      phone: c.phone,
      totalEarnedCDF,
      totalPaidCDF,
      balanceOwedCDF,
      lastPaymentAt: paidEntries[0]?.createdAt ?? null,
    });
  }

  return {
    couriers: couriersList,
    totalOwedToCouriersCDF: totalPendingOwed,
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
  adminId?: string;
}): Promise<{ ok: boolean; settlementId?: string; newBalanceCDF: number }> {
  return await db.transaction(async (tx) => {
    const currency = params.currency ?? "CDF";
    const [entry] = await tx
      .insert(schema.cashLedger)
      .values({
        entryType: "courier_pay_paid",
        courierId: params.courierId,
        currency,
        amount: params.amount,
        note: params.reference
          ? `Règlement rémunération : ${params.reference}`
          : `Règlement des courses du coursier (${params.amount} ${currency})`,
        createdBy: params.adminId ?? null,
      })
      .returning();

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

    const newBalanceCDF = Math.max(0, totalEarnedCDF - totalPaidCDF);

    return {
      ok: true,
      settlementId: entry.id,
      newBalanceCDF,
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
