import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("../db", () => ({
  db: {},
  schema: {},
}));

import { resolveHouseCoords } from "../house-location.dal";
import { BUKAVU_DEFAULT_CENTER } from "@/lib/validations/location";

describe("resolveHouseCoords", () => {
  it("returns exact house coordinates when present", () => {
    const updatedAt = new Date("2026-11-05T10:00:00Z");
    const res = resolveHouseCoords({
      houseLat: -2.50123456,
      houseLng: 28.86456789,
      centroidLat: -2.502,
      centroidLng: 28.864,
      locationUpdatedAt: updatedAt,
    });

    expect(res).toEqual({
      lat: -2.501235,
      lng: 28.864568,
      isApproximate: false,
      locationUpdatedAt: updatedAt,
    });
  });

  it("falls back to neighborhood centroid when house location is null", () => {
    const res = resolveHouseCoords({
      houseLat: null,
      houseLng: null,
      centroidLat: -2.528,
      centroidLng: 28.871,
    });

    expect(res).toEqual({
      lat: -2.528,
      lng: 28.871,
      isApproximate: true,
      locationUpdatedAt: null,
    });
  });

  it("falls back to Bukavu default center when both house and centroid are null", () => {
    const res = resolveHouseCoords({
      houseLat: null,
      houseLng: null,
      centroidLat: null,
      centroidLng: null,
    });

    expect(res).toEqual({
      lat: BUKAVU_DEFAULT_CENTER.lat,
      lng: BUKAVU_DEFAULT_CENTER.lng,
      isApproximate: true,
      locationUpdatedAt: null,
    });
  });
});
