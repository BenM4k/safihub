import { describe, expect, it } from "vitest";
import { evaluateTodayOpeningStatus } from "../customer-houses.dal";
import { toBukavuDateTime } from "@/services/availability/bukavu-time";

describe("evaluateTodayOpeningStatus", () => {
  it("handles split-shift opening hours and joins all segments in display order", () => {
    const segments = [
      { opensAt: "14:00:00", closesAt: "18:00:00" },
      { opensAt: "08:00:00", closesAt: "12:00:00" },
    ];

    // 13:00 Bukavu (11:00 UTC) -> lunch break between segments
    const lunchRes = evaluateTodayOpeningStatus({
      isPaused: false,
      todaySegments: segments,
      closures: [],
      bukavuNow: toBukavuDateTime(new Date("2026-10-12T11:00:00Z")),
    });
    expect(lunchRes.isOpenNow).toBe(false);
    expect(lunchRes.todayHoursText).toBe("08:00 - 12:00, 14:00 - 18:00");

    // 15:00 Bukavu (13:00 UTC) -> open in afternoon segment
    const afternoonRes = evaluateTodayOpeningStatus({
      isPaused: false,
      todaySegments: segments,
      closures: [],
      bukavuNow: toBukavuDateTime(new Date("2026-10-12T13:00:00Z")),
    });
    expect(afternoonRes.isOpenNow).toBe(true);
    expect(afternoonRes.todayHoursText).toBe("08:00 - 12:00, 14:00 - 18:00");
  });

  it("marks house closed when an active house_closures record covers today", () => {
    const res = evaluateTodayOpeningStatus({
      isPaused: false,
      todaySegments: [{ opensAt: "08:00:00", closesAt: "18:00:00" }],
      closures: [{ startsOn: "2026-10-12", endsOn: "2026-10-13" }],
      bukavuNow: toBukavuDateTime(new Date("2026-10-12T08:00:00Z")),
    });
    expect(res.isOpenNow).toBe(false);
    expect(res.todayHoursText).toBe("Temporairement fermé");
  });
});
