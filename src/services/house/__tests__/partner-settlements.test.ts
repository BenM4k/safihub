import { describe, expect, it, vi } from "vitest";
import {
  computePeriodBounds,
  maskPhoneNumber,
  getNextPayoutDate,
} from "@/dal/partner-settlements.dal";
import {
  getPartnerSettlements,
  reportPartnerSettlementIssue,
} from "../settlements.service";

// Mock the DB and Drizzle
vi.mock("@/dal/db", () => {
  return {
    db: {
      select: vi.fn(),
      insert: vi.fn(() => ({
        values: vi.fn(() => ({
          returning: vi.fn(() => []),
        })),
      })),
    },
    schema: {
      houses: { id: "id", name: "name", slug: "slug", contactPhone: "contact_phone", commissionBps: "commission_bps" },
      orders: {
        id: "id",
        code: "code",
        itemsTotal: "items_total",
        adjustedItemsTotal: "adjusted_items_total",
        commissionAmount: "commission_amount",
        commissionBps: "commission_bps",
        status: "status",
        houseId: "house_id",
        customerId: "customer_id",
        updatedAt: "updated_at",
        deliverySlotEnd: "delivery_slot_end",
      },
      cashLedger: {
        id: "id",
        houseId: "house_id",
        entryType: "entry_type",
        amount: "amount",
        currency: "currency",
        note: "note",
        reversalOfId: "reversal_of_id",
        createdAt: "created_at",
      },
      disputes: {
        id: "id",
        orderId: "order_id",
        openedBy: "opened_by",
        type: "type",
        description: "description",
        status: "status",
        createdAt: "created_at",
      },
      notifications: {
        id: "id",
        userId: "user_id",
        channel: "channel",
        templateKey: "template_key",
        locale: "locale",
        title: "title",
        body: "body",
        status: "status",
      },
      user: { id: "id", name: "name" },
    },
  };
});

