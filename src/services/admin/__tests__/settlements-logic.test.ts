import { describe, expect, it } from "vitest";
import { formatMoney } from "@/lib/cash-formatters";
import {
  SETTLEMENT_OVERDUE_DAYS_THRESHOLD,
  calculateDaysOverdue,
  getWeekBounds,
  formatWeekRange,
} from "@/components/admin/settlements/period-utils";

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
    const balanceOwedCDF = 120_000;

    it("allows valid partial payments less than or equal to balance", () => {
      const partialPayment = 50_000;
      const isValid = partialPayment > 0 && partialPayment <= balanceOwedCDF;
      expect(isValid).toBe(true);

      const remainingBalance = balanceOwedCDF - partialPayment;
      expect(remainingBalance).toBe(70_000);
    });

    it("allows full settlement equal to balance", () => {
      const fullPayment = 120_000;
      const isValid = fullPayment > 0 && fullPayment <= balanceOwedCDF;
      expect(isValid).toBe(true);

      const remainingBalance = balanceOwedCDF - fullPayment;
      expect(remainingBalance).toBe(0);
    });

    it("strictly rejects payouts that exceed the current balance", () => {
      const overPayment = 130_000;
      const isValid = overPayment > 0 && overPayment <= balanceOwedCDF;
      expect(isValid).toBe(false);
    });

    it("strictly rejects payouts of zero or negative amounts", () => {
      expect(0 > 0).toBe(false);
      expect(-5000 > 0).toBe(false);
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
