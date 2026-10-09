import { beforeEach, describe, expect, it, vi } from "vitest";
import { fromBukavuDateTime } from "@/services/availability";
import {
  validateOrderCheckout,
  type CheckoutInput,
  type OrderValidationContext,
} from "@/services/order/validation";
import {
  clearRateLimitStore,
  rateLimitCheckout,
  rateLimitLogin,
  rateLimitRegistration,
} from "../rate-limiter";
import { applyRetryFeeToOrder, DEFAULT_RETRY_FEE_CDF } from "../retry-fee";

describe("Phase 10.1: Abuse & Fraud Controls - Limits & Blocking", () => {
  const customerId = "usr_cust_abuse";
  const houseId = "house_1";
  const neighborhoodId = "neigh_1";

  const baseContext: OrderValidationContext = {
    existingOrders: [],
    houses: new Map([
      [
        houseId,
        {
          id: houseId,
          name: "Test Pressing",
          neighborhoodId,
          isActive: true,
          isPaused: false,
          minimumOrderAmount: 5000,
          commissionBps: 2000,
          cutoffMinutes: 120,
          dailyCapacity: 10,
        },
      ],
    ]),
    neighborhoods: new Map([
      [neighborhoodId, { id: neighborhoodId, name: "Ibanda", zoneId: "zone_1", status: "served" }],
    ]),
    houseCoverage: [{ houseId, neighborhoodId, isActive: true }],
    zoneFees: [{ customerZoneId: "zone_1", houseZoneId: "zone_1", deliveryFee: 2500, distanceLevel: 1 }],
    masterServices: new Map([["srv_wash", { id: "srv_wash", isActive: true }]]),
    masterItems: new Map([["itm_shirt", { id: "itm_shirt", isActive: true }]]),
    masterFabrics: new Map([["fab_std", { id: "fab_std", isActive: true }]]),
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
    houseHours: [{ weekday: 1, opensAt: "08:00", closesAt: "18:00" }],
    houseClosures: [],
    courierShifts: [{ courierId: "cour_1", weekday: 1, startsAt: "07:30", endsAt: "18:30" }],
    bookedOrdersByDate: {},
    settings: {
      maxItemsPerOrder: 50,
      defaultCommissionBps: 2000,
      maxCoverageDistanceLevel: 2,
      acceptanceDelayMinutes: 45,
      maxOpenOrdersPerCustomer: 2,
      dailyOrderCapPerPhone: 3,
      failedPickupBlockThreshold: 2,
    },
    currentTime: fromBukavuDateTime("2026-10-12", "10:00"), // Mon Oct 12 10:00 Bukavu time
  };

  const sampleCheckoutInput: CheckoutInput = {
    idempotencyKey: "idem_10_1",
    customerId,
    houseId,
    customerNeighborhoodId: neighborhoodId,
    landmark: "Av President Mobutu 12",
    contactPhone: "+243999000111",
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
    clearRateLimitStore();
    vi.restoreAllMocks();
  });

  describe("Open-Order Cap", () => {
    it("allows placing an order when customer has 0 or 1 open orders", () => {
      const contextWithOneOpen: OrderValidationContext = {
        ...baseContext,
        customerOpenOrdersCount: 1,
      };

      const result = validateOrderCheckout(sampleCheckoutInput, contextWithOneOpen);
      expect(result.ok).toBe(true);
    });

    it("blocks checkout when customer reaches max open orders limit (e.g. 2)", () => {
      const contextAtLimit: OrderValidationContext = {
        ...baseContext,
        customerOpenOrdersCount: 2,
      };

      const result = validateOrderCheckout(sampleCheckoutInput, contextAtLimit);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("OPEN_ORDER_CAP_EXCEEDED");
        expect(result.error.details?.maxOpenOrders).toBe(2);
        expect(result.error.details?.currentOpenOrders).toBe(2);
      }
    });
  });

  describe("Daily Cap Per Phone", () => {
    it("allows placing an order when phone has not exceeded daily cap", () => {
      const contextWithTwoDailyOrders: OrderValidationContext = {
        ...baseContext,
        dailyOrdersForPhoneCount: 2,
      };

      const result = validateOrderCheckout(sampleCheckoutInput, contextWithTwoDailyOrders);
      expect(result.ok).toBe(true);
    });

    it("blocks checkout when phone reaches daily order cap (3)", () => {
      const contextAtDailyLimit: OrderValidationContext = {
        ...baseContext,
        dailyOrdersForPhoneCount: 3,
      };

      const result = validateOrderCheckout(sampleCheckoutInput, contextAtDailyLimit);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("DAILY_PHONE_CAP_EXCEEDED");
        expect(result.error.details?.dailyCap).toBe(3);
        expect(result.error.details?.currentDailyOrders).toBe(3);
      }
    });
  });

  describe("Blocked Customer and Blocked Phone Check at Checkout", () => {
    it("blocks checkout when account is flagged as blocked", () => {
      const blockedContext: OrderValidationContext = {
        ...baseContext,
        isCustomerBlocked: true,
      };

      const result = validateOrderCheckout(sampleCheckoutInput, blockedContext);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("ACCOUNT_BLOCKED");
      }
    });
  });

  describe("Rate Limiting", () => {
    it("enforces registration rate limiting (max 5 per window)", () => {
      const id = "test_ip_register";
      for (let i = 0; i < 5; i++) {
        expect(rateLimitRegistration(id).allowed).toBe(true);
      }
      const sixth = rateLimitRegistration(id);
      expect(sixth.allowed).toBe(false);
      expect(sixth.remaining).toBe(0);
    });

    it("enforces login rate limiting (max 5 attempts per window)", () => {
      const id = "user@example.com";
      for (let i = 0; i < 5; i++) {
        expect(rateLimitLogin(id).allowed).toBe(true);
      }
      const sixth = rateLimitLogin(id);
      expect(sixth.allowed).toBe(false);
      expect(sixth.remaining).toBe(0);
    });

    it("enforces checkout rate limiting (max 10 requests per minute)", () => {
      const id = "cust_heavy_tapper";
      for (let i = 0; i < 10; i++) {
        expect(rateLimitCheckout(id).allowed).toBe(true);
      }
      const eleventh = rateLimitCheckout(id);
      expect(eleventh.allowed).toBe(false);
      expect(eleventh.remaining).toBe(0);
    });
  });

  describe("Retry Fee Domain Service", () => {
    it("applies retry fee to order, increases delivery fee and total due, and creates audit note", async () => {
      const mockOrder = {
        id: "ord_failed_pickup",
        deliveryFee: 2500,
        totalDue: 9500,
      };

      const dal = await import("@/dal");
      vi.spyOn(dal, "getOrderById").mockResolvedValue(
        mockOrder as unknown as Awaited<ReturnType<typeof dal.getOrderById>>
      );
      const updateFinancialsSpy = vi.spyOn(dal, "updateOrderFinancials").mockResolvedValue({ ok: true, value: undefined });
      const addEventSpy = vi.spyOn(dal, "addOrderEvent").mockResolvedValue(
        {} as unknown as Awaited<ReturnType<typeof dal.addOrderEvent>>
      );

      const res = await applyRetryFeeToOrder({
        orderId: mockOrder.id,
        actorId: "admin_1",
      });

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.addedFee).toBe(DEFAULT_RETRY_FEE_CDF);
        expect(res.value.newTotalDue).toBe(mockOrder.totalDue + DEFAULT_RETRY_FEE_CDF);
      }

      expect(updateFinancialsSpy).toHaveBeenCalledWith({
        orderId: mockOrder.id,
        deliveryFee: 2500 + DEFAULT_RETRY_FEE_CDF,
        totalDue: 9500 + DEFAULT_RETRY_FEE_CDF,
      });

      expect(addEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId: mockOrder.id,
          type: "note",
          payload: expect.objectContaining({
            retryFee: DEFAULT_RETRY_FEE_CDF,
          }),
        })
      );
    });
  });

  describe("Blocked Phone / Email Re-Registration Guard", () => {
    it("rejects registration if the phone or email is flagged as blocked in the database", async () => {
      const dal = await import("@/dal");
      vi.spyOn(dal, "isPhoneOrEmailBlocked").mockResolvedValue(true);

      const { registerCustomer } = await import("@/services/auth/auth.service");

      const res = await registerCustomer({
        name: "Blocked User",
        email: "blocked@example.com",
        phone: "+243999888777",
        password: "ValidPassword123!",
        consent: true,
      });

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toContain("bloqué");
      }
    });
  });
});
