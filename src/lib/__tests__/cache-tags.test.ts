import { describe, expect, it } from "vitest";
import { CACHE_TAGS } from "../cache-tags";

describe("CACHE_TAGS", () => {
  it("defines static canonical cache tags", () => {
    expect(CACHE_TAGS.catalogItems).toBe("catalog:items");
    expect(CACHE_TAGS.coverageZones).toBe("coverage:zones");
    expect(CACHE_TAGS.housesList).toBe("houses:list");
    expect(CACHE_TAGS.adminDispatch).toBe("admin:dispatch");
    expect(CACHE_TAGS.adminCash).toBe("admin:cash");
  });

  it("formats entity-scoped cache tags accurately", () => {
    expect(CACHE_TAGS.house("house-123")).toBe("house:house-123");
    expect(CACHE_TAGS.house("pressing-lac-kivu")).toBe("house:pressing-lac-kivu");
    expect(CACHE_TAGS.order("ord-456")).toBe("order:ord-456");
    expect(CACHE_TAGS.courierMissions("cour-789")).toBe("courier:missions:cour-789");
  });
});

