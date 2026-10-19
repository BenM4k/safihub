import { describe, it, expect } from "vitest";
import {
  computeOrderAcceptanceCountdown,
  computeAcceptanceRate,
  computeNetRevenue,
  computeHouseOpenStatus,
  formatOrderItemsSummary,
  validateBannerImageFile,
} from "../partner-dashboard";

describe("Partner Dashboard Domain Calculations", () => {
  describe("computeOrderAcceptanceCountdown", () => {
    it("returns normal urgency when more than 10 minutes remain", () => {
      const now = new Date("2026-10-15T10:00:00Z");
      const deadline = new Date("2026-10-15T10:25:00Z"); // 25 min left
      const res = computeOrderAcceptanceCountdown(deadline, now);

      expect(res.isExpired).toBe(false);
      expect(res.minutesRemaining).toBe(25);
      expect(res.urgency).toBe("normal");
      expect(res.label).toBe("Reste 25 min");
    });

    it("returns warning urgency (amber) when between 5 and 10 minutes remain", () => {
      const now = new Date("2026-10-15T10:00:00Z");
      const deadline = new Date("2026-10-15T10:08:00Z"); // 8 min left
      const res = computeOrderAcceptanceCountdown(deadline, now);

      expect(res.isExpired).toBe(false);
      expect(res.urgency).toBe("warning");
      expect(res.label).toBe("Reste 8 min");
    });

    it("returns critical urgency (red) when less than 5 minutes remain", () => {
      const now = new Date("2026-10-15T10:00:00Z");
      const deadline = new Date("2026-10-15T10:03:30Z"); // 3 min 30 s left
      const res = computeOrderAcceptanceCountdown(deadline, now);

      expect(res.isExpired).toBe(false);
      expect(res.urgency).toBe("critical");
      expect(res.label).toContain("Reste 3 min");
    });

    it("returns expired status when deadline is reached or past", () => {
      const now = new Date("2026-10-15T10:15:00Z");
      const deadline = new Date("2026-10-15T10:00:00Z"); // 15 min ago
      const res = computeOrderAcceptanceCountdown(deadline, now);

      expect(res.isExpired).toBe(true);
      expect(res.urgency).toBe("expired");
      expect(res.label).toBe("Expirée depuis 15 min");
    });
  });

  describe("computeAcceptanceRate", () => {
    it("calculates correct percentage: accepted / (accepted + rejected + expired)", () => {
      // 18 accepted, 1 rejected, 1 expired => 18 / 20 = 90%
      expect(computeAcceptanceRate(18, 1, 1)).toBe(90);
    });

    it("returns null when no decided orders exist", () => {
      expect(computeAcceptanceRate(0, 0, 0)).toBeNull();
    });
  });

  describe("computeNetRevenue", () => {
    it("deducts platform commission from items total and floors at 0", () => {
      expect(computeNetRevenue(20000, 3000)).toBe(17000);
      expect(computeNetRevenue(5000, 6000)).toBe(0);
    });
  });

  describe("computeHouseOpenStatus", () => {
    it("returns paused status if isPaused is true", () => {
      const res = computeHouseOpenStatus({
        isPaused: true,
        hours: [{ weekday: 4, opensAt: "08:00:00", closesAt: "18:00:00" }],
      });
      expect(res.status).toBe("paused");
      expect(res.label).toBe("En pause");
    });

    it("returns open with closing time when inside hours in Bukavu", () => {
      // 2026-10-15 is Thursday (weekday 4).
      // Bukavu is UTC+2. 10:00 UTC = 12:00 Bukavu
      const now = new Date("2026-10-15T10:00:00Z");
      const res = computeHouseOpenStatus({
        isPaused: false,
        hours: [{ weekday: 4, opensAt: "08:00:00", closesAt: "18:00:00" }],
        now,
      });
      expect(res.status).toBe("open");
      expect(res.label).toBe("Ouvert jusqu'à 18:00");
    });

    it("returns closed when outside operating hours", () => {
      // 18:30 UTC = 20:30 Bukavu (after 18:00)
      const now = new Date("2026-10-15T18:30:00Z");
      const res = computeHouseOpenStatus({
        isPaused: false,
        hours: [{ weekday: 4, opensAt: "08:00:00", closesAt: "18:00:00" }],
        now,
      });
      expect(res.status).toBe("closed");
    });
  });

  describe("formatOrderItemsSummary", () => {
    it("formats items list into clean French string", () => {
      const summary = formatOrderItemsSummary([
        { itemNameFr: "Chemise", declaredQuantity: 3 },
        { itemNameFr: "Pantalon", declaredQuantity: 2 },
      ]);
      expect(summary).toBe("3 Chemise, 2 Pantalon");
    });

    it("handles more than 3 items with +N extra count", () => {
      const summary = formatOrderItemsSummary([
        { itemNameFr: "Chemise", declaredQuantity: 2 },
        { itemNameFr: "Pantalon", declaredQuantity: 1 },
        { itemNameFr: "Veste", declaredQuantity: 1 },
        { itemNameFr: "Drap", declaredQuantity: 4 },
      ]);
      expect(summary).toBe("2 Chemise, 1 Pantalon, 1 Veste, +4 autre(s)");
    });
  });

  describe("validateBannerImageFile", () => {
    it("accepts valid WebP, JPEG and PNG under 5MB", () => {
      const file = new File(["dummy"], "banner.webp", { type: "image/webp" });
      expect(validateBannerImageFile(file).ok).toBe(true);
    });

    it("rejects invalid formats like GIF or PDF", () => {
      const file = new File(["dummy"], "doc.pdf", { type: "application/pdf" });
      const res = validateBannerImageFile(file);
      expect(res.ok).toBe(false);
    });
  });
});
