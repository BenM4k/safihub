import { describe, expect, it } from "vitest";
import { filterShiftsForZonePair } from "../courier-eligibility";
import type { CourierShiftSegment } from "../slots";

describe("filterShiftsForZonePair (AC 20 & Spec §11.3)", () => {
  const shifts: CourierShiftSegment[] = [
    { courierId: "cour_1", weekday: 1, startsAt: "08:00", endsAt: "13:00" },
    { courierId: "cour_2", weekday: 1, startsAt: "08:00", endsAt: "13:00" },
    { courierId: "cour_3", weekday: 1, startsAt: "13:00", endsAt: "18:00" },
  ];

  it("returns all shifts if courierZones is undefined (backward compatibility)", () => {
    const result = filterShiftsForZonePair({
      shifts,
      customerZoneId: "zone_ibanda",
      houseZoneId: "zone_kadutu",
    });
    expect(result).toHaveLength(3);
  });

  it("filters out couriers who cover only the customer zone or only the house zone", () => {
    const courierZones = [
      // cour_1 covers both Ibanda & Kadutu
      { courierId: "cour_1", zoneId: "zone_ibanda" },
      { courierId: "cour_1", zoneId: "zone_kadutu" },
      // cour_2 covers only Ibanda
      { courierId: "cour_2", zoneId: "zone_ibanda" },
      // cour_3 covers only Kadutu
      { courierId: "cour_3", zoneId: "zone_kadutu" },
    ];

    const result = filterShiftsForZonePair({
      shifts,
      courierZones,
      customerZoneId: "zone_ibanda",
      houseZoneId: "zone_kadutu",
    });

    expect(result).toHaveLength(1);
    expect(result[0]!.courierId).toBe("cour_1");
  });

  it("includes couriers when customer and house are in the same zone if courier covers that zone", () => {
    const courierZones = [
      { courierId: "cour_1", zoneId: "zone_ibanda" },
      { courierId: "cour_2", zoneId: "zone_kadutu" },
    ];

    const result = filterShiftsForZonePair({
      shifts,
      courierZones,
      customerZoneId: "zone_ibanda",
      houseZoneId: "zone_ibanda",
    });

    expect(result).toHaveLength(1);
    expect(result[0]!.courierId).toBe("cour_1");
  });

  it("returns empty array if no courier covers both zones", () => {
    const courierZones = [
      { courierId: "cour_1", zoneId: "zone_bagira" },
      { courierId: "cour_2", zoneId: "zone_kadutu" },
    ];

    const result = filterShiftsForZonePair({
      shifts,
      courierZones,
      customerZoneId: "zone_ibanda",
      houseZoneId: "zone_kadutu",
    });

    expect(result).toHaveLength(0);
  });
});
