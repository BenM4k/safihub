import { describe, it, expect } from "vitest";
import { resolveGarmentKind } from "../resolve-garment-kind";

describe("resolveGarmentKind", () => {
  it("maps every seeded Bukavu catalogue item to a distinct, accurate icon kind", () => {
    expect(resolveGarmentKind("Chemise classique", "tops")).toBe("shirt");
    expect(resolveGarmentKind("Pantalon de costume / Jean", "bottoms")).toBe("trousers");
    expect(resolveGarmentKind("Costume 2 pièces complet", "suits")).toBe("suit");
    expect(resolveGarmentKind("Robe de soirée / Cérémonie", "dresses")).toBe("dress");
    expect(resolveGarmentKind("Parure de lit 2 places", "bedding")).toBe("bedding");
    expect(resolveGarmentKind("Couette & Duvet grand format", "bedding")).toBe("duvet");
    expect(resolveGarmentKind("Baskets & Sneakers", "shoes")).toBe("shoes");
  });

  it("matches French, Swahili, and English keywords regardless of accents or casing", () => {
    expect(resolveGarmentKind("T-shirt en coton", "tops")).toBe("tshirt");
    expect(resolveGarmentKind("Pull / Débardeur", "tops")).toBe("tshirt");
    expect(resolveGarmentKind("Shati ya kawaida", null)).toBe("shirt");
    expect(resolveGarmentKind("Suruali ya suti", null)).toBe("trousers");
    expect(resolveGarmentKind("Gauni ya harusi", null)).toBe("dress");
    expect(resolveGarmentKind("Blanketi nzito", null)).toBe("duvet");
    expect(resolveGarmentKind("Viatu vya michezo", null)).toBe("shoes");
    expect(resolveGarmentKind("Veste blazer", null)).toBe("suit");
  });

  it("falls back to category when item name has no known keyword", () => {
    expect(resolveGarmentKind("Article spécial", "tops")).toBe("shirt");
    expect(resolveGarmentKind("Article spécial", "bottoms")).toBe("trousers");
    expect(resolveGarmentKind("Article spécial", "suits")).toBe("suit");
    expect(resolveGarmentKind("Article spécial", "dresses")).toBe("dress");
    expect(resolveGarmentKind("Article spécial", "bedding")).toBe("bedding");
    expect(resolveGarmentKind("Article spécial", "shoes")).toBe("shoes");
  });

  it("returns 'other' when neither name nor category matches", () => {
    expect(resolveGarmentKind("Objet inconnu", "other")).toBe("other");
    expect(resolveGarmentKind(null, undefined)).toBe("other");
  });
});
