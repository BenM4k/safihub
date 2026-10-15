import { describe, expect, it } from "vitest";
import { isValidDrcPhone, normalizeDrcPhone } from "@/lib/phone-utils";
import { percentToBps } from "@/lib/commission-conversion";
import { computeOperationalStatus } from "@/services/admin/house.service";

describe("House Form Validation & Status Transitions", () => {
  describe("Name uniqueness and required validation", () => {
    const existingHouseNames = ["Pressing du Lac", "Pressing Étoile", "Kivu Clean"];

    function validateHouseName(name: string, existing: string[]): { valid: boolean; error?: string } {
      const trimmed = name.trim();
      if (!trimmed) {
        return { valid: false, error: "Nom du pressing requis" };
      }
      const lower = trimmed.toLowerCase();
      const isDuplicate = existing.some((e) => e.trim().toLowerCase() === lower);
      if (isDuplicate) {
        return { valid: false, error: "Un pressing porte déjà ce nom" };
      }
      return { valid: true };
    }

    it("accepts a unique valid name", () => {
      expect(validateHouseName("Pressing Nouveau", existingHouseNames).valid).toBe(true);
    });

    it("rejects empty or whitespace-only names", () => {
      expect(validateHouseName("", existingHouseNames).valid).toBe(false);
      expect(validateHouseName("   ", existingHouseNames).valid).toBe(false);
    });

    it("rejects duplicates with case-insensitive check", () => {
      expect(validateHouseName("pressing du lac", existingHouseNames).valid).toBe(false);
      expect(validateHouseName("PRESSING DU LAC", existingHouseNames).valid).toBe(false);
      expect(validateHouseName("kivu clean", existingHouseNames).valid).toBe(false);
    });
  });

  describe("Amount and turnaround constraints", () => {
    function validateMinOrder(amount: number): boolean {
      return Number.isInteger(amount) && amount >= 0;
    }

    function validateTurnaround(hours: number): boolean {
      return Number.isInteger(hours) && hours >= 1 && hours <= 720;
    }

    it("validates minimum order amount integer >= 0", () => {
      expect(validateMinOrder(0)).toBe(true);
      expect(validateMinOrder(5000)).toBe(true);
      expect(validateMinOrder(-1)).toBe(false);
      expect(validateMinOrder(5000.5)).toBe(false);
    });

    it("validates turnaround hours integer between 1 and 720 h", () => {
      expect(validateTurnaround(1)).toBe(true);
      expect(validateTurnaround(48)).toBe(true);
      expect(validateTurnaround(720)).toBe(true);
      expect(validateTurnaround(0)).toBe(false);
      expect(validateTurnaround(-5)).toBe(false);
      expect(validateTurnaround(721)).toBe(false);
      expect(validateTurnaround(24.5)).toBe(false);
    });
  });

  describe("Phone and commission field validation in house form", () => {
    it("validates DRC phone format on create", () => {
      expect(isValidDrcPhone("0900000001")).toBe(true);
      expect(normalizeDrcPhone("0900000001")).toBe("+243900000001");
      expect(isValidDrcPhone("1234")).toBe(false);
    });

    it("converts commission input safely to bps", () => {
      expect(percentToBps("20")).toBe(2000);
      expect(percentToBps("20.5")).toBe(2050);
      expect(percentToBps("")).toBeNull();
    });
  });

  describe("Status Mapping & Operational State Transitions", () => {
    it("maps inactive house to suspended regardless of hours", () => {
      expect(
        computeOperationalStatus({
          isActive: false,
          isPaused: false,
          isClosedByException: false,
          isOpenNow: true,
        })
      ).toBe("suspended");
    });

    it("maps paused house to paused", () => {
      expect(
        computeOperationalStatus({
          isActive: true,
          isPaused: true,
          isClosedByException: false,
          isOpenNow: true,
        })
      ).toBe("paused");
    });

    it("maps house outside operating hours or closed today to closed_today", () => {
      expect(
        computeOperationalStatus({
          isActive: true,
          isPaused: false,
          isClosedByException: false,
          isOpenNow: false,
        })
      ).toBe("closed_today");

      expect(
        computeOperationalStatus({
          isActive: true,
          isPaused: false,
          isClosedByException: true,
          isOpenNow: true,
        })
      ).toBe("closed_today");
    });

    it("maps active, unpaused, open house to active", () => {
      expect(
        computeOperationalStatus({
          isActive: true,
          isPaused: false,
          isClosedByException: false,
          isOpenNow: true,
        })
      ).toBe("active");
    });
  });
});
