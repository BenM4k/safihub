import { describe, expect, it } from "vitest";
import { generatePickupSlotCandidates, STANDARD_PICKUP_SLOT_WINDOWS } from "../slot-candidates";
import { toBukavuDateTime } from "../bukavu-time";

describe("generatePickupSlotCandidates (Spec §10 & §22)", () => {
  it("defines the 4 spec standard 2-hour windows", () => {
    expect(STANDARD_PICKUP_SLOT_WINDOWS).toHaveLength(4);
    expect(STANDARD_PICKUP_SLOT_WINDOWS[0]).toEqual({ startsAt: "08:00", endsAt: "10:00" });
    expect(STANDARD_PICKUP_SLOT_WINDOWS[1]).toEqual({ startsAt: "10:00", endsAt: "12:00" });
    expect(STANDARD_PICKUP_SLOT_WINDOWS[2]).toEqual({ startsAt: "14:00", endsAt: "16:00" });
    expect(STANDARD_PICKUP_SLOT_WINDOWS[3]).toEqual({ startsAt: "16:00", endsAt: "18:00" });
  });

  it("generates slots for multiple days excluding windows before referenceTime + leadTime", () => {
    // 06:00 UTC = 08:00 Bukavu time (UTC+2)
    const ref = new Date("2026-10-26T06:00:00.000Z"); // 08:00 in Bukavu
    const candidates = generatePickupSlotCandidates(ref, 2, 30);

    // Day 1 (starts at 08:00 Bukavu):
    // 08:00 slot starts now (< ref + 30m), so it is excluded
    // 10:00, 14:00, 16:00 are included (3 slots)
    // Day 2: all 4 slots included (4 slots)
    // Total = 7 slots
    expect(candidates).toHaveLength(7);

    // Verify first candidate starts at 10:00 Bukavu time (08:00 UTC)
    const firstLocal = toBukavuDateTime(candidates[0]!.start);
    expect(firstLocal.timeString).toBe("10:00");
  });

  it("produces correct 2-hour duration for all slots", () => {
    const ref = new Date("2026-10-26T00:00:00.000Z");
    const candidates = generatePickupSlotCandidates(ref, 1, 0);

    expect(candidates).toHaveLength(4);
    for (const slot of candidates) {
      const diffMs = slot.end.getTime() - slot.start.getTime();
      expect(diffMs).toBe(2 * 60 * 60 * 1000); // 2 hours
    }
  });
});
