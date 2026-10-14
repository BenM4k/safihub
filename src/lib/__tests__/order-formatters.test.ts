import { describe, expect, it } from "vitest";
import {
  formatAmount,
  formatCustomerDisplay,
  formatDateTime,
  formatOrderReference,
  formatPhone,
  formatRelativeTime,
  getOrderStatusConfig,
  getSourceConfig,
  ORDER_STATUS_CONFIG,
} from "../order-formatters";
import type { OrderStatus } from "@/services/db/schema";

describe("order-formatters", () => {
  describe("formatAmount", () => {
    it("formats amounts in Congolese Francs correctly", () => {
      expect(formatAmount(18000)).toBe("18 000 CDF");
      expect(formatAmount(2500)).toBe("2 500 CDF");
      expect(formatAmount(0)).toBe("0 CDF");
      expect(formatAmount(1500000)).toBe("1 500 000 CDF");
    });

    it("handles alternative currency and invalid numbers safely", () => {
      expect(formatAmount(50, "USD")).toBe("50 USD");
      expect(formatAmount(null)).toBe("0 CDF");
      expect(formatAmount(NaN)).toBe("0 CDF");
    });
  });

  describe("formatPhone", () => {
    it("formats 12-digit international DRC numbers (+243)", () => {
      expect(formatPhone("+243991234567")).toBe("+243 99 123 4567");
      expect(formatPhone("243812345678")).toBe("+243 81 234 5678");
    });

    it("formats 10-digit local DRC numbers starting with 0", () => {
      expect(formatPhone("0991234567")).toBe("+243 99 123 4567");
      expect(formatPhone("0851112233")).toBe("+243 85 111 2233");
    });

    it("formats 9-digit DRC numbers without trunk prefix", () => {
      expect(formatPhone("971234567")).toBe("+243 97 123 4567");
    });

    it("handles spaced numbers and empty values gracefully", () => {
      expect(formatPhone("+243 99 900 0001")).toBe("+243 99 900 0001");
      expect(formatPhone("")).toBe("—");
      expect(formatPhone(null)).toBe("—");
    });
  });

  describe("formatOrderReference", () => {
    it("formats order references cleanly", () => {
      expect(formatOrderReference("ORD-1042")).toBe("#1042");
      expect(formatOrderReference("SAF-8821")).toBe("#8821");
      expect(formatOrderReference("1042")).toBe("#1042");
      expect(formatOrderReference(null, "f47ac10b-58cc-4372-a567-0e02b2c3d479")).toBe("#f47ac10b");
      expect(formatOrderReference(null)).toBe("#---");
    });
  });

  describe("formatRelativeTime", () => {
    it("formats relative durations in French", () => {
      const now = new Date("2026-10-14T14:00:00Z");

      const thirtySecsAgo = new Date("2026-10-14T13:59:30Z");
      expect(formatRelativeTime(thirtySecsAgo, now)).toBe("à l'instant");

      const fifteenMinsAgo = new Date("2026-10-14T13:45:00Z");
      expect(formatRelativeTime(fifteenMinsAgo, now)).toBe("il y a 15 min");

      const twoHoursAgo = new Date("2026-10-14T12:00:00Z");
      expect(formatRelativeTime(twoHoursAgo, now)).toBe("il y a 2 h");

      const threeDaysAgo = new Date("2026-10-11T14:00:00Z");
      expect(formatRelativeTime(threeDaysAgo, now)).toBe("il y a 3 j");

      const twoMonthsAgo = new Date("2026-08-14T14:00:00Z");
      expect(formatRelativeTime(twoMonthsAgo, now)).toBe("il y a 2 mois");
    });

    it("handles invalid dates", () => {
      expect(formatRelativeTime(null)).toBe("—");
      expect(formatRelativeTime("invalid-date")).toBe("—");
    });
  });

  describe("formatDateTime", () => {
    it("formats short date and time", () => {
      const date = new Date("2026-10-14T13:45:00Z");
      const res = formatDateTime(date);
      expect(res).toContain("2026");
      expect(res).toContain(":");
    });
  });

  describe("getOrderStatusConfig", () => {
    it("maps 'created' to 'En attente' with amber warning styling", () => {
      const config = getOrderStatusConfig("created");
      expect(config.label).toBe("En attente");
      expect(config.category).toBe("pending");
      expect(config.dotClass).toContain("warning");
    });

    it("maps 'delivered' to 'Livrée' with success styling", () => {
      const config = getOrderStatusConfig("delivered");
      expect(config.label).toBe("Livrée");
      expect(config.category).toBe("delivered");
      expect(config.dotClass).toContain("success");
    });

    it("maps 'cancelled' to 'Annulée' with destructive styling", () => {
      const config = getOrderStatusConfig("cancelled");
      expect(config.label).toBe("Annulée");
      expect(config.category).toBe("cancelled");
      expect(config.dotClass).toContain("destructive");
    });

    it("maps in-progress states to blue styling", () => {
      const progressStatuses: OrderStatus[] = [
        "accepted",
        "pickup_assigned",
        "pickup_in_progress",
        "picked_up",
        "received",
        "washing",
        "ready",
        "delivery_slot_confirmed",
        "delivery_assigned",
        "delivery_in_progress",
      ];
      for (const st of progressStatuses) {
        const config = getOrderStatusConfig(st);
        expect(config.category).toBe("progress");
        expect(config.dotClass).toContain("primary");
      }
    });

    it("covers every status in ORDER_STATUS_CONFIG", () => {
      const allStatuses = Object.keys(ORDER_STATUS_CONFIG) as OrderStatus[];
      expect(allStatuses.length).toBeGreaterThan(15);
      for (const status of allStatuses) {
        const config = getOrderStatusConfig(status);
        expect(config.label).toBeTruthy();
        expect(config.dotClass).toBeTruthy();
        expect(config.badgeClass).toBeTruthy();
      }
    });
  });

  describe("formatCustomerDisplay", () => {
    it("returns real customer names", () => {
      const res = formatCustomerDisplay("Alain Mukendi", "+243991234567");
      expect(res.displayName).toBe("Alain Mukendi");
      expect(res.isGuest).toBe(false);
      expect(res.formattedPhone).toBe("+243 99 123 4567");
    });

    it("hides synthetic placeholders like 'Guest Phone Customer'", () => {
      const res1 = formatCustomerDisplay("Guest Phone Customer", "+243991234567");
      expect(res1.displayName).toBeNull();
      expect(res1.isGuest).toBe(true);
      expect(res1.formattedPhone).toBe("+243 99 123 4567");

      const res2 = formatCustomerDisplay("Registered Customer", "+243991234567");
      expect(res2.displayName).toBeNull();
      expect(res2.isGuest).toBe(true);

      const res3 = formatCustomerDisplay("", "+243991234567");
      expect(res3.displayName).toBeNull();
      expect(res3.isGuest).toBe(true);
    });
  });

  describe("getSourceConfig", () => {
    it("maps sources to proper French labels and icons", () => {
      expect(getSourceConfig("app").label).toBe("App");
      expect(getSourceConfig("whatsapp").label).toBe("WhatsApp");
      expect(getSourceConfig("phone").label).toBe("Téléphone");
      expect(getSourceConfig("manual").label).toBe("Saisie manuelle");
    });
  });
});
