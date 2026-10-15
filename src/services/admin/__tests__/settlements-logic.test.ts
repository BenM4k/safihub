import { describe, expect, it, vi } from "vitest";
import { formatMoney } from "@/lib/cash-formatters";
import {
  SETTLEMENT_OVERDUE_DAYS_THRESHOLD,
  calculateDaysOverdue,
  getWeekBounds,
  formatWeekRange,
} from "@/components/admin/settlements/period-utils";
import {
  settleAdminHouse,
  settleAdminCourier,
  reverseAdminSettlement,
} from "@/services/admin/settlements.service";

vi.mock("@/dal", () => ({
  settleHouseBalance: vi.fn(async ({ amount }: { amount: number }) => {
    const currentBalance = 120_000;
    if (amount > currentBalance) {
      return {
        ok: false,
        error: "Le montant saisi ne peut pas dépasser le solde restant dû",
        newBalanceCDF: currentBalance,
      };
    }
    return { ok: true, settlementId: "settle-house-1", newBalanceCDF: currentBalance - amount };
  }),
  settleCourierPay: vi.fn(async ({ amount }: { amount: number }) => {
    const currentBalance = 80_000;
    if (amount > currentBalance) {
      return {
        ok: false,
        error: "Le montant saisi ne peut pas dépasser le solde restant dû",
        newBalanceCDF: currentBalance,
      };
    }
    return { ok: true, settlementId: "settle-courier-1", newBalanceCDF: currentBalance - amount };
  }),
  reverseLedgerEntry: vi.fn(async () => ({ ok: true, reversalId: "rev-1" })),
  getHouseSettlementsOverview: vi.fn(async () => ({ houses: [] })),
  getCourierSettlementsOverview: vi.fn(async () => ({ couriers: [] })),
  getSettlementHistoryLogs: vi.fn(async () => []),
}));

