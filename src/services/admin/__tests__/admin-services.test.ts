import { describe, expect, it, vi } from "vitest";
import {
  setAdminNeighborhoodStatus,
  setAdminZoneFeePair,
  updateAdminGlobalDistanceLimit,
} from "../coverage.service";
import {
  updateAdminPlatformSettings,
  recordAdminDailyExchangeRate,
} from "../settings.service";
import { assignMissionToCourier } from "../dispatch.service";

vi.mock("@/dal", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/dal")>();
  return {
    ...actual,
    getMissionById: vi.fn(async (id: string) => {
      if (id === "m-dummy") {
        return {
          id: "m-dummy",
          orderId: "ord-dummy",
          type: "pickup",
          courierId: null,
          status: "unassigned",
          slotStart: new Date(),
          slotEnd: new Date(),
          customerZoneId: "zone-customer-nonexistent",
          houseZoneId: "zone-house-nonexistent",
          createdAt: new Date(),
        };
      }
      return null;
    }),
    getEligibleCouriersForZones: vi.fn(async () => []),
    assignMission: vi.fn(async () => true),
    addOrderEvent: vi.fn(async () => {}),
  };
});

describe("Admin Back-Office Services Unit Tests", () => {
  describe("Coverage & Zones Validation (AC 19 & AC 21)", () => {
    it("rejects pausing a neighborhood without a reason (AC 19)", async () => {
      const res = await setAdminNeighborhoodStatus({
        id: "n-dummy",
        status: "paused",
        pauseReason: "",
      });

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toContain("mandatory when setting status to paused (AC 19)");
      }
    });

    it("rejects invalid global distance limits outside 1..3", async () => {
      const resHigh = await updateAdminGlobalDistanceLimit(4);
      expect(resHigh.ok).toBe(false);

      const resLow = await updateAdminGlobalDistanceLimit(0);
      expect(resLow.ok).toBe(false);
    });

    it("rejects invalid distance levels outside 1..3 for zone pairs (AC 21)", async () => {
      const res = await setAdminZoneFeePair({
        customerZoneId: "z-1",
        houseZoneId: "z-2",
        deliveryFee: 2500,
        distanceLevel: 5,
      });

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toContain("Distance level must be 1, 2, or 3");
      }
    });

    it("rejects non-positive delivery fees", async () => {
      const res = await setAdminZoneFeePair({
        customerZoneId: "z-1",
        houseZoneId: "z-2",
        deliveryFee: 0,
        distanceLevel: 2,
      });

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toContain("Delivery fee must be positive");
      }
    });
  });

  describe("Platform Settings & Exchange Rate Controls", () => {
    it("rejects invalid commission rates > 10000 bps (100%)", async () => {
      const res = await updateAdminPlatformSettings({
        defaultCommissionBps: 15000,
      });

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toContain("Commission rate must be between 0 and 10000 bps");
      }
    });

    it("rejects acceptance delays shorter than 15 minutes", async () => {
      const res = await updateAdminPlatformSettings({
        acceptanceDelayMinutes: 10,
      });

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toContain("Acceptance delay must be at least 15 minutes");
      }
    });

    it("rejects non-positive or NaN exchange rates", async () => {
      const res = await recordAdminDailyExchangeRate({
        rate: "-2500",
        effectiveDate: "2026-10-08",
        adminId: "usr_admin",
      });

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toContain("Exchange rate must be a positive number");
      }
    });

    it("requires effectiveDate for exchange rates", async () => {
      const res = await recordAdminDailyExchangeRate({
        rate: "2850",
        effectiveDate: "",
        adminId: "usr_admin",
      });

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toContain("Effective date is required");
      }
    });
  });

  describe("Dispatch & Courier Assignment (AC 20)", () => {
    it("rejects assigning a mission if courier does not cover both customer and house zones", async () => {
      const res = await assignMissionToCourier({
        missionId: "m-dummy",
        orderId: "ord-dummy",
        courierId: "courier-that-does-not-cover-both",
        adminId: "usr_admin",
        customerZoneId: "zone-customer-nonexistent",
        houseZoneId: "zone-house-nonexistent",
      });

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toContain("AC 20 violation");
      }
    });
  });
});
