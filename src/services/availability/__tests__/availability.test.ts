import { describe, expect, it } from "vitest";
import {
  evaluateSlotValidity,
  findNextAvailableSlot,
  fromBukavuDateTime,
  toBukavuDateTime,
  type CourierShiftSegment,
  type HouseClosure,
  type HouseHourSegment,
  type TimeSlot,
} from "../index";

describe("Service Hours & Availability in Bukavu Timezone", () => {
  // House open Monday-Saturday: 08:00 - 18:00 (closed Sunday)
  // Cutoff: 120 minutes (2h), so latest slot must end at or before 16:00
  const houseHours: HouseHourSegment[] = [
    { weekday: 1, opensAt: "08:00", closesAt: "18:00" }, // Mon
    { weekday: 2, opensAt: "08:00", closesAt: "18:00" }, // Tue
    { weekday: 3, opensAt: "08:00", closesAt: "18:00" }, // Wed
    { weekday: 4, opensAt: "08:00", closesAt: "18:00" }, // Thu
    { weekday: 5, opensAt: "08:00", closesAt: "18:00" }, // Fri
    { weekday: 6, opensAt: "08:00", closesAt: "18:00" }, // Sat
  ];

  // Courier shifts Mon-Sat: 07:30 - 18:30
  const courierShifts: CourierShiftSegment[] = [
    { courierId: "c1", weekday: 1, startsAt: "07:30", endsAt: "18:30" },
    { courierId: "c1", weekday: 2, startsAt: "07:30", endsAt: "18:30" },
    { courierId: "c1", weekday: 3, startsAt: "07:30", endsAt: "18:30" },
    { courierId: "c1", weekday: 4, startsAt: "07:30", endsAt: "18:30" },
    { courierId: "c1", weekday: 5, startsAt: "07:30", endsAt: "18:30" },
    { courierId: "c1", weekday: 6, startsAt: "07:30", endsAt: "18:30" },
  ];

  const closures: HouseClosure[] = [
    { startsOn: "2026-10-14", endsOn: "2026-10-14", reason: "Public holiday" },
  ];

  describe("Bukavu Timezone Conversion", () => {
    it("converts between UTC and Bukavu (UTC+2) accurately", () => {
      // 06:00 UTC = 08:00 Bukavu
      const utcDate = new Date("2026-10-12T06:00:00Z");
      const local = toBukavuDateTime(utcDate);
      expect(local.dateString).toBe("2026-10-12");
      expect(local.timeString).toBe("08:00");
      expect(local.weekday).toBe(1); // Monday

      // Round trip back
      const backToUtc = fromBukavuDateTime("2026-10-12", "08:00");
      expect(backToUtc.toISOString()).toBe("2026-10-12T06:00:00.000Z");
    });
  });

  describe("Slot Evaluation & Constraints", () => {
    it("accepts a normal slot within hours and before cutoff", () => {
      // Monday 10:00 - 12:00 Bukavu
      const slot: TimeSlot = {
        start: fromBukavuDateTime("2026-10-12", "10:00"),
        end: fromBukavuDateTime("2026-10-12", "12:00"),
      };

      const result = evaluateSlotValidity({
        slot,
        houseHours,
        houseClosures: closures,
        cutoffMinutes: 120,
        dailyCapacity: 10,
        bookedOrdersByDate: { "2026-10-12": 2 },
        courierShifts,
      });

      expect(result.valid).toBe(true);
    });

    it("AC 1: refuses slot outside house opening hours", () => {
      // Monday 06:00 - 08:00 Bukavu (house opens at 08:00)
      const earlySlot: TimeSlot = {
        start: fromBukavuDateTime("2026-10-12", "06:00"),
        end: fromBukavuDateTime("2026-10-12", "08:00"),
      };

      const result = evaluateSlotValidity({
        slot: earlySlot,
        houseHours,
        houseClosures: closures,
        cutoffMinutes: 120,
        dailyCapacity: 10,
        courierShifts,
      });

      expect(result.valid).toBe(false);
      expect(result.code).toBe("OUTSIDE_OPENING_HOURS");
    });

    it("refuses slot after house cutoff (ends after closesAt - cutoffMinutes)", () => {
      // Monday 15:00 - 17:00 Bukavu (closes at 18:00, cutoff is 120min -> latest end is 16:00)
      const lateSlot: TimeSlot = {
        start: fromBukavuDateTime("2026-10-12", "15:00"),
        end: fromBukavuDateTime("2026-10-12", "17:00"),
      };

      const result = evaluateSlotValidity({
        slot: lateSlot,
        houseHours,
        houseClosures: closures,
        cutoffMinutes: 120,
        dailyCapacity: 10,
        courierShifts,
      });

      expect(result.valid).toBe(false);
      expect(result.code).toBe("AFTER_CUTOFF");
    });

    it("refuses slot on house closure date", () => {
      // 2026-10-14 is in closures list
      const holidaySlot: TimeSlot = {
        start: fromBukavuDateTime("2026-10-14", "10:00"),
        end: fromBukavuDateTime("2026-10-14", "12:00"),
      };

      const result = evaluateSlotValidity({
        slot: holidaySlot,
        houseHours,
        houseClosures: closures,
        cutoffMinutes: 120,
        dailyCapacity: 10,
        courierShifts,
      });

      expect(result.valid).toBe(false);
      expect(result.code).toBe("HOUSE_CLOSED_DATE");
    });

    it("AC 5: refuses slot when house daily capacity is reached", () => {
      const slot: TimeSlot = {
        start: fromBukavuDateTime("2026-10-12", "10:00"),
        end: fromBukavuDateTime("2026-10-12", "12:00"),
      };

      const result = evaluateSlotValidity({
        slot,
        houseHours,
        houseClosures: closures,
        cutoffMinutes: 120,
        dailyCapacity: 5,
        bookedOrdersByDate: { "2026-10-12": 5 }, // Full!
        courierShifts,
      });

      expect(result.valid).toBe(false);
      expect(result.code).toBe("DAILY_CAPACITY_REACHED");
    });

    it("refuses slot when no courier is on shift", () => {
      const slot: TimeSlot = {
        start: fromBukavuDateTime("2026-10-12", "10:00"),
        end: fromBukavuDateTime("2026-10-12", "12:00"),
      };

      const result = evaluateSlotValidity({
        slot,
        houseHours,
        houseClosures: closures,
        cutoffMinutes: 120,
        dailyCapacity: 10,
        courierShifts: [], // No couriers on shift!
      });

      expect(result.valid).toBe(false);
      expect(result.code).toBe("NO_COURIER_ON_SHIFT");
    });

    it("refuses slot with end date before or equal to start date", () => {
      const invalidSlot: TimeSlot = {
        start: fromBukavuDateTime("2026-10-12", "12:00"),
        end: fromBukavuDateTime("2026-10-12", "10:00"),
      };

      const result = evaluateSlotValidity({
        slot: invalidSlot,
        houseHours,
        houseClosures: closures,
        cutoffMinutes: 120,
        dailyCapacity: 10,
        courierShifts,
      });

      expect(result.valid).toBe(false);
      expect(result.code).toBe("INVALID_DATES");
    });

    it("refuses slot starting before currentTime plus leadTimeMinutes", () => {
      const now = fromBukavuDateTime("2026-10-12", "09:45");
      const tooSoonSlot: TimeSlot = {
        start: fromBukavuDateTime("2026-10-12", "10:00"),
        end: fromBukavuDateTime("2026-10-12", "12:00"),
      };

      // 30 min lead time means earliest start is 10:15
      const result = evaluateSlotValidity({
        slot: tooSoonSlot,
        houseHours,
        houseClosures: closures,
        cutoffMinutes: 120,
        dailyCapacity: 10,
        courierShifts,
        currentTime: now,
        leadTimeMinutes: 30,
      });

      expect(result.valid).toBe(false);
      expect(result.code).toBe("INVALID_DATES");
    });
  });

  describe("Next Available Slot Search", () => {
    it("proposes next available slot across midnight when ordering at 23:00", () => {
      // Customer orders at 23:00 on Monday night 2026-10-12 Bukavu time (21:00 UTC)
      const orderTimeUtc = fromBukavuDateTime("2026-10-12", "23:00");

      const nextSlot = findNextAvailableSlot({
        referenceTime: orderTimeUtc,
        houseHours,
        houseClosures: closures,
        cutoffMinutes: 120,
        dailyCapacity: 10,
        courierShifts,
        slotLengthMinutes: 120,
      });

      expect(nextSlot).not.toBeNull();
      const localSlot = toBukavuDateTime(nextSlot!.start);
      // Expected: Next morning (Tuesday 2026-10-13) at 08:00 Bukavu time!
      expect(localSlot.dateString).toBe("2026-10-13");
      expect(localSlot.timeString).toBe("08:00");
    });

    it("skips closed days and days where capacity is full", () => {
      // Monday 2026-10-12 at 15:30 (too late today due to 120min cutoff before 18:00)
      // Tuesday 2026-10-13 has capacity reached (bookedCount >= 5)
      // Wednesday 2026-10-14 is a public holiday closure
      // Therefore, next slot must be Thursday 2026-10-15 at 08:00!
      const orderTimeUtc = fromBukavuDateTime("2026-10-12", "15:30");

      const nextSlot = findNextAvailableSlot({
        referenceTime: orderTimeUtc,
        houseHours,
        houseClosures: closures,
        cutoffMinutes: 120,
        dailyCapacity: 5,
        bookedOrdersByDate: {
          "2026-10-13": 5, // Capacity full on Tuesday
        },
        courierShifts,
        slotLengthMinutes: 120,
      });

      expect(nextSlot).not.toBeNull();
      const localSlot = toBukavuDateTime(nextSlot!.start);
      expect(localSlot.dateString).toBe("2026-10-15"); // Thursday!
      expect(localSlot.timeString).toBe("08:00");
    });
  });
});
