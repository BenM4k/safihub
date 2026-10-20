import { describe, it, expect, vi } from "vitest";
import {
  getHouseHoursData,
  updateHouseHoursSchedule,
  addHouseClosureEntry,
  updateHouseClosureEntry,
  importHouseHolidays,
  deleteHouseClosureEntry,
} from "../house.service";

// In-memory mocks for DAL methods
const mockHours = [
  { id: "h1", houseId: "house-1", weekday: 1, opensAt: "08:00:00", closesAt: "18:00:00" },
];

const mockClosures: Array<{
  id: string;
  houseId: string;
  startsOn: string;
  endsOn: string;
  reason: string | null;
}> = [
  { id: "c1", houseId: "house-1", startsOn: "2026-12-25", endsOn: "2026-12-25", reason: "Noël" },
];

vi.mock("@/dal", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/dal")>();
  return {
    ...actual,
    getHouseHours: vi.fn(async (houseId: string) => mockHours.filter((h) => h.houseId === houseId)),
    setHouseHours: vi.fn(async () => {}),
    getHouseClosures: vi.fn(async (houseId: string) => mockClosures.filter((c) => c.houseId === houseId)),
    createHouseClosure: vi.fn(async (data) => {
      mockClosures.push({
        id: `c-${mockClosures.length + 1}`,
        houseId: data.houseId,
        startsOn: data.startsOn,
        endsOn: data.endsOn,
        reason: data.reason ?? null,
      });
    }),
    updateHouseClosure: vi.fn(async (id: string, houseId: string, data) => {
      const item = mockClosures.find((c) => c.id === id && c.houseId === houseId);
      if (!item) return false;
      item.startsOn = data.startsOn;
      item.endsOn = data.endsOn;
      item.reason = data.reason ?? null;
      return true;
    }),
    createHouseClosuresBatch: vi.fn(async (houseId: string, items) => {
      for (const it of items) {
        mockClosures.push({
          id: `c-${mockClosures.length + 1}`,
          houseId,
          startsOn: it.startsOn,
          endsOn: it.endsOn,
          reason: it.reason ?? null,
        });
      }
      return items.length;
    }),
    deleteHouseClosure: vi.fn(async (id: string, houseId?: string) => {
      const idx = mockClosures.findIndex((c) => c.id === id && (!houseId || c.houseId === houseId));
      if (idx === -1) return false;
      mockClosures.splice(idx, 1);
      return true;
    }),
    getWaitingAcceptanceCount: vi.fn(async () => 3),
  };
});

describe("Hours & Closures Service", () => {
  describe("getHouseHoursData", () => {
    it("returns hours, closures, and waiting orders count with timezone", async () => {
      const res = await getHouseHoursData("house-1");
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.hours.length).toBeGreaterThan(0);
        expect(res.value.waitingOrdersCount).toBe(3);
        expect(res.value.timezone).toBe("Africa/Lubumbashi");
        expect(res.value.timezoneLabel).toBe("Heure de Bukavu, UTC+2");
      }
    });
  });

  describe("updateHouseHoursSchedule", () => {
    it("rejects invalid weekday out of bounds", async () => {
      const res = await updateHouseHoursSchedule("house-1", [
        { weekday: 0, opensAt: "08:00", closesAt: "18:00" },
      ]);
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toContain("Weekday");
      }
    });

    it("rejects when closing is before or equal to opening", async () => {
      const res = await updateHouseHoursSchedule("house-1", [
        { weekday: 1, opensAt: "18:00", closesAt: "08:00" },
      ]);
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toContain("Closing time");
      }
    });

    it("rejects overlapping ranges on the same weekday", async () => {
      const res = await updateHouseHoursSchedule("house-1", [
        { weekday: 1, opensAt: "08:00", closesAt: "14:00" },
        { weekday: 1, opensAt: "12:00", closesAt: "18:00" },
      ]);
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toContain("overlap");
      }
    });

    it("accepts valid non-overlapping split ranges on the same weekday", async () => {
      const res = await updateHouseHoursSchedule("house-1", [
        { weekday: 1, opensAt: "08:00", closesAt: "12:00" },
        { weekday: 1, opensAt: "14:00", closesAt: "18:00" },
      ]);
      expect(res.ok).toBe(true);
    });
  });

  describe("addHouseClosureEntry & updateHouseClosureEntry", () => {
    it("rejects end date before start date", async () => {
      const res = await addHouseClosureEntry({
        houseId: "house-1",
        startsOn: "2026-12-31",
        endsOn: "2026-12-01",
      });
      expect(res.ok).toBe(false);
    });

    it("creates a single-day closure when start equals end", async () => {
      const res = await addHouseClosureEntry({
        houseId: "house-1",
        startsOn: "2026-06-30",
        endsOn: "2026-06-30",
        reason: "Indépendance",
      });
      expect(res.ok).toBe(true);
    });

    it("updates closure and scopes to houseId", async () => {
      const res = await updateHouseClosureEntry("house-1", "c1", {
        startsOn: "2026-12-25",
        endsOn: "2026-12-26",
        reason: "Fête de Noël prolongée",
      });
      expect(res.ok).toBe(true);

      // Attempting to update with wrong houseId should fail
      const wrongHouseRes = await updateHouseClosureEntry("house-other", "c1", {
        startsOn: "2026-12-25",
        endsOn: "2026-12-26",
      });
      expect(wrongHouseRes.ok).toBe(false);
    });
  });

  describe("importHouseHolidays", () => {
    it("imports holidays while skipping already registered closures", async () => {
      const res = await importHouseHolidays("house-1", [
        { startsOn: "2026-12-25", endsOn: "2026-12-26", reason: "Noël (already present)" },
        { startsOn: "2026-01-01", endsOn: "2026-01-01", reason: "Nouvel An" },
        { startsOn: "2026-01-04", endsOn: "2026-01-04", reason: "Martyrs" },
      ]);
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.importedCount).toBe(2);
      }
    });
  });

  describe("deleteHouseClosureEntry", () => {
    it("enforces tenant boundary on closure deletion", async () => {
      // Deleting with matching houseId
      const res = await deleteHouseClosureEntry("house-1", "c1");
      expect(res.ok).toBe(true);

      // Deleting non-existent or other house closure fails
      const notFoundRes = await deleteHouseClosureEntry("house-1", "non-existent");
      expect(notFoundRes.ok).toBe(false);
    });
  });
});
