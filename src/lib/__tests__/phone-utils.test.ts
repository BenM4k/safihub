import { describe, expect, it } from "vitest";
import {
  formatDrcPhone,
  isValidDrcPhone,
  normalizeDrcPhone,
} from "../phone-utils";

describe("phone-utils", () => {
  it("normalizes phone numbers to +243 format", () => {
    expect(normalizeDrcPhone("090 000 0001")).toBe("+243900000001");
    expect(normalizeDrcPhone("900000001")).toBe("+243900000001");
    expect(normalizeDrcPhone("+243 90 000 0001")).toBe("+243900000001");
    expect(normalizeDrcPhone("0812345678")).toBe("+243812345678");
  });

  it("formats phone numbers as +243 XX XXX XXXX", () => {
    expect(formatDrcPhone("+243900000001")).toBe("+243 90 000 0001");
    expect(formatDrcPhone("0900000001")).toBe("+243 90 000 0001");
    expect(formatDrcPhone("991234567")).toBe("+243 99 123 4567");
    expect(formatDrcPhone(null)).toBe("—");
    expect(formatDrcPhone("")).toBe("—");
  });

  it("validates DRC mobile numbers", () => {
    expect(isValidDrcPhone("+243900000001")).toBe(true);
    expect(isValidDrcPhone("090 000 0001")).toBe(true);
    expect(isValidDrcPhone("081 234 5678")).toBe(true);
    expect(isValidDrcPhone("123456")).toBe(false);
    expect(isValidDrcPhone("0712345678")).toBe(false); // 7 is not mobile network
    expect(isValidDrcPhone("")).toBe(false);
    expect(isValidDrcPhone(null)).toBe(false);
  });
});
