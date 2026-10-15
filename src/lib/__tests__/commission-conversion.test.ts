import { describe, expect, it } from "vitest";
import {
  bpsToPercentString,
  formatCommissionDisplay,
  percentToBps,
} from "../commission-conversion";

describe("commission-conversion (bps <-> percent)", () => {
  describe("percentToBps", () => {
    it("converts empty, null, or undefined to null (default)", () => {
      expect(percentToBps(null)).toBeNull();
      expect(percentToBps(undefined)).toBeNull();
      expect(percentToBps("")).toBeNull();
      expect(percentToBps("   ")).toBeNull();
    });

    it("converts integer percentages to bps", () => {
      expect(percentToBps(0)).toBe(0);
      expect(percentToBps("0")).toBe(0);
      expect(percentToBps(20)).toBe(2000);
      expect(percentToBps("20")).toBe(2000);
      expect(percentToBps(100)).toBe(10000);
      expect(percentToBps("100")).toBe(10000);
    });

    it("converts decimal percentages with dot or comma", () => {
      expect(percentToBps("0.5")).toBe(50);
      expect(percentToBps("0,5")).toBe(50);
      expect(percentToBps("20.5")).toBe(2050);
      expect(percentToBps("20,5")).toBe(2050);
      expect(percentToBps("12.25")).toBe(1225);
      expect(percentToBps("12,75")).toBe(1275);
    });

    it("rejects invalid or out of bound values", () => {
      expect(() => percentToBps("-1")).toThrow();
      expect(() => percentToBps("101")).toThrow();
      expect(() => percentToBps("abc")).toThrow();
      expect(() => percentToBps("20.555")).toThrow();
    });
  });

  describe("bpsToPercentString", () => {
    it("converts null and undefined to null", () => {
      expect(bpsToPercentString(null)).toBeNull();
      expect(bpsToPercentString(undefined)).toBeNull();
    });

    it("converts integer basis points to string", () => {
      expect(bpsToPercentString(0)).toBe("0");
      expect(bpsToPercentString(50)).toBe("0.5");
      expect(bpsToPercentString(2000)).toBe("20");
      expect(bpsToPercentString(2050)).toBe("20.5");
      expect(bpsToPercentString(1225)).toBe("12.25");
      expect(bpsToPercentString(10000)).toBe("100");
    });
  });

  describe("formatCommissionDisplay", () => {
    it("displays default when bps is null", () => {
      expect(formatCommissionDisplay(null, 2000)).toBe("Défaut (20 %)");
      expect(formatCommissionDisplay(undefined, 2000)).toBe("Défaut (20 %)");
      expect(formatCommissionDisplay(null, 1500)).toBe("Défaut (15 %)");
      expect(formatCommissionDisplay(null, 1750)).toBe("Défaut (17.5 %)");
    });

    it("displays custom values formatted with % suffix", () => {
      expect(formatCommissionDisplay(2000)).toBe("20 %");
      expect(formatCommissionDisplay(2050)).toBe("20.5 %");
      expect(formatCommissionDisplay(0)).toBe("0 %");
      expect(formatCommissionDisplay(50)).toBe("0.5 %");
      expect(formatCommissionDisplay(10000)).toBe("100 %");
    });
  });
});
