import { describe, it, expect } from "vitest";
import { buildHousesFilterUrl } from "../use-houses-filter-state";

describe("Houses URL Filter Helpers", () => {
  it("clears neighborhoodId when it is the only query parameter", () => {
    const result = buildHousesFilterUrl("neighborhoodId=neigh-123", {
      neighborhoodId: null,
    });
    expect(result).toBe("/houses");
  });

  it("clears neighborhoodId while preserving other query parameters like search query", () => {
    const result = buildHousesFilterUrl(
      "neighborhoodId=neigh-123&query=pressing",
      { neighborhoodId: null }
    );
    expect(result).toBe("/houses?query=pressing");
  });

  it("updates or sets neighborhoodId correctly", () => {
    const result = buildHousesFilterUrl("query=pressing", {
      neighborhoodId: "neigh-456",
    });
    expect(result).toBe("/houses?query=pressing&neighborhoodId=neigh-456");
  });

  it("sets and switches PostGIS radius filter (5 km, 10 km, 15 km) and clears it cleanly", () => {
    const with5Km = buildHousesFilterUrl("", {
      lat: -2.502,
      lng: 28.864,
      radiusKm: 5,
    });
    expect(with5Km).toBe("/houses?lat=-2.502&lng=28.864&radiusKm=5");

    const with15Km = buildHousesFilterUrl("lat=-2.502&lng=28.864&radiusKm=5", {
      radiusKm: 15,
    });
    expect(with15Km).toBe("/houses?lat=-2.502&lng=28.864&radiusKm=15");

    const clearedRadius = buildHousesFilterUrl(
      "lat=-2.502&lng=28.864&radiusKm=15&service=wash",
      {
        lat: null,
        lng: null,
        radiusKm: null,
      }
    );
    expect(clearedRadius).toBe("/houses?service=wash");
  });
});
