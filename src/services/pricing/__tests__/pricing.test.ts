import { describe, expect, it } from "vitest";
import {
  calculateCommission,
  calculateItemsTotal,
  calculateLineItemTotal,
  calculateTotalDue,
  calculateUnitEconomics,
  convertCdfToUsd,
  lookupDeliveryFee,
  roundToCurrencyUnit,
  type ZonePairFee,
} from "../index";

describe("Pricing & Unit Economics Pure Functions", () => {
  describe("calculateLineItemTotal & calculateItemsTotal", () => {
    it("computes line item totals as non-negative integers", () => {
      expect(calculateLineItemTotal(3500, 2)).toBe(7000);
      expect(calculateLineItemTotal(0, 5)).toBe(0);
      expect(calculateLineItemTotal(4000, 0)).toBe(0);
    });

    it("throws when given negative price or quantity", () => {
      expect(() => calculateLineItemTotal(-100, 2)).toThrow();
      expect(() => calculateLineItemTotal(3500, -1)).toThrow();
    });

    it("computes total items correctly across multiple lines", () => {
      const items = [
        { unitPrice: 3500, quantity: 2 }, // 7000
        { unitPrice: 14000, quantity: 1 }, // 14000
        { unitPrice: 4000, quantity: 3 }, // 12000
      ];
      expect(calculateItemsTotal(items)).toBe(33000);
      expect(calculateItemsTotal([])).toBe(0);
    });
  });

  describe("lookupDeliveryFee", () => {
    const matrix: ZonePairFee[] = [
      { customerZoneId: "z1", houseZoneId: "z1", deliveryFee: 2500, distanceLevel: 1 },
      { customerZoneId: "z1", houseZoneId: "z2", deliveryFee: 3500, distanceLevel: 2 },
      { customerZoneId: "z2", houseZoneId: "z1", deliveryFee: 3500, distanceLevel: 2 },
    ];

    it("returns correct fee for matching zone pair", () => {
      expect(lookupDeliveryFee("z1", "z1", matrix)).toBe(2500);
      expect(lookupDeliveryFee("z1", "z2", matrix)).toBe(3500);
    });

    it("returns null when pair is not in matrix", () => {
      expect(lookupDeliveryFee("z1", "z3", matrix)).toBeNull();
    });
  });

  describe("calculateCommission", () => {
    it("computes integer commission based on basis points", () => {
      // 20% commission on 33,000 CDF = 6,600 CDF
      expect(calculateCommission(33000, 2000)).toBe(6600);
      // Owner's own house: 0% commission
      expect(calculateCommission(33000, 0)).toBe(0);
      // 100% commission = 33,000 CDF
      expect(calculateCommission(33000, 10000)).toBe(33000);
      // Handles rounding fractions accurately
      expect(calculateCommission(1234, 1500)).toBe(185); // 1234 * 0.15 = 185.1 -> 185
    });

    it("throws on invalid basis points or negative total", () => {
      expect(() => calculateCommission(-100, 2000)).toThrow();
      expect(() => calculateCommission(1000, -1)).toThrow();
      expect(() => calculateCommission(1000, 10001)).toThrow();
    });
  });

  describe("calculateTotalDue & calculateUnitEconomics", () => {
    it("computes total due as integer items total + delivery fee", () => {
      expect(calculateTotalDue(33000, 3500)).toBe(36500);
      expect(calculateTotalDue(0, 2500)).toBe(2500);
    });

    it("calculates unit economics and break-even delivery fee matching the spec", () => {
      // Spec illustration: items $10 (28,000 CDF), commission $2 (5,600 CDF), courier pay $2 (5,600 CDF), delivery fee $3 (8,400 CDF)
      const economics = calculateUnitEconomics({
        itemsTotal: 28000,
        deliveryFee: 8400,
        commissionAmount: 5600,
        courierPayTotal: 5600,
      });

      expect(economics.breakEvenDeliveryFee).toBe(0); // courierPay - commission <= 0
      expect(economics.grossMargin).toBe(8400); // commission + deliveryFee - courierPay = 5600 + 8400 - 5600 = 8400
      expect(economics.housePayout).toBe(22400); // 28000 - 5600
      expect(economics.platformNet).toBe(8400);
    });

    it("computes positive break-even delivery fee when commission does not cover courier pay", () => {
      const economics = calculateUnitEconomics({
        itemsTotal: 5000,
        deliveryFee: 3000,
        commissionAmount: 1000,
        courierPayTotal: 2500,
      });

      expect(economics.breakEvenDeliveryFee).toBe(1500); // 2500 - 1000 = 1500
      expect(economics.grossMargin).toBe(1500); // 1000 + 3000 - 2500 = 1500
    });
  });

  describe("roundToCurrencyUnit", () => {
    it("rounds CDF amounts to the nearest 50 or 100 unit banknotes", () => {
      expect(roundToCurrencyUnit(2430, 50)).toBe(2450);
      expect(roundToCurrencyUnit(2410, 50)).toBe(2400);
      expect(roundToCurrencyUnit(2450, 100)).toBe(2500);
      expect(roundToCurrencyUnit(2449, 100)).toBe(2400);
    });
  });

  describe("convertCdfToUsd", () => {
    it("converts CDF to USD cents with rate in CDF/USD", () => {
      // 28,000 CDF at 2,800 CDF/USD = $10.00 = 1000 cents
      const res1 = convertCdfToUsd(28000, 2800);
      expect(res1.amountCents).toBe(1000);
      expect(res1.formatted).toBe("$10.00");

      // 3,500 CDF at 2,800 CDF/USD = $1.25 = 125 cents
      const res2 = convertCdfToUsd(3500, 2800);
      expect(res2.amountCents).toBe(125);
      expect(res2.formatted).toBe("$1.25");
    });

    it("converts CDF to USD cents with rate in USD/CDF", () => {
      // 28,000 CDF at 0.00035714 USD/CDF = $10.00
      const res = convertCdfToUsd(28000, 0.000357142857, { rateIsCdfPerUsd: false });
      expect(res.amountCents).toBe(1000);
      expect(res.formatted).toBe("$10.00");
    });

    it("throws on negative amount or non-positive exchange rate", () => {
      expect(() => convertCdfToUsd(-10, 2800)).toThrow();
      expect(() => convertCdfToUsd(1000, 0)).toThrow();
      expect(() => convertCdfToUsd(NaN, 2800)).toThrow();
      expect(() => convertCdfToUsd(1000, NaN)).toThrow();
      expect(() => convertCdfToUsd(Infinity, 2800)).toThrow();
      expect(() => convertCdfToUsd(1000, Infinity)).toThrow();
    });
  });
});
