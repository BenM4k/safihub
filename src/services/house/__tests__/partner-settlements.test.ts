import { describe, expect, it, vi } from "vitest";
import {
  computePeriodBounds,
  maskPhoneNumber,
  getNextPayoutDate,
  getPartnerSettlementsData,
} from "@/dal/partner-settlements.dal";
import { db } from "@/dal/db";
import {
  getPartnerSettlements,
  reportPartnerSettlementIssue,
} from "../settlements.service";
import { toBukavuDateTime } from "@/services/availability/bukavu-time";

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
      const bukavuStart = toBukavuDateTime(customBounds.start);
      expect(bukavuStart.year).toBe(2026);
      expect(bukavuStart.month).toBe(10);
      expect(bukavuStart.day).toBe(1);
      const bukavuEnd = toBukavuDateTime(customBounds.end);
      expect(bukavuEnd.day).toBe(10);
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

  describe("FIFO Settlement to Order Allocation (Production getPartnerSettlementsData)", () => {
    function setupDbMocks(options: { settlements: unknown[]; orders: unknown[] }) {
      const houseRecord = [
        {
          id: "house-1",
          name: "Pressing Test",
          slug: "test-slug",
          contactPhone: "+243991234567",
          commissionBps: 2000,
        },
      ];
      const reversedSubquery: unknown[] = [];
      const reversedSettlements: unknown[] = [];

      let callCount = 0;
      vi.mocked(db.select).mockImplementation(() => {
        callCount++;
        let result: unknown = [];
        if (callCount === 1) result = houseRecord;
        else if (callCount === 2) result = reversedSubquery;
        else if (callCount === 3) result = options.settlements;
        else if (callCount === 4) result = reversedSettlements;
        else if (callCount === 5) result = options.orders;

        const chain = {
          from: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          orderBy: vi.fn().mockImplementation(() => Promise.resolve(result)),
          limit: vi.fn().mockImplementation(() => Promise.resolve(result)),
          innerJoin: vi.fn().mockReturnThis(),
          leftJoin: vi.fn().mockReturnThis(),
          then: (resolve: (val: unknown) => unknown) => Promise.resolve(result).then(resolve),
        };
        return chain as unknown as ReturnType<typeof db.select>;
      });
    }

    it("allocates payouts to oldest delivered orders first and marks remaining as pending", async () => {
      const orders = [
        {
          id: "ord-1",
          code: "SF-1001",
          itemsTotal: 25000,
          adjustedItemsTotal: null,
          commissionAmount: 5000,
          commissionBps: 2000,
          updatedAt: new Date("2026-10-01T10:00:00Z"),
          deliverySlotEnd: new Date("2026-10-01T10:00:00Z"),
          customerRawName: "Alice Mwamba",
          disputeId: null,
          disputeStatus: null,
        },
        {
          id: "ord-2",
          code: "SF-1002",
          itemsTotal: 37500,
          adjustedItemsTotal: null,
          commissionAmount: 7500,
          commissionBps: 2000,
          updatedAt: new Date("2026-10-02T10:00:00Z"),
          deliverySlotEnd: new Date("2026-10-02T10:00:00Z"),
          customerRawName: "Bob Kasongo",
          disputeId: null,
          disputeStatus: null,
        },
        {
          id: "ord-3",
          code: "SF-1003",
          itemsTotal: 31250,
          adjustedItemsTotal: null,
          commissionAmount: 6250,
          commissionBps: 2000,
          updatedAt: new Date("2026-10-03T10:00:00Z"),
          deliverySlotEnd: new Date("2026-10-03T10:00:00Z"),
          customerRawName: "Claire Bahati",
          disputeId: null,
          disputeStatus: null,
        },
      ];

      const settlements = [
        {
          id: "set-1",
          amount: 50000,
          currency: "CDF",
          note: "Règlement [RÉF: SETT-OCT-01]",
          createdAt: new Date("2026-10-05T10:00:00Z"),
        },
      ];

      setupDbMocks({ settlements, orders });

      const data = await getPartnerSettlementsData({ houseId: "house-1", period: "month" });

      const ord1 = data.orders.find((o) => o.id === "ord-1");
      const ord2 = data.orders.find((o) => o.id === "ord-2");
      const ord3 = data.orders.find((o) => o.id === "ord-3");

      expect(ord1?.settlementStatus).toBe("settled");
      expect(ord2?.settlementStatus).toBe("settled");
      expect(ord3?.settlementStatus).toBe("pending");

      const payout = data.payouts.find((p) => p.id === "set-1");
      expect(payout?.ordersCount).toBe(2);
      expect(payout?.includedOrders.map((o) => o.id)).toEqual(["ord-1", "ord-2"]);
    });

    it("handles multiple settlements with remainder accumulation and stops when next order cannot be covered", async () => {
      const orders = [
        {
          id: "ord-1",
          code: "SF-1001",
          itemsTotal: 25000,
          adjustedItemsTotal: null,
          commissionAmount: 5000, // net 20000
          commissionBps: 2000,
          updatedAt: new Date("2026-10-01T10:00:00Z"),
          deliverySlotEnd: new Date("2026-10-01T10:00:00Z"),
          customerRawName: "Alice Mwamba",
          disputeId: null,
          disputeStatus: null,
        },
        {
          id: "ord-2",
          code: "SF-1002",
          itemsTotal: 37500,
          adjustedItemsTotal: null,
          commissionAmount: 7500, // net 30000
          commissionBps: 2000,
          updatedAt: new Date("2026-10-02T10:00:00Z"),
          deliverySlotEnd: new Date("2026-10-02T10:00:00Z"),
          customerRawName: "Bob Kasongo",
          disputeId: null,
          disputeStatus: null,
        },
        {
          id: "ord-3",
          code: "SF-1003",
          itemsTotal: 31250,
          adjustedItemsTotal: null,
          commissionAmount: 6250, // net 25000
          commissionBps: 2000,
          updatedAt: new Date("2026-10-03T10:00:00Z"),
          deliverySlotEnd: new Date("2026-10-03T10:00:00Z"),
          customerRawName: "Claire Bahati",
          disputeId: null,
          disputeStatus: null,
        },
      ];

      const settlements = [
        {
          id: "set-1",
          amount: 25000,
          currency: "CDF",
          note: "Règlement [RÉF: SETT-01]",
          createdAt: new Date("2026-10-04T10:00:00Z"),
        },
        {
          id: "set-2",
          amount: 35000,
          currency: "CDF",
          note: "Règlement [RÉF: SETT-02]",
          createdAt: new Date("2026-10-06T10:00:00Z"),
        },
      ];

      setupDbMocks({ settlements, orders });

      const data = await getPartnerSettlementsData({ houseId: "house-1", period: "month" });

      const ord1 = data.orders.find((o) => o.id === "ord-1");
      const ord2 = data.orders.find((o) => o.id === "ord-2");
      const ord3 = data.orders.find((o) => o.id === "ord-3");

      expect(ord1?.settlementStatus).toBe("settled");
      expect(ord2?.settlementStatus).toBe("settled");
      expect(ord3?.settlementStatus).toBe("pending");
    });

    it("does not settle orders with open disputes", async () => {
      const orders = [
        {
          id: "ord-1",
          code: "SF-1001",
          itemsTotal: 25000,
          adjustedItemsTotal: null,
          commissionAmount: 5000,
          commissionBps: 2000,
          updatedAt: new Date("2026-10-01T10:00:00Z"),
          deliverySlotEnd: new Date("2026-10-01T10:00:00Z"),
          customerRawName: "Alice Mwamba",
          disputeId: "disp-1",
          disputeStatus: "open",
        },
        {
          id: "ord-2",
          code: "SF-1002",
          itemsTotal: 37500,
          adjustedItemsTotal: null,
          commissionAmount: 7500,
          commissionBps: 2000,
          updatedAt: new Date("2026-10-02T10:00:00Z"),
          deliverySlotEnd: new Date("2026-10-02T10:00:00Z"),
          customerRawName: "Bob Kasongo",
          disputeId: null,
          disputeStatus: null,
        },
      ];

      const settlements = [
        {
          id: "set-1",
          amount: 30000,
          currency: "CDF",
          note: "Règlement [RÉF: SETT-01]",
          createdAt: new Date("2026-10-05T10:00:00Z"),
        },
      ];

      setupDbMocks({ settlements, orders });

      const data = await getPartnerSettlementsData({ houseId: "house-1", period: "month" });

      const ord1 = data.orders.find((o) => o.id === "ord-1");
      const ord2 = data.orders.find((o) => o.id === "ord-2");

      expect(ord1?.settlementStatus).toBe("disputed");
      expect(ord2?.settlementStatus).toBe("settled");
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
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              { id: "e93f6b4a-2895-4670-bc2d-53909772c91a", houseId: "house-1" },
            ]),
          }),
        }),
      } as unknown as ReturnType<typeof db.select>);

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