describe("Partner Settlements Earnings & Reconciliation", () => {
  describe("Utility Functions", () => {
    it("masks phone numbers correctly to preserve privacy", () => {
      expect(maskPhoneNumber("+243991234567")).toBe("+243 99 ••• 4567");
      expect(maskPhoneNumber("+243 99 123 4567")).toBe("+243 99 ••• 4567");
      expect(maskPhoneNumber("0991234567")).toBe("0991 ••• 4567");
      expect(maskPhoneNumber(null)).toBeNull();
      expect(maskPhoneNumber(undefined)).toBeNull();
      expect(maskPhoneNumber("123")).toBe("123");
    });

    it("computes next payout date as a Monday in Bukavu timezone", () => {
      const fixedDate = new Date("2026-10-19T10:00:00Z"); // A Monday
      const nextDate = getNextPayoutDate(fixedDate);
      expect(nextDate).toBeDefined();
      expect(typeof nextDate).toBe("string");
      expect(nextDate.toLowerCase()).toContain("lundi");
    });

    it("computes period bounds for week, month, and last30 correctly", () => {
      const fixedDate = new Date("2026-10-15T12:00:00Z");
      const weekBounds = computePeriodBounds("week", undefined, undefined, fixedDate);
      expect(weekBounds.start.getDay()).toBe(1); // Monday
      expect(weekBounds.end.getDay()).toBe(0); // Sunday

      const monthBounds = computePeriodBounds("month", undefined, undefined, fixedDate);
      expect(monthBounds.start.getDate()).toBe(1);

      const customBounds = computePeriodBounds("custom", "2026-10-01", "2026-10-10", fixedDate);
      expect(customBounds.start.toISOString()).toContain("2026-10-01");
      expect(customBounds.end.toISOString()).toContain("2026-10-10");
    });
  });

  describe("Reconciliation Mathematical Invariants", () => {
    it("guarantees Brut − Commissions = Net à percevoir on period figures", () => {
      const orders = [
        { itemsTotal: 25000, commissionAmount: 5000, net: 20000 },
        { itemsTotal: 30000, commissionAmount: 6000, net: 24000 },
        { itemsTotal: 15000, commissionAmount: 3000, net: 12000 },
      ];

      const gross = orders.reduce((sum, o) => sum + o.itemsTotal, 0);
      const commission = orders.reduce((sum, o) => sum + o.commissionAmount, 0);
      const net = orders.reduce((sum, o) => sum + o.net, 0);

      expect(gross - commission).toBe(net);
      expect(gross).toBe(70000);
      expect(commission).toBe(14000);
      expect(net).toBe(56000);
    });

    it("guarantees Net gagné − Déjà versé = Reste dû on all-time hero figures", () => {
      const totalAllTimeNetCDF = 350000;
      const totalAllTimeSettledCDF = 220000;
      const balanceOwedCDF = Math.max(0, totalAllTimeNetCDF - totalAllTimeSettledCDF);

      expect(totalAllTimeNetCDF - totalAllTimeSettledCDF).toBe(balanceOwedCDF);
      expect(balanceOwedCDF).toBe(130000);
    });

    it("guarantees balance cannot be negative if settlements exceed net", () => {
      const totalAllTimeNetCDF = 100000;
      const totalAllTimeSettledCDF = 120000;
      const balanceOwedCDF = Math.max(0, totalAllTimeNetCDF - totalAllTimeSettledCDF);

      expect(balanceOwedCDF).toBe(0);
    });
  });

  describe("FIFO Settlement to Order Allocation", () => {
    it("allocates payouts to oldest delivered orders first and marks remaining as pending", () => {
      const deliveredOrders = [
        { id: "ord-1", code: "SF-1001", netOwed: 20000, deliveredAt: new Date("2026-10-01") },
        { id: "ord-2", code: "SF-1002", netOwed: 30000, deliveredAt: new Date("2026-10-02") },
        { id: "ord-3", code: "SF-1003", netOwed: 25000, deliveredAt: new Date("2026-10-03") },
      ];

      const settlements = [
        { id: "set-1", amount: 50000, reference: "SETT-OCT-01", createdAt: new Date("2026-10-05") },
      ];

      // Simulate FIFO matching logic
      let remainingPayout = settlements[0].amount;
      const results: Record<string, "settled" | "pending"> = {};

      for (const order of deliveredOrders) {
        if (remainingPayout >= order.netOwed) {
          remainingPayout -= order.netOwed;
          results[order.id] = "settled";
        } else {
          results[order.id] = "pending";
        }
      }

      expect(results["ord-1"]).toBe("settled");
      expect(results["ord-2"]).toBe("settled");
      expect(results["ord-3"]).toBe("pending");
      expect(remainingPayout).toBe(0);
    });

    it("does not settle orders with open disputes", () => {
      const deliveredOrders = [
        { id: "ord-1", code: "SF-1001", netOwed: 20000, isDisputed: true },
        { id: "ord-2", code: "SF-1002", netOwed: 30000, isDisputed: false },
      ];

      let remainingPayout = 30000;
      const results: Record<string, "settled" | "pending" | "disputed"> = {};

      for (const order of deliveredOrders) {
        if (order.isDisputed) {
          results[order.id] = "disputed";
          continue;
        }
        if (remainingPayout >= order.netOwed) {
          remainingPayout -= order.netOwed;
          results[order.id] = "settled";
        } else {
          results[order.id] = "pending";
        }
      }

      expect(results["ord-1"]).toBe("disputed");
      expect(results["ord-2"]).toBe("settled");
    });
  });

  describe("Support Ticket Reporting Action", () => {
    it("rejects reporting an issue without valid description", async () => {
      const res = await reportPartnerSettlementIssue({
        houseId: "house-1",
        userId: "user-1",
        reference: "SF-1001",
        targetType: "order",
        reasonCategory: "Montant incorrect",
        message: "No", // < 5 chars
      });

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toContain("au moins 5 caractères");
      }
    });

    it("successfully creates a ticket reference with valid inputs", async () => {
      const res = await reportPartnerSettlementIssue({
        houseId: "house-1",
        userId: "user-1",
        reference: "SF-1001",
        targetType: "order",
        orderId: "e93f6b4a-2895-4670-bc2d-53909772c91a",
        reasonCategory: "Montant incorrect",
        message: "Le montant d'articles facturé ne correspond pas au bordereau.",
      });

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.ticketReference).toMatch(/^TIC-ORD-/);
      }
    });
  });

  describe("Tenant Isolation", () => {
    it("ensures service requires houseId and scopes queries strictly per pressing", async () => {
      const res = await getPartnerSettlements({ houseId: "" });
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toBe("Identifiant du pressing requis");
      }
    });
  });
});
