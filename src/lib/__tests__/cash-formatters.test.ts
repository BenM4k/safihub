import { describe, expect, it } from "vitest";
import {
  formatMoney,
  getDiscrepancyInfo,
  formatFrenchDate,
  formatFrenchDateLong,
} from "../cash-formatters";

describe("cash-formatters", () => {
  describe("formatMoney", () => {
    it("formats amounts in Congolese Francs with non-breaking spaces", () => {
      expect(formatMoney(25000)).toBe("25\u00A0000\u00A0CDF");
      expect(formatMoney(0)).toBe("0\u00A0CDF");
      expect(formatMoney(1500000)).toBe("1\u00A0500\u00A0000\u00A0CDF");
    });

    it("formats negative amounts correctly with a minus sign", () => {
      expect(formatMoney(-5000)).toBe("-5\u00A0000\u00A0CDF");
      expect(formatMoney(-12500)).toBe("-12\u00A0500\u00A0CDF");
    });

    it("formats positive amounts with plus sign when requested", () => {
      expect(formatMoney(3000, "CDF", { showPlusSign: true })).toBe("+3\u00A0000\u00A0CDF");
      expect(formatMoney(0, "CDF", { showPlusSign: true })).toBe("0\u00A0CDF");
    });

    it("handles alternative currency (USD) and null safely", () => {
      expect(formatMoney(50, "USD")).toBe("50\u00A0USD");
      expect(formatMoney(null)).toBe("0\u00A0CDF");
      expect(formatMoney(NaN)).toBe("0\u00A0CDF");
    });
  });

  describe("getDiscrepancyInfo", () => {
    it("classifies zero difference as 'Aucun écart' with success tokens", () => {
      const res = getDiscrepancyInfo(0);
      expect(res.isZero).toBe(true);
      expect(res.isShortage).toBe(false);
      expect(res.isSurplus).toBe(false);
      expect(res.label).toBe("Aucun écart");
      expect(res.formattedAmount).toBe("0\u00A0CDF");
      expect(res.colorClass).toContain("success");
    });

    it("classifies negative difference as 'Manquant' with minus sign and destructive tokens", () => {
      // Reçu 20 000 - Attendu 25 000 = -5 000
      const res = getDiscrepancyInfo(-5000);
      expect(res.isZero).toBe(false);
      expect(res.isShortage).toBe(true);
      expect(res.isSurplus).toBe(false);
      expect(res.sign).toBe("-");
      expect(res.label).toBe("Manquant");
      expect(res.formattedAmount).toBe("-5\u00A0000\u00A0CDF");
      expect(res.colorClass).toContain("destructive");
    });

    it("classifies positive difference as 'Excédent' with plus sign and warning tokens", () => {
      // Reçu 28 000 - Attendu 25 000 = +3 000
      const res = getDiscrepancyInfo(3000);
      expect(res.isZero).toBe(false);
      expect(res.isShortage).toBe(false);
      expect(res.isSurplus).toBe(true);
      expect(res.sign).toBe("+");
      expect(res.label).toBe("Excédent");
      expect(res.formattedAmount).toBe("+3\u00A0000\u00A0CDF");
      expect(res.colorClass).toContain("warning");
    });
  });

  describe("formatFrenchDate", () => {
    it("formats ISO date string into DD/MM/YYYY", () => {
      expect(formatFrenchDate("2026-10-14")).toBe("14/10/2026");
    });

    it("formats readable long date", () => {
      const formatted = formatFrenchDateLong("2026-10-14");
      expect(formatted).toContain("14");
      expect(formatted).toContain("2026");
    });
  });
});