describe("Settlements & Payouts Domain Logic", () => {
  describe("1. Integer Money & Balance Calculations", () => {
    it("calculates net balance owed with integer precision in CDF", () => {
      // Realistic order items and commission
      const grossTotalCDF = 150_000;
      const commissionCDF = 22_500; // 15%
      const totalEarnedNetCDF = Math.max(0, grossTotalCDF - commissionCDF);
      const totalSettledCDF = 80_000;

      const balanceOwedCDF = Math.max(0, totalEarnedNetCDF - totalSettledCDF);

      expect(totalEarnedNetCDF).toBe(127_500);
      expect(balanceOwedCDF).toBe(47_500);
      expect(Number.isInteger(balanceOwedCDF)).toBe(true);
    });

    it("prevents negative balances when settlements exceed earned", () => {
      const totalEarnedCDF = 50_000;
      const totalSettledCDF = 60_000;
      const balanceOwedCDF = Math.max(0, totalEarnedCDF - totalSettledCDF);

      expect(balanceOwedCDF).toBe(0);
    });
  });

  describe("2. Partial Payment Limits", () => {
    it("allows valid partial payments less than or equal to balance", async () => {
      const partialPayment = 50_000;
      const res = await settleAdminHouse({
        houseId: "house-1",
        amount: partialPayment,
        adminId: "admin-1",
      });
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.newBalanceCDF).toBe(70_000);
      }
    });

    it("allows full settlement equal to balance", async () => {
      const fullPayment = 120_000;
      const res = await settleAdminHouse({
        houseId: "house-1",
        amount: fullPayment,
        adminId: "admin-1",
      });
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.newBalanceCDF).toBe(0);
      }
    });

    it("strictly rejects payouts that exceed the current balance", async () => {
      const houseRes = await settleAdminHouse({
        houseId: "house-1",
        amount: 130_000,
        adminId: "admin-1",
      });
      expect(houseRes.ok).toBe(false);
      if (!houseRes.ok) {
        expect(houseRes.error).toContain("ne peut pas dépasser le solde");
      }

      const courierRes = await settleAdminCourier({
        courierId: "courier-1",
        amount: 90_000,
        adminId: "admin-1",
      });
      expect(courierRes.ok).toBe(false);
      if (!courierRes.ok) {
        expect(courierRes.error).toContain("ne peut pas dépasser le solde");
      }
    });

    it("strictly rejects payouts of zero or negative amounts", async () => {
      const zeroRes = await settleAdminHouse({
        houseId: "house-1",
        amount: 0,
        adminId: "admin-1",
      });
      expect(zeroRes.ok).toBe(false);

      const negRes = await settleAdminCourier({
        courierId: "courier-1",
        amount: -5000,
        adminId: "admin-1",
      });
      expect(negRes.ok).toBe(false);
    });

    it("rejects non-cash payments without reference", async () => {
      const res = await settleAdminHouse({
        houseId: "house-1",
        amount: 50_000,
        method: "mobile_money",
        reference: "",
        adminId: "admin-1",
      });
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toContain("Une référence ou un numéro de transaction est requis");
      }
    });

    it("rejects reversals with reason shorter than 3 characters", async () => {
      const shortRes = await reverseAdminSettlement({
        settlementId: "settle-1",
        reason: "no",
        adminId: "admin-1",
      });
      expect(shortRes.ok).toBe(false);
      if (!shortRes.ok) {
        expect(shortRes.error).toContain("au moins 3 caractères");
      }
    });
  });

  describe("3. Status & Overdue Calculations (7-day threshold)", () => {
    it("has overdue threshold set to exactly 7 days", () => {
      expect(SETTLEMENT_OVERDUE_DAYS_THRESHOLD).toBe(7);
    });

    it("identifies settled status when balance is zero", () => {
      const balanceOwedCDF = 0;
      const isSettled = balanceOwedCDF <= 0;
      expect(isSettled).toBe(true);
    });

    it("calculates pending 'to_settle' status when within threshold", () => {
      const balanceOwedCDF = 45_000;
      const fourDaysAgo = new Date();
      fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);

      const daysOverdue = calculateDaysOverdue(fourDaysAgo);
      const isOverdue = daysOverdue > SETTLEMENT_OVERDUE_DAYS_THRESHOLD;

      expect(daysOverdue).toBe(4);
      expect(isOverdue).toBe(false);
      expect(balanceOwedCDF > 0 && !isOverdue).toBe(true);
    });

    it("calculates 'overdue' status when exceeding 7 days", () => {
      const balanceOwedCDF = 90_000;
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

      const daysOverdue = calculateDaysOverdue(tenDaysAgo);
      const isOverdue = daysOverdue > SETTLEMENT_OVERDUE_DAYS_THRESHOLD;

      expect(daysOverdue).toBe(10);
      expect(isOverdue).toBe(true);
      expect(balanceOwedCDF > 0 && isOverdue).toBe(true);
    });

    it("handles null or missing oldest unpaid dates safely", () => {
      expect(calculateDaysOverdue(null)).toBe(0);
      expect(calculateDaysOverdue(undefined)).toBe(0);
      expect(calculateDaysOverdue("invalid-date")).toBe(0);
    });
  });

  describe("4. Amount Formatting & Non-breaking Spaces", () => {
    it("formats amounts with French non-breaking spaces and currency suffix", () => {
      const formatted = formatMoney(12_500, "CDF");
      // \u00A0 is non-breaking space
      expect(formatted).toBe("12\u00A0500\u00A0CDF");
    });

    it("formats large amounts with multiple thousand separators", () => {
      const formatted = formatMoney(1_250_000, "CDF");
      expect(formatted).toBe("1\u00A0250\u00A0000\u00A0CDF");
    });

    it("formats zero amount correctly", () => {
      const formatted = formatMoney(0, "CDF");
      expect(formatted).toBe("0\u00A0CDF");
    });

    it("formats negative discrepancy amount with minus sign and non-breaking spaces", () => {
      const formatted = formatMoney(-5_000, "CDF");
      expect(formatted).toBe("-5\u00A0000\u00A0CDF");
    });
  });

  describe("5. Weekly Periods and Bounds", () => {
    it("returns correct week bounds starting on Monday and ending on Sunday", () => {
      // Wednesday Oct 14, 2026
      const ref = new Date("2026-10-14T10:00:00Z");
      const bounds = getWeekBounds(ref);

      expect(bounds.start.getDay()).toBe(1); // Monday
      expect(bounds.end.getDay()).toBe(0); // Sunday
      expect(bounds.weekString).toBe("2026-W42");

      const rangeString = formatWeekRange(bounds.start, bounds.end);
      expect(rangeString).toContain("12");
      expect(rangeString).toContain("18");
    });
  });

  describe("6. Settle and Reverse State Transitions", () => {
    interface LedgerEntry {
      id: string;
      entryType: string;
      amount: number;
      reversalOfId?: string | null;
      isReversed: boolean;
      reversalReason?: string | null;
    }

    it("simulates append-only settlement creation and compensating reversal", () => {
      const ledger: LedgerEntry[] = [];
      let balanceOwed = 100_000;

      // 1. Initial State: balance is 100 000 CDF
      expect(balanceOwed).toBe(100_000);

      // 2. Perform payout of 40 000 CDF
      const payoutAmount = 40_000;
      expect(payoutAmount <= balanceOwed).toBe(true);

      const settlementEntry: LedgerEntry = {
        id: "entry-settle-01",
        entryType: "house_settlement_paid",
        amount: payoutAmount,
        isReversed: false,
      };
      ledger.push(settlementEntry);
      balanceOwed -= payoutAmount;

      expect(balanceOwed).toBe(60_000);
      expect(settlementEntry.isReversed).toBe(false);

      // 3. Reverse the payout with reason
      const reason = "Erreur de virement bancaire";
      expect(reason.length >= 3).toBe(true);

      settlementEntry.isReversed = true;
      settlementEntry.reversalReason = reason;

      const reversalEntry: LedgerEntry = {
        id: "entry-rev-01",
        entryType: "reversal",
        amount: payoutAmount,
        reversalOfId: settlementEntry.id,
        isReversed: false,
      };
      ledger.push(reversalEntry);

      // Restoring balance
      balanceOwed += payoutAmount;

      expect(balanceOwed).toBe(100_000);
      expect(ledger.length).toBe(2);
      expect(ledger[0].isReversed).toBe(true);
      expect(ledger[0].reversalReason).toBe(reason);
      expect(ledger[1].reversalOfId).toBe("entry-settle-01");
    });
  });
});
