import { beforeEach, describe, expect, it, vi } from "vitest";
import { completeDeliveryMissionAtomic, startDeliveryMissionAtomic } from "@/dal/courier.dal";

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
    expect(String(captured.updatedOrderValues?.deliveryConfirmationCode).length).toBeGreaterThanOrEqual(4);
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
});
