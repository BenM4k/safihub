import { describe, expect, it } from "vitest";
import { escapeCsvCell } from "@/lib/csv-utils";

describe("escapeCsvCell", () => {
  it("handles null and undefined values", () => {
    expect(escapeCsvCell(null)).toBe("");
    expect(escapeCsvCell(undefined)).toBe("");
    expect(escapeCsvCell(null, { alwaysQuote: true })).toBe('""');
    expect(escapeCsvCell(undefined, { alwaysQuote: true })).toBe('""');
  });

  it("neutralizes direct spreadsheet formula prefixes", () => {
    expect(escapeCsvCell("=SUM(A1:A2)")).toBe("'=SUM(A1:A2)");
    expect(escapeCsvCell("+cmd|' /C calc'!A0")).toBe("'+cmd|' /C calc'!A0");
    expect(escapeCsvCell("-1+1")).toBe("'-1+1");
    expect(escapeCsvCell("@SUM(1+1)")).toBe("'@SUM(1+1)");
    expect(escapeCsvCell("\t=1+1")).toBe("'\t=1+1");
    expect(escapeCsvCell("\r=1+1")).toBe('"\'\r=1+1"');
  });

  it("neutralizes formula prefixes preceded by whitespace or control characters", () => {
    expect(escapeCsvCell(" =1+1")).toBe("' =1+1");
    expect(escapeCsvCell("  +2+2")).toBe("'  +2+2");
    expect(escapeCsvCell("   @evil", { alwaysQuote: true })).toBe('"\'   @evil"');
  });

  it("escapes embedded quotes and delimiters per RFC 4180", () => {
    expect(escapeCsvCell('a"b')).toBe('"a""b"');
    expect(escapeCsvCell("a,b")).toBe('"a,b"');
    expect(escapeCsvCell("a;b")).toBe('"a;b"');
    expect(escapeCsvCell("line1\nline2")).toBe('"line1\nline2"');
  });

  it("formats Date instances to ISO strings", () => {
    const d = new Date("2026-11-25T10:00:00.000Z");
    expect(escapeCsvCell(d)).toBe("2026-11-25T10:00:00.000Z");
  });
});
