import { describe, it, expect } from "vitest";
import {
  generateTimeOptions,
  validateRange,
  validateDayRanges,
  calculateWeeklyTotalMinutes,
  formatWeeklyHoursTotal,
  formatDateFr,
  calculateDurationDays,
  getClosureStatus,
  computeLiveStatus,
  computeTimerExample,
  checkClosureOverlap,
  type DaySchedule,
} from "../hours-utils";
import { getDrcHolidaysForYear } from "../drc-holidays";

describe("hours-utils", () => {
  describe("generateTimeOptions", () => {
    it("generates 30-minute steps from 06:00 to 22:00", () => {
      const options = generateTimeOptions(30, 6, 22);
      expect(options[0]).toBe("06:00");
      expect(options[1]).toBe("06:30");
      expect(options[options.length - 1]).toBe("22:00");
      expect(options.includes("08:00")).toBe(true);
      expect(options.includes("18:00")).toBe(true);
    });

    it("generates 15-minute steps when requested", () => {
      const options = generateTimeOptions(15, 8, 9);
      expect(options).toEqual(["08:00", "08:15", "08:30", "08:45", "09:00"]);
    });
  });

  describe("validateRange and validateDayRanges", () => {
    it("accepts valid opening and closing times", () => {
      expect(validateRange({ opensAt: "08:00", closesAt: "18:00" })).toBeNull();
    });

    it("rejects when closing is before or equal to opening", () => {
      expect(validateRange({ opensAt: "18:00", closesAt: "08:00" })).toContain("après");
      expect(validateRange({ opensAt: "12:00", closesAt: "12:00" })).toContain("après");
    });

    it("validates split daytime ranges without overlap", () => {
      const ranges = [
        { opensAt: "08:00", closesAt: "12:00" },
        { opensAt: "14:00", closesAt: "18:00" },
      ];
      expect(validateDayRanges(ranges)).toBeNull();
    });

    it("detects overlapping ranges on the same day", () => {
      const ranges = [
        { opensAt: "08:00", closesAt: "13:00" },
        { opensAt: "12:00", closesAt: "17:00" },
      ];
      expect(validateDayRanges(ranges)).toContain("chevaucher");
    });
  });

  describe("calculateWeeklyTotalMinutes & formatWeeklyHoursTotal", () => {
    it("computes 66 hours for standard 6-day 08:00-18:00 plus Sat 08:00-14:00", () => {
      const schedule: Record<number, DaySchedule> = {
        1: { weekday: 1, name: "Lundi", shortName: "Lun", isOpen: true, ranges: [{ opensAt: "08:00", closesAt: "18:00" }] },
        2: { weekday: 2, name: "Mardi", shortName: "Mar", isOpen: true, ranges: [{ opensAt: "08:00", closesAt: "18:00" }] },
        3: { weekday: 3, name: "Mercredi", shortName: "Mer", isOpen: true, ranges: [{ opensAt: "08:00", closesAt: "18:00" }] },
        4: { weekday: 4, name: "Jeudi", shortName: "Jeu", isOpen: true, ranges: [{ opensAt: "08:00", closesAt: "18:00" }] },
        5: { weekday: 5, name: "Vendredi", shortName: "Ven", isOpen: true, ranges: [{ opensAt: "08:00", closesAt: "18:00" }] },
        6: { weekday: 6, name: "Samedi", shortName: "Sam", isOpen: true, ranges: [{ opensAt: "08:00", closesAt: "14:00" }] }, // 6h
        7: { weekday: 7, name: "Dimanche", shortName: "Dim", isOpen: false, ranges: [{ opensAt: "08:00", closesAt: "18:00" }] },
      };
      // 5 * 10h + 6h = 56h = 3360 min
      const totalMin = calculateWeeklyTotalMinutes(schedule);
      expect(totalMin).toBe(3360);
      expect(formatWeeklyHoursTotal(totalMin)).toBe("56 h par semaine");
    });
  });

  describe("formatDateFr & calculateDurationDays", () => {
    it("formats ISO date to jj/mm/aaaa", () => {
      expect(formatDateFr("2026-10-25")).toBe("25/10/2026");
    });

    it("computes duration in days inclusive", () => {
      expect(calculateDurationDays("2026-12-25", "2026-12-25")).toBe(1);
      expect(calculateDurationDays("2026-12-24", "2026-12-26")).toBe(3);
    });
  });

  describe("getClosureStatus", () => {
    it("classifies past, ongoing, and upcoming correctly relative to Bukavu local date", () => {
      // Suppose today is 2026-10-20
      const refDate = new Date("2026-10-20T10:00:00Z"); // In Bukavu (+2) it's 12:00 on 2026-10-20

      expect(getClosureStatus({ startsOn: "2026-10-10", endsOn: "2026-10-15" }, refDate)).toBe("past");
      expect(getClosureStatus({ startsOn: "2026-10-20", endsOn: "2026-10-22" }, refDate)).toBe("ongoing");
      expect(getClosureStatus({ startsOn: "2026-11-01", endsOn: "2026-11-02" }, refDate)).toBe("upcoming");
    });
  });

  describe("computeLiveStatus", () => {
    const baseSchedule: Record<number, DaySchedule> = {
      1: { weekday: 1, name: "Lundi", shortName: "Lun", isOpen: true, ranges: [{ opensAt: "08:00", closesAt: "18:00" }] },
      2: { weekday: 2, name: "Mardi", shortName: "Mar", isOpen: true, ranges: [{ opensAt: "08:00", closesAt: "18:00" }] },
      3: { weekday: 3, name: "Mercredi", shortName: "Mer", isOpen: true, ranges: [{ opensAt: "08:00", closesAt: "18:00" }] },
      4: { weekday: 4, name: "Jeudi", shortName: "Jeu", isOpen: true, ranges: [{ opensAt: "08:00", closesAt: "18:00" }] },
      5: { weekday: 5, name: "Vendredi", shortName: "Ven", isOpen: true, ranges: [{ opensAt: "08:00", closesAt: "18:00" }] },
      6: { weekday: 6, name: "Samedi", shortName: "Sam", isOpen: true, ranges: [{ opensAt: "08:00", closesAt: "18:00" }] },
      7: { weekday: 7, name: "Dimanche", shortName: "Dim", isOpen: false, ranges: [] },
    };

    it("returns open when current local time is within range", () => {
      // 2026-10-20 is Tuesday. 10:00 UTC = 12:00 Bukavu
      const date = new Date("2026-10-20T10:00:00Z");
      const res = computeLiveStatus(baseSchedule, [], date);
      expect(res.status).toBe("open");
      expect(res.nextInfo).toBe("ferme à 18:00");
    });

    it("returns closed with next opening when closed on Sunday", () => {
      // 2026-10-25 is Sunday. 10:00 UTC = 12:00 Bukavu
      const date = new Date("2026-10-25T10:00:00Z");
      const res = computeLiveStatus(baseSchedule, [], date);
      expect(res.status).toBe("closed");
      expect(res.nextInfo).toContain("demain à 08:00");
    });

    it("returns closed with closure info when currently under active closure", () => {
      const closures = [{ startsOn: "2026-10-20", endsOn: "2026-10-21" }];
      const date = new Date("2026-10-20T10:00:00Z");
      const res = computeLiveStatus(baseSchedule, closures, date);
      expect(res.status).toBe("closed");
      expect(res.text).toContain("fermeture exceptionnelle");
    });
  });

  describe("computeTimerExample", () => {
    it("generates dynamic text based on the real Saturday closing time", () => {
      const schedule: Record<number, DaySchedule> = {
        1: { weekday: 1, name: "Lundi", shortName: "Lun", isOpen: true, ranges: [{ opensAt: "08:00", closesAt: "18:00" }] },
        2: { weekday: 2, name: "Mardi", shortName: "Mar", isOpen: true, ranges: [{ opensAt: "08:00", closesAt: "18:00" }] },
        3: { weekday: 3, name: "Mercredi", shortName: "Mer", isOpen: true, ranges: [{ opensAt: "08:00", closesAt: "18:00" }] },
        4: { weekday: 4, name: "Jeudi", shortName: "Jeu", isOpen: true, ranges: [{ opensAt: "08:00", closesAt: "18:00" }] },
        5: { weekday: 5, name: "Vendredi", shortName: "Ven", isOpen: true, ranges: [{ opensAt: "08:00", closesAt: "18:00" }] },
        6: { weekday: 6, name: "Samedi", shortName: "Sam", isOpen: true, ranges: [{ opensAt: "08:00", closesAt: "18:00" }] },
        7: { weekday: 7, name: "Dimanche", shortName: "Dim", isOpen: false, ranges: [] },
      };
      const text = computeTimerExample(schedule);
      expect(text).toContain("samedi à 17:50");
      expect(text).toContain("lundi à 08:00");
      expect(text).toContain("08:35");
    });
  });

  describe("checkClosureOverlap", () => {
    const closures = [
      { id: "c1", startsOn: "2026-12-24", endsOn: "2026-12-26", reason: "Noël" },
    ];

    it("detects overlapping closure dates", () => {
      expect(checkClosureOverlap("2026-12-25", "2026-12-25", closures)).not.toBeNull();
      expect(checkClosureOverlap("2026-12-26", "2026-12-30", closures)).not.toBeNull();
    });

    it("ignores self when updating closure", () => {
      expect(checkClosureOverlap("2026-12-24", "2026-12-26", closures, "c1")).toBeNull();
    });

    it("allows non-overlapping dates", () => {
      expect(checkClosureOverlap("2026-12-27", "2026-12-28", closures)).toBeNull();
    });
  });

  describe("drc-holidays", () => {
    it("returns 10 official legal holidays for 2026", () => {
      const holidays = getDrcHolidaysForYear(2026);
      expect(holidays.length).toBe(10);
      expect(holidays.some((h) => h.name === "Noël" && h.date === "2026-12-25")).toBe(true);
      expect(holidays.some((h) => h.name === "Nouvel An" && h.date === "2026-01-01")).toBe(true);
      expect(holidays.some((h) => h.name.includes("Kimbangu") && h.date === "2026-04-06")).toBe(true);
    });
  });
});
