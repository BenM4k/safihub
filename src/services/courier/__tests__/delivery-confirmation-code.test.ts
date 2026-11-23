import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  completeDeliveryMissionAtomic,
  completePickupMissionAtomic,
  startDeliveryMissionAtomic,
} from "@/dal/courier.dal";

interface CapturedOrderValues {
  status?: string;
  deliveryConfirmationCode?: string | null;
}

const mockAs = <T>(val: unknown): T => val as T;

describe("Phase 10.3: Delivery Confirmation Code", () => {
  const missionId = "miss_deliv_1";
  const courierId = "cour_user_1";
  const orderId = "ord_deliv_1";
  const correctCode = "5829";

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("generates a delivery confirmation code when delivery starts", async () => {
    const { db } = await import("@/dal/db");

    const captured: { updatedOrderValues?: CapturedOrderValues } = {};

    vi.spyOn(db, "transaction").mockImplementation(async (callback) => {
      const queryBuilder: Record<string, unknown> = {
        for: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([
            {
              id: missionId,
              type: "delivery",
              status: "assigned",
              courierId,
              orderId,
            },
          ]),
        }),
        limit: vi.fn().mockResolvedValue([
          {
            id: orderId,
            status: "delivery_assigned",
            deliveryConfirmationCode: null, // Null before delivery start
          },
        ]),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockImplementation(() => queryBuilder),
        then: vi.fn().mockImplementation((onResolve) => Promise.resolve([]).then(onResolve)),
      };

      const mockTx = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue(queryBuilder),
        }),
        update: vi.fn().mockReturnValue({
          set: vi.fn().mockImplementation((vals) => {
            if (vals.deliveryConfirmationCode !== undefined) {
              captured.updatedOrderValues = vals;
            }
            return {
              where: vi.fn().mockResolvedValue([]),
            };
          }),
        }),
        insert: vi.fn().mockReturnValue({
          values: vi.fn().mockResolvedValue([]),
        }),
      };
      return await callback(mockAs(mockTx));
    });

    const res = await startDeliveryMissionAtomic(missionId, courierId);

    expect(res.ok).toBe(true);
    expect(captured.updatedOrderValues?.status).toBe("delivery_in_progress");
    expect(captured.updatedOrderValues?.deliveryConfirmationCode).toBeDefined();
    expect(typeof captured.updatedOrderValues?.deliveryConfirmationCode).toBe("string");
    expect(String(captured.updatedOrderValues?.deliveryConfirmationCode)).toMatch(/^\d{6}$/);
  });

  it("fails and cannot complete delivery when the entered code is wrong", async () => {
    const { db } = await import("@/dal/db");

    vi.spyOn(db, "transaction").mockImplementation(async (callback) => {
      const mockTx = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              for: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue([
                  {
                    id: missionId,
                    type: "delivery",
                    status: "in_progress",
                    courierId,
                    orderId,
                  },
                ]),
              }),
              limit: vi.fn().mockResolvedValue([
                {
                  id: orderId,
                  status: "delivery_in_progress",
                  deliveryConfirmationCode: correctCode,
                  itemsTotal: 10000,
                  deliveryFee: 2500,
                  commissionAmount: 2000,
                  totalDue: 12500,
                  paymentCurrency: "CDF",
                },
              ]),
            }),
          }),
        }),
      };
      return await callback(mockAs(mockTx));
    });

    const wrongCodeRes = await completeDeliveryMissionAtomic({
      missionId,
      courierId,
      confirmationCode: "0000", // WRONG CODE
      cashCollected: 12500,
    });

    expect(wrongCodeRes.ok).toBe(false);
    expect(wrongCodeRes.error).toContain("Code de confirmation de livraison invalide");
  });

  it("fails and cannot complete delivery when the entered code is empty", async () => {
    const { db } = await import("@/dal/db");

    vi.spyOn(db, "transaction").mockImplementation(async (callback) => {
      const mockTx = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              for: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue([
                  {
                    id: missionId,
                    type: "delivery",
                    status: "in_progress",
                    courierId,
                    orderId,
                  },
                ]),
              }),
              limit: vi.fn().mockResolvedValue([
                {
                  id: orderId,
                  status: "delivery_in_progress",
                  deliveryConfirmationCode: correctCode,
                },
              ]),
            }),
          }),
        }),
      };
      return await callback(mockAs(mockTx));
    });

    const emptyCodeRes = await completeDeliveryMissionAtomic({
      missionId,
      courierId,
      confirmationCode: "   ", // EMPTY
      cashCollected: 12500,
    });

    expect(emptyCodeRes.ok).toBe(false);
    expect(emptyCodeRes.error).toContain("Code de confirmation de livraison invalide");
  });

  it("successfully completes delivery when the correct confirmation code is provided", async () => {
    const { db } = await import("@/dal/db");

    let completedMissionStatus = "";
    let completedOrderStatus = "";

    vi.spyOn(db, "transaction").mockImplementation(async (callback) => {
      const mockTx = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              for: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue([
                  {
                    id: missionId,
                    type: "delivery",
                    status: "in_progress",
                    courierId,
                    orderId,
                    courierPay: 1500,
                  },
                ]),
              }),
              limit: vi.fn().mockResolvedValue([
                {
                  id: orderId,
                  status: "delivery_in_progress",
                  deliveryConfirmationCode: correctCode,
                  houseId: "house_1",
                  itemsTotal: 10000,
                  adjustedItemsTotal: null,
                  deliveryFee: 2500,
                  commissionAmount: 2000,
                  totalDue: 12500,
                  paymentCurrency: "CDF",
                },
              ]),
            }),
          }),
        }),
        update: vi.fn().mockReturnValue({
          set: vi.fn().mockImplementation((vals) => {
            if (vals.status === "completed") completedMissionStatus = "completed";
            if (vals.status === "delivered") completedOrderStatus = "delivered";
            return {
              where: vi.fn().mockResolvedValue([]),
            };
          }),
        }),
        insert: vi.fn().mockReturnValue({
          values: vi.fn().mockResolvedValue([]),
        }),
      };
      return await callback(mockAs(mockTx));
    });

    const successRes = await completeDeliveryMissionAtomic({
      missionId,
      courierId,
      confirmationCode: correctCode, // EXACT MATCH
      cashCollected: 12500,
    });

    expect(successRes.ok).toBe(true);
    expect(completedMissionStatus).toBe("completed");
    expect(completedOrderStatus).toBe("delivered");
  });

  it("posts CDF accounting splits and does not inflate totalDue on USD-paid orders", async () => {
    const { db } = await import("@/dal/db");
    const insertedLedgerRows: Array<Record<string, unknown>> = [];

    vi.spyOn(db, "transaction").mockImplementation(async (callback) => {
      const mockTx = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              for: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue([
                  {
                    id: missionId,
                    type: "delivery",
                    status: "in_progress",
                    courierId,
                    orderId,
                    courierPay: 1500,
                  },
                ]),
              }),
              limit: vi.fn().mockResolvedValue([
                {
                  id: orderId,
                  status: "delivery_in_progress",
                  deliveryConfirmationCode: correctCode,
                  houseId: "house_1",
                  itemsTotal: 11500,
                  adjustedItemsTotal: null,
                  deliveryFee: 2500,
                  commissionAmount: 2300,
                  totalDue: 14000, // Always stored in CDF (= 5 USD @ 2800)
                  paymentCurrency: "USD",
                  exchangeRateUsed: 2800,
                },
              ]),
            }),
          }),
        }),
        update: vi.fn().mockReturnValue({
          set: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([]),
          }),
        }),
        insert: vi.fn().mockImplementation((table) => ({
          values: vi.fn().mockImplementation(async (vals) => {
            const { schema } = await import("@/dal/db");
            if (table === schema.cashLedger) {
              insertedLedgerRows.push(vals as Record<string, unknown>);
            }
            return [];
          }),
        })),
      };
      return await callback(mockAs(mockTx));
    });

    const res = await completeDeliveryMissionAtomic({
      missionId,
      courierId,
      confirmationCode: correctCode,
      cashCollected: 5,
      cashCurrency: "USD",
    });

    expect(res.ok).toBe(true);
    expect(res.discrepancyFlagged).toBe(false);

    const cashRow = insertedLedgerRows.find((r) => r.entryType === "cash_collected");
    const houseRow = insertedLedgerRows.find((r) => r.entryType === "owed_to_house");
    const ownerRow = insertedLedgerRows.find((r) => r.entryType === "owed_to_owner");
    const courierRow = insertedLedgerRows.find((r) => r.entryType === "courier_pay");
    const discrepancyRow = insertedLedgerRows.find((r) => r.entryType === "discrepancy");

    expect(discrepancyRow).toBeUndefined();
    expect(cashRow).toMatchObject({ currency: "USD", amount: 5 });
    expect(houseRow).toMatchObject({ currency: "CDF", amount: 9200 });
    expect(ownerRow).toMatchObject({ currency: "CDF", amount: 3300 });
    expect(courierRow).toMatchObject({ currency: "CDF", amount: 1500 });
  });

  it("credits pickup-leg courier_pay in CDF when completing a pickup mission", async () => {
    const { db } = await import("@/dal/db");
    const insertedLedgerRows: Array<Record<string, unknown>> = [];

    vi.spyOn(db, "transaction").mockImplementation(async (callback) => {
      const mockTx = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockImplementation(() => {
              const chain = {
                for: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue([
                    {
                      id: "miss_pickup_1",
                      type: "pickup",
                      status: "in_progress",
                      courierId,
                      orderId,
                      courierPay: 2000,
                    },
                  ]),
                }),
                limit: vi.fn().mockResolvedValue([
                  {
                    id: orderId,
                    status: "pickup_in_progress",
                    houseId: "house_1",
                  },
                ]),
                then: vi.fn().mockImplementation((onResolve) => Promise.resolve([]).then(onResolve)),
              };
              return chain;
            }),
          }),
        }),
        update: vi.fn().mockReturnValue({
          set: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([]),
          }),
        }),
        insert: vi.fn().mockImplementation((table) => ({
          values: vi.fn().mockImplementation(async (vals) => {
            const { schema } = await import("@/dal/db");
            if (table === schema.cashLedger) {
              insertedLedgerRows.push(vals as Record<string, unknown>);
            }
            return [];
          }),
        })),
      };
      return await callback(mockAs(mockTx));
    });

    const res = await completePickupMissionAtomic({
      missionId: "miss_pickup_1",
      courierId,
      items: [],
    });

    expect(res.ok).toBe(true);
    expect(insertedLedgerRows).toHaveLength(1);
    expect(insertedLedgerRows[0]).toMatchObject({
      entryType: "courier_pay",
      missionId: "miss_pickup_1",
      courierId,
      currency: "CDF",
      amount: 2000,
    });
  });

  it("rejects starting delivery mission if order is in 'ready' status instead of 'delivery_assigned'", async () => {
    const { db } = await import("@/dal/db");

    vi.spyOn(db, "transaction").mockImplementation(async (callback) => {
      const queryBuilder: Record<string, unknown> = {
        for: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([
            {
              id: missionId,
              type: "delivery",
              status: "assigned",
              courierId,
              orderId,
            },
          ]),
        }),
        limit: vi.fn().mockResolvedValue([
          {
            id: orderId,
            status: "ready",
            deliveryConfirmationCode: null,
          },
        ]),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockImplementation(() => queryBuilder),
        then: vi.fn().mockImplementation((onResolve) => Promise.resolve([]).then(onResolve)),
      };

      const mockTx = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue(queryBuilder),
        }),
      };
      return await callback(mockAs(mockTx));
    });

    const res = await startDeliveryMissionAtomic(missionId, courierId);
    expect(res.ok).toBe(false);
    expect(res.error).toContain("Invalid transition");
  });

  it("reconciles owed_to_house, owed_to_owner, pickup courier_pay, and delivery courier_pay with cash_collected", async () => {
    const { db, schema } = await import("@/dal/db");
    const insertedLedgerRows: Array<Record<string, unknown>> = [];

    vi.spyOn(db, "transaction").mockImplementation(async (callback) => {
      const mockTx = {
        select: vi.fn().mockImplementation(() => ({
          from: vi.fn().mockImplementation((table) => ({
            where: vi.fn().mockImplementation(() => ({
              for: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue([
                  {
                    id: missionId,
                    type: "delivery",
                    status: "in_progress",
                    courierId: "courier_delivery_2",
                    orderId,
                    courierPay: 1500,
                  },
                ]),
              }),
              limit: vi.fn().mockImplementation(async () => {
                if (table === schema.cashLedger) {
                  return [
                    {
                      id: "ledger_pickup_pay_1",
                      entryType: "courier_pay",
                      missionId: "miss_pickup_1",
                      currency: "CDF",
                      amount: 1000,
                      reversalOfId: null,
                    },
                  ];
                }
                return [
                  {
                    id: orderId,
                    status: "delivery_in_progress",
                    deliveryConfirmationCode: correctCode,
                    houseId: "house_1",
                    itemsTotal: 10000,
                    adjustedItemsTotal: null,
                    deliveryFee: 3000,
                    commissionAmount: 2000,
                    totalDue: 13000,
                    paymentCurrency: "CDF",
                    exchangeRateUsed: 2800,
                  },
                ];
              }),
            })),
          })),
        })),
        update: vi.fn().mockReturnValue({
          set: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([]),
          }),
        }),
        insert: vi.fn().mockImplementation((table) => ({
          values: vi.fn().mockImplementation(async (vals) => {
            if (table === schema.cashLedger) {
              insertedLedgerRows.push(vals as Record<string, unknown>);
            }
            return [];
          }),
        })),
      };
      return await callback(mockAs(mockTx));
    });

    const res = await completeDeliveryMissionAtomic({
      missionId,
      courierId: "courier_delivery_2",
      confirmationCode: correctCode,
      cashCollected: 13000,
      cashCurrency: "CDF",
    });

    expect(res.ok).toBe(true);
    expect(res.discrepancyFlagged).toBe(false);

    const cashRow = insertedLedgerRows.find((r) => r.entryType === "cash_collected");
    const houseRow = insertedLedgerRows.find((r) => r.entryType === "owed_to_house");
    const ownerRow = insertedLedgerRows.find((r) => r.entryType === "owed_to_owner");
    const deliveryCourierRow = insertedLedgerRows.find((r) => r.entryType === "courier_pay");

    // Prior pickup leg = 1000 CDF; delivery leg = 1500 CDF; commission = 2000; deliveryFee = 3000
    // owedToHouse = 8000, owedToOwner = 2000 + 3000 - (1000 + 1500) = 2500
    // Total: 8000 + 2500 + 1000 + 1500 = 13000 === cashCollected
    expect(cashRow?.amount).toBe(13000);
    expect(houseRow?.amount).toBe(8000);
    expect(ownerRow?.amount).toBe(2500);
    expect(deliveryCourierRow?.amount).toBe(1500);
    expect(
      Number(houseRow?.amount) +
        Number(ownerRow?.amount) +
        1000 +
        Number(deliveryCourierRow?.amount)
    ).toBe(Number(cashRow?.amount));
  });

  it("does not update order_items in completePickupMissionAtomic when order transition fails", async () => {
    const { db, schema } = await import("@/dal/db");
    const updatedTables: unknown[] = [];

    vi.spyOn(db, "transaction").mockImplementation(async (callback) => {
      const mockTx = {
        select: vi.fn().mockImplementation(() => ({
          from: vi.fn().mockImplementation((table) => ({
            where: vi.fn().mockImplementation(() => {
              if (table === schema.orderItems) {
                return Promise.resolve([
                  {
                    id: "oi_1",
                    orderId,
                    declaredQuantity: 2,
                    conditionNote: null,
                    isFlagged: false,
                  },
                ]);
              }
              if (table === schema.orderPhotos) {
                return Promise.resolve([]);
              }
              return {
                for: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue([
                    {
                      id: "miss_pickup_invalid",
                      type: "pickup",
                      status: "in_progress",
                      courierId,
                      orderId,
                      courierPay: 1000,
                    },
                  ]),
                }),
                limit: vi.fn().mockResolvedValue([
                  {
                    id: orderId,
                    status: "created", // Cannot transition directly from 'created' -> 'picked_up'
                    houseId: "house_1",
                  },
                ]),
              };
            }),
          })),
        })),
        update: vi.fn().mockImplementation((table) => {
          updatedTables.push(table);
          return {
            set: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue([]),
            }),
          };
        }),
        insert: vi.fn().mockReturnValue({
          values: vi.fn().mockResolvedValue([]),
        }),
      };
      return await callback(mockAs(mockTx));
    });

    const res = await completePickupMissionAtomic({
      missionId: "miss_pickup_invalid",
      courierId,
      items: [{ orderItemId: "oi_1", pickupQuantity: 3 }],
    });

    expect(res.ok).toBe(false);
    expect(updatedTables).not.toContain(schema.orderItems);
  });

  it("records explicit negative owed_to_owner entry when combined pickup and delivery courier pay exceeds order margin", async () => {
    const { db, schema } = await import("@/dal/db");
    const insertedLedgerRows: Array<Record<string, unknown>> = [];

    vi.spyOn(db, "transaction").mockImplementation(async (callback) => {
      const mockTx = {
        select: vi.fn().mockImplementation(() => ({
          from: vi.fn().mockImplementation((table) => ({
            where: vi.fn().mockImplementation(() => ({
              for: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue([
                  {
                    id: missionId,
                    type: "delivery",
                    status: "in_progress",
                    courierId: "courier_delivery_2",
                    orderId,
                    courierPay: 2500,
                  },
                ]),
              }),
              limit: vi.fn().mockImplementation(async () => {
                if (table === schema.cashLedger) {
                  return [
                    {
                      id: "ledger_pickup_pay_2",
                      entryType: "courier_pay",
                      missionId: "miss_pickup_1",
                      currency: "CDF",
                      amount: 3000,
                      reversalOfId: null,
                    },
                  ];
                }
                return [
                  {
                    id: orderId,
                    status: "delivery_in_progress",
                    deliveryConfirmationCode: correctCode,
                    houseId: "house_1",
                    itemsTotal: 10000,
                    adjustedItemsTotal: null,
                    deliveryFee: 3000,
                    commissionAmount: 2000,
                    totalDue: 13000,
                    paymentCurrency: "CDF",
                    exchangeRateUsed: 2800,
                  },
                ];
              }),
            })),
          })),
        })),
        update: vi.fn().mockReturnValue({
          set: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([]),
          }),
        }),
        insert: vi.fn().mockImplementation((table) => ({
          values: vi.fn().mockImplementation(async (vals) => {
            if (table === schema.cashLedger) {
              insertedLedgerRows.push(vals as Record<string, unknown>);
            }
            return [];
          }),
        })),
      };
      return await callback(mockAs(mockTx));
    });

    const res = await completeDeliveryMissionAtomic({
      missionId,
      courierId: "courier_delivery_2",
      confirmationCode: correctCode,
      cashCollected: 13000,
      cashCurrency: "CDF",
    });

    expect(res.ok).toBe(true);
    const cashRow = insertedLedgerRows.find((r) => r.entryType === "cash_collected");
    const houseRow = insertedLedgerRows.find((r) => r.entryType === "owed_to_house");
    const ownerRow = insertedLedgerRows.find((r) => r.entryType === "owed_to_owner");
    const deliveryCourierRow = insertedLedgerRows.find((r) => r.entryType === "courier_pay");

    // Margin = commissionAmount (2000) + deliveryFee (3000) = 5000
    // Combined courier pay = pickup (3000) + delivery (2500) = 5500 -> owedToOwner = -500
    expect(houseRow?.amount).toBe(8000);
    expect(ownerRow?.amount).toBe(-500);
    expect(deliveryCourierRow?.amount).toBe(2500);
    expect(
      Number(houseRow?.amount) +
        Number(ownerRow?.amount) +
        3000 +
        Number(deliveryCourierRow?.amount)
    ).toBe(Number(cashRow?.amount));
  });
});
