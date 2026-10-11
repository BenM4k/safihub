import { describe, expect, it } from "vitest";
import { generateUniqueSlug, slugify } from "../slug";

describe("slugify", () => {
  it("converts simple names to kebab-case", () => {
    expect(slugify("Pressing du Lac")).toBe("pressing-du-lac");
  });

  it("removes French accents and diacritics", () => {
    expect(slugify("Pressing Étoile de Kadutu")).toBe("pressing-etoile-de-kadutu");
    expect(slugify("L'Élégance à Bukavu")).toBe("lelegance-a-bukavu");
  });

  it("handles symbols, extra spaces and multiple hyphens", () => {
    expect(slugify("  Pressing & Blanchisserie --- Sainte-Marie !  ")).toBe(
      "pressing-blanchisserie-sainte-marie"
    );
  });

  it("handles empty or blank strings", () => {
    expect(slugify("")).toBe("");
    expect(slugify("   ")).toBe("");
  });
});

describe("generateUniqueSlug", () => {
  it("returns base slug when there is no collision", async () => {
    const slug = await generateUniqueSlug("Pressing du Lac", ["other-slug"]);
    expect(slug).toBe("pressing-du-lac");
  });

  it("appends counter suffix when collision exists in array", async () => {
    const existing = ["pressing-du-lac", "pressing-du-lac-2"];
    const slug = await generateUniqueSlug("Pressing du Lac", existing);
    expect(slug).toBe("pressing-du-lac-3");
  });

  it("works with a Set of existing slugs", async () => {
    const existing = new Set(["pressing-du-lac"]);
    const slug = await generateUniqueSlug("Pressing du Lac", existing);
    expect(slug).toBe("pressing-du-lac-2");
  });

  it("works with an async collision callback", async () => {
    const taken = new Set(["pressing-du-lac"]);
    const slug = await generateUniqueSlug("Pressing du Lac", async (s) =>
      taken.has(s)
    );
    expect(slug).toBe("pressing-du-lac-2");
  });

  it("falls back to default base when name produces empty slug", async () => {
    const slug = await generateUniqueSlug("$$$", []);
    expect(slug).toBe("house");
  });
});
