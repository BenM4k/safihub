import { describe, expect, it } from "vitest";
import {
  BUKAVU_BOUNDS,
  BUKAVU_DEFAULT_CENTER,
  isWithinBukavuBounds,
  latLngSchema,
} from "../location";

describe("location validation (Bukavu bounds)", () => {
  it("accepts coordinates inside Bukavu", () => {
    expect(latLngSchema.safeParse({ lat: -2.502, lng: 28.864 }).success).toBe(
      true
    );
    expect(isWithinBukavuBounds(BUKAVU_DEFAULT_CENTER)).toBe(true);
    expect(
      isWithinBukavuBounds({
        lat: BUKAVU_BOUNDS.minLat,
        lng: BUKAVU_BOUNDS.maxLng,
      })
    ).toBe(true);
  });

  it("rejects coordinates outside Bukavu bounding box", () => {
    expect(latLngSchema.safeParse({ lat: -1.68, lng: 29.22 }).success).toBe(
      false
    ); // Goma
    expect(latLngSchema.safeParse({ lat: -2.5, lng: 28.0 }).success).toBe(
      false
    );
    expect(latLngSchema.safeParse({ lat: -3.0, lng: 28.86 }).success).toBe(
      false
    );
    expect(latLngSchema.safeParse({ lat: NaN, lng: 28.86 }).success).toBe(
      false
    );
  });
});
