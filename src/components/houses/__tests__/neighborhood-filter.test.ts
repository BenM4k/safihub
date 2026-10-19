import { describe, it, expect } from "vitest";

describe("Neighborhood Filter URL Helpers", () => {
  function getClearedNeighborhoodUrl(currentQueryString: string): string {
    const params = new URLSearchParams(currentQueryString);
    params.delete("neighborhoodId");
    const qs = params.toString();
    return qs ? `/houses?${qs}` : "/houses";
  }

  function getSelectedNeighborhoodUrl(
    currentQueryString: string,
    neighborhoodId: string | null
  ): string {
    const params = new URLSearchParams(currentQueryString);
    if (neighborhoodId) {
      params.set("neighborhoodId", neighborhoodId);
    } else {
      params.delete("neighborhoodId");
    }
    const qs = params.toString();
    return qs ? `/houses?${qs}` : "/houses";
  }

  it("clears neighborhoodId when it is the only query parameter", () => {
    const result = getClearedNeighborhoodUrl("neighborhoodId=neigh-123");
    expect(result).toBe("/houses");
  });

  it("clears neighborhoodId while preserving other query parameters like search query", () => {
    const result = getClearedNeighborhoodUrl("neighborhoodId=neigh-123&query=pressing");
    expect(result).toBe("/houses?query=pressing");
  });

  it("updates or sets neighborhoodId correctly", () => {
    const result = getSelectedNeighborhoodUrl("query=pressing", "neigh-456");
    expect(result).toBe("/houses?query=pressing&neighborhoodId=neigh-456");
  });

  it("removes neighborhoodId when passing null", () => {
    const result = getSelectedNeighborhoodUrl("neighborhoodId=neigh-456", null);
    expect(result).toBe("/houses");
  });
});
