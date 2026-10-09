import { beforeEach, describe, expect, it, vi } from "vitest";
import { fromBukavuDateTime } from "@/services/availability";
import { placeCustomerOrder } from "../customer-order.service";
import { adminConfirmFirstOrder, adminRejectFirstOrder } from "@/services/admin/order.service";
import type { CheckoutInput } from "../validation";

interface CapturedInsertedOrder {
  status?: string;
  acceptanceDeadlineAt?: Date | null;
}

const mockAs = <T>(val: unknown): T => val as T;

describe("Phase 10.2: Optional First-Order Screening (AC 16)", () => {
  const customerId = "usr_first_time_customer";
  const houseId = "house_1";
  const neighborhoodId = "neigh_1";

  const sampleCheckoutInput: CheckoutInput = {
    idempotencyKey: "idem_screening_1",
    customerId,
    houseId,
    customerNeighborhoodId: neighborhoodId,
    landmark: "Boulevard Kanyamuhanga",
    contactPhone: "+243999123456",
    pickupSlot: {
      start: fromBukavuDateTime("2026-10-12", "14:00"),
      end: fromBukavuDateTime("2026-10-12", "16:00"),
    },
    items: [
      {
        serviceId: "srv_wash",
        itemId: "itm_shirt",
        fabricId: "fab_std",
        quantity: 2,
        expectedUnitPrice: 3500,
      },
    ],
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("creates order directly as 'created' when first-order screening is OFF (default)", async () => {
    const dal = await import("@/dal");
    vi.spyOn(dal, "getHouses").mockResolvedValue([
      mockAs({
        id: houseId,
        name: "Test Pressing",
        neighborhoodId,
        isActive: true,
        isPaused: false,
        minimumOrderAmount: 5000,
        commissionBps: 2000,
        cutoffMinutes: 120,
        dailyCapacity: 10,
      }),
    ]);
    vi.spyOn(dal, "getNeighborhoods").mockResolvedValue([
      mockAs({ id: neighborhoodId, name: "Ibanda", zoneId: "zone_1", status: "served" }),
    ]);
    vi.spyOn(dal, "getZoneFees").mockResolvedValue([
      mockAs({ customerZoneId: "zone_1", houseZoneId: "zone_1", deliveryFee: 2500, distanceLevel: 1 }),
    ]);
    vi.spyOn(dal, "getMasterServices").mockResolvedValue([mockAs({ id: "srv_wash", isActive: true })]);
    vi.spyOn(dal, "getMasterItems").mockResolvedValue([mockAs({ id: "itm_shirt", isActive: true })]);
    vi.spyOn(dal, "getMasterFabrics").mockResolvedValue([mockAs({ id: "fab_std", isActive: true })]);
    vi.spyOn(dal, "getSettings").mockResolvedValue(mockAs({
      maxItemsPerOrder: 50,
      defaultCommissionBps: 2000,
      maxCoverageDistanceLevel: 2,
      acceptanceDelayMinutes: 45,
      firstOrderScreening: false, // OFF by default
      maxOpenOrdersPerCustomer: 2,
      failedPickupBlockThreshold: 2,
    }));
    vi.spyOn(dal, "getLatestExchangeRate").mockResolvedValue(null);
    vi.spyOn(dal, "getOrderValidationData").mockResolvedValue({
      existingOrders: [],
      houseItems: [
        {
          id: "hi_shirt",
          houseId,
          serviceId: "srv_wash",
          itemId: "itm_shirt",
          fabricId: "fab_std",
          price: 3500,
          isActive: true,
        },
      ],
      houseHours: [{ houseId, weekday: 1, opensAt: "08:00", closesAt: "18:00" }],
      houseClosures: [],
      houseCoverage: [{ houseId, neighborhoodId, isActive: true, pausedUntil: null }],
      courierShifts: [{ courierId: "cour_1", weekday: 1, startsAt: "07:30", endsAt: "18:30" }],
      customerCompletedOrdersCount: 0,
      customerOpenOrdersCount: 0,
      dailyOrdersForPhoneCount: 0,
      isCustomerBlocked: false,
    });

    const captured: { insertedOrderRecord?: CapturedInsertedOrder } = {};
    vi.spyOn(dal, "insertOrderWithDetails").mockImplementation(async (params) => {
      captured.insertedOrderRecord = params.order;
      return {
        orderId: "ord_created_1",
        code: params.order.code,
        trackingToken: params.order.trackingToken,
      };
    });

    const res = await placeCustomerOrder(sampleCheckoutInput);

    expect(res.ok).toBe(true);
    expect(captured.insertedOrderRecord?.status).toBe("created");
    expect(captured.insertedOrderRecord?.acceptanceDeadlineAt).toBeInstanceOf(Date);
  });

  it("AC 16: Given first-order screening is turned on (off by default), when a customer with no completed order places an order, then it stays awaiting_confirmation until the admin confirms it", async () => {
    const dal = await import("@/dal");
    vi.spyOn(dal, "getHouses").mockResolvedValue([
      mockAs({
        id: houseId,
        name: "Test Pressing",
        neighborhoodId,
        isActive: true,
        isPaused: false,
        minimumOrderAmount: 5000,
        commissionBps: 2000,
        cutoffMinutes: 120,
        dailyCapacity: 10,
      }),
    ]);
    vi.spyOn(dal, "getNeighborhoods").mockResolvedValue([
      mockAs({ id: neighborhoodId, name: "Ibanda", zoneId: "zone_1", status: "served" }),
    ]);
    vi.spyOn(dal, "getZoneFees").mockResolvedValue([
      mockAs({ customerZoneId: "zone_1", houseZoneId: "zone_1", deliveryFee: 2500, distanceLevel: 1 }),
    ]);
    vi.spyOn(dal, "getMasterServices").mockResolvedValue([mockAs({ id: "srv_wash", isActive: true })]);
    vi.spyOn(dal, "getMasterItems").mockResolvedValue([mockAs({ id: "itm_shirt", isActive: true })]);
    vi.spyOn(dal, "getMasterFabrics").mockResolvedValue([mockAs({ id: "fab_std", isActive: true })]);
    vi.spyOn(dal, "getSettings").mockResolvedValue(mockAs({
      maxItemsPerOrder: 50,
      defaultCommissionBps: 2000,
      maxCoverageDistanceLevel: 2,
      acceptanceDelayMinutes: 45,
      firstOrderScreening: true, // ON
      maxOpenOrdersPerCustomer: 2,
      failedPickupBlockThreshold: 2,
    }));
    vi.spyOn(dal, "getLatestExchangeRate").mockResolvedValue(null);
    vi.spyOn(dal, "getOrderValidationData").mockResolvedValue({
      existingOrders: [],
      houseItems: [
        {
          id: "hi_shirt",
          houseId,
          serviceId: "srv_wash",
          itemId: "itm_shirt",
          fabricId: "fab_std",
          price: 3500,
          isActive: true,
        },
      ],
      houseHours: [{ houseId, weekday: 1, opensAt: "08:00", closesAt: "18:00" }],
      houseClosures: [],
      houseCoverage: [{ houseId, neighborhoodId, isActive: true, pausedUntil: null }],
      courierShifts: [{ courierId: "cour_1", weekday: 1, startsAt: "07:30", endsAt: "18:30" }],
      customerCompletedOrdersCount: 0, // No completed orders!
      customerOpenOrdersCount: 0,
      dailyOrdersForPhoneCount: 0,
      isCustomerBlocked: false,
    });

    const captured: { insertedOrderRecord?: CapturedInsertedOrder } = {};
    vi.spyOn(dal, "insertOrderWithDetails").mockImplementation(async (params) => {
      captured.insertedOrderRecord = params.order;
      return {
        orderId: "ord_screened_1",
        code: params.order.code,
        trackingToken: params.order.trackingToken,
      };
    });

    const res = await placeCustomerOrder(sampleCheckoutInput);

    expect(res.ok).toBe(true);
    // AC 16: Stays awaiting_confirmation
    expect(captured.insertedOrderRecord?.status).toBe("awaiting_confirmation");
    // Acceptance timer does NOT tick while awaiting confirmation
    expect(captured.insertedOrderRecord?.acceptanceDeadlineAt).toBeNull();
  });

  it("creates order as 'created' even if screening is ON, if customer already has a completed order", async () => {
    const dal = await import("@/dal");
    vi.spyOn(dal, "getHouses").mockResolvedValue([
      mockAs({
        id: houseId,
        name: "Test Pressing",
        neighborhoodId,
        isActive: true,
        isPaused: false,
        minimumOrderAmount: 5000,
        commissionBps: 2000,
        cutoffMinutes: 120,
        dailyCapacity: 10,
      }),
    ]);
    vi.spyOn(dal, "getNeighborhoods").mockResolvedValue([
      mockAs({ id: neighborhoodId, name: "Ibanda", zoneId: "zone_1", status: "served" }),
    ]);
    vi.spyOn(dal, "getZoneFees").mockResolvedValue([
      mockAs({ customerZoneId: "zone_1", houseZoneId: "zone_1", deliveryFee: 2500, distanceLevel: 1 }),
    ]);
    vi.spyOn(dal, "getMasterServices").mockResolvedValue([mockAs({ id: "srv_wash", isActive: true })]);
    vi.spyOn(dal, "getMasterItems").mockResolvedValue([mockAs({ id: "itm_shirt", isActive: true })]);
    vi.spyOn(dal, "getMasterFabrics").mockResolvedValue([mockAs({ id: "fab_std", isActive: true })]);
    vi.spyOn(dal, "getSettings").mockResolvedValue(mockAs({
      maxItemsPerOrder: 50,
      defaultCommissionBps: 2000,
      maxCoverageDistanceLevel: 2,
      acceptanceDelayMinutes: 45,
      firstOrderScreening: true, // ON
      maxOpenOrdersPerCustomer: 2,
      failedPickupBlockThreshold: 2,
    }));
    vi.spyOn(dal, "getLatestExchangeRate").mockResolvedValue(null);
    vi.spyOn(dal, "getOrderValidationData").mockResolvedValue({
      existingOrders: [],
      houseItems: [
        {
          id: "hi_shirt",
          houseId,
          serviceId: "srv_wash",
          itemId: "itm_shirt",
          fabricId: "fab_std",
          price: 3500,
          isActive: true,
        },
      ],
      houseHours: [{ houseId, weekday: 1, opensAt: "08:00", closesAt: "18:00" }],
      houseClosures: [],
      houseCoverage: [{ houseId, neighborhoodId, isActive: true, pausedUntil: null }],
      courierShifts: [{ courierId: "cour_1", weekday: 1, startsAt: "07:30", endsAt: "18:30" }],
      customerCompletedOrdersCount: 1, // Repeat customer!
      customerOpenOrdersCount: 0,
      dailyOrdersForPhoneCount: 0,
      isCustomerBlocked: false,
    });

    const captured: { insertedOrderRecord?: CapturedInsertedOrder } = {};
    vi.spyOn(dal, "insertOrderWithDetails").mockImplementation(async (params) => {
      captured.insertedOrderRecord = params.order;
      return {
        orderId: "ord_repeat_1",
        code: params.order.code,
        trackingToken: params.order.trackingToken,
      };
    });

    const res = await placeCustomerOrder(sampleCheckoutInput);

    expect(res.ok).toBe(true);
    expect(captured.insertedOrderRecord?.status).toBe("created");
  });

  describe("Admin Screening Confirmation and Rejection Flow", () => {
    it("admin confirmation transitions awaiting_confirmation to created and sets acceptance deadline", async () => {
      const dal = await import("@/dal");
      const mockOrder = {
        id: "ord_screened_to_confirm",
        status: "awaiting_confirmation",
        houseId,
      };

      vi.spyOn(dal, "getOrderById").mockResolvedValue(mockAs(mockOrder));
      vi.spyOn(dal, "getSettings").mockResolvedValue(mockAs({ acceptanceDelayMinutes: 45 }));
      vi.spyOn(dal, "getHouseHours").mockResolvedValue([mockAs({ weekday: 1, opensAt: "08:00", closesAt: "18:00" })]);
      vi.spyOn(dal, "getHouseClosures").mockResolvedValue([]);
      const updateDeadlineSpy = vi.spyOn(dal, "updateOrderStatusWithDeadline").mockResolvedValue(undefined);
      const addEventSpy = vi.spyOn(dal, "addOrderEvent").mockResolvedValue(mockAs({}));

      const res = await adminConfirmFirstOrder({
        orderId: mockOrder.id,
        adminId: "admin_user_1",
      });

      expect(res.ok).toBe(true);
      expect(updateDeadlineSpy).toHaveBeenCalledWith(
        mockOrder.id,
        "created",
        expect.any(Date)
      );
      expect(addEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId: mockOrder.id,
          fromStatus: "awaiting_confirmation",
          toStatus: "created",
          actorRole: "admin",
        })
      );
    });

    it("admin rejection transitions awaiting_confirmation to cancelled with reason", async () => {
      const dal = await import("@/dal");
      const mockOrder = {
        id: "ord_screened_to_reject",
        status: "awaiting_confirmation",
        houseId,
      };

      vi.spyOn(dal, "getOrderById").mockResolvedValue(mockAs(mockOrder));
      const updateStatusSpy = vi.spyOn(dal, "updateOrderStatus").mockResolvedValue(undefined);
      const addEventSpy = vi.spyOn(dal, "addOrderEvent").mockResolvedValue(mockAs({}));

      const res = await adminRejectFirstOrder({
        orderId: mockOrder.id,
        adminId: "admin_user_1",
        reason: "Numéro de téléphone inaccessible après 3 appels",
      });

      expect(res.ok).toBe(true);
      expect(updateStatusSpy).toHaveBeenCalledWith(mockOrder.id, "cancelled");
      expect(addEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId: mockOrder.id,
          fromStatus: "awaiting_confirmation",
          toStatus: "cancelled",
          actorRole: "admin",
          note: "Numéro de téléphone inaccessible après 3 appels",
        })
      );
    });
  });
});
