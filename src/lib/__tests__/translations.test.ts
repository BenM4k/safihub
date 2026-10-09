import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Translations Key Parity & Completeness", () => {
  const enPath = path.resolve(process.cwd(), "messages/en.json");
  const frPath = path.resolve(process.cwd(), "messages/fr.json");
  const swPath = path.resolve(process.cwd(), "messages/sw.json");

  const en = JSON.parse(fs.readFileSync(enPath, "utf-8"));
  const fr = JSON.parse(fs.readFileSync(frPath, "utf-8"));
  const sw = JSON.parse(fs.readFileSync(swPath, "utf-8"));

  function getLeafKeys(obj: Record<string, unknown>, prefix = ""): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(obj)) {
      const fullPath = prefix ? `${prefix}.${key}` : key;
      if (value && typeof value === "object" && !Array.isArray(value)) {
        Object.assign(result, getLeafKeys(value as Record<string, unknown>, fullPath));
      } else {
        result[fullPath] = String(value);
      }
    }
    return result;
  }

  const enFlat = getLeafKeys(en);
  const frFlat = getLeafKeys(fr);
  const swFlat = getLeafKeys(sw);

  it("should have exact key count across EN, FR, and SW", () => {
    const enCount = Object.keys(enFlat).length;
    const frCount = Object.keys(frFlat).length;
    const swCount = Object.keys(swFlat).length;

    expect(frCount).toBe(enCount);
    expect(swCount).toBe(enCount);
  });

  it("should have zero missing keys in French (FR)", () => {
    const missingInFr = Object.keys(enFlat).filter((key) => !(key in frFlat));
    expect(missingInFr).toEqual([]);
  });

  it("should have zero missing keys in Swahili (SW)", () => {
    const missingInSw = Object.keys(enFlat).filter((key) => !(key in swFlat));
    expect(missingInSw).toEqual([]);
  });

  it("should not contain empty translation values in any language", () => {
    const emptyEn = Object.entries(enFlat).filter(([, v]) => v.trim() === "");
    const emptyFr = Object.entries(frFlat).filter(([, v]) => v.trim() === "");
    const emptySw = Object.entries(swFlat).filter(([, v]) => v.trim() === "");

    expect(emptyEn).toEqual([]);
    expect(emptyFr).toEqual([]);
    expect(emptySw).toEqual([]);
  });

  it("should preserve interpolation variables {var} across all languages", () => {
    const varRegex = /\{([a-zA-Z0-9_]+)\}/g;

    for (const [key, enVal] of Object.entries(enFlat)) {
      const enVars = (enVal.match(varRegex) || []).sort();
      if (enVars.length > 0) {
        const frVal = frFlat[key] || "";
        const swVal = swFlat[key] || "";
        const frVars = (frVal.match(varRegex) || []).sort();
        const swVars = (swVal.match(varRegex) || []).sort();

        expect(frVars, `Variable mismatch in FR for key "${key}"`).toEqual(enVars);
        expect(swVars, `Variable mismatch in SW for key "${key}"`).toEqual(enVars);
      }
    }
  });
});
