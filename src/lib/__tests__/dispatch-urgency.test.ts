import { describe, it, expect } from "vitest";
import {
  HOUSE_ACCEPTANCE_SLA_MINUTES,
  HOUSE_ACCEPTANCE_WARNING_MINUTES,
  HOUSE_ACCEPTANCE_CRITICAL_MINUTES,
  formatCDF,
  formatElapsedTime,
  formatOrderRef,
  getElapsedMinutes,
  getUrgencyInfo,
} from "../dispatch-urgency";

describe("dispatch-urgency utility", () => {
  const baseTime = new Date("2026-10-14T12:00:00Z");

  it("exports SLA constants correctly", () => {
    expect(HOUSE_ACCEPTANCE_SLA_MINUTES).toBe(45);
    expect(HOUSE_ACCEPTANCE_WARNING_MINUTES).toBe(45);
    expect(HOUSE_ACCEPTANCE_CRITICAL_MINUTES).toBe(90);
  });

  it("calculates elapsed minutes correctly", () => {
    const created10MinAgo = new Date(baseTime.getTime() - 10 * 60 * 1000);
    expect(getElapsedMinutes(created10MinAgo, baseTime)).toBe(10);

    const createdZero = new Date(baseTime.getTime());
    expect(getElapsedMinutes(createdZero, baseTime)).toBe(0);

    const futureDate = new Date(baseTime.getTime() + 10 * 60 * 1000);
    expect(getElapsedMinutes(futureDate, baseTime)).toBe(0);
  });

  it("formats elapsed time in French style", () => {
    const min0 = new Date(baseTime.getTime() - 20 * 1000); // 20s
    expect(formatElapsedTime(min0, baseTime)).toBe("< 1 min");

    const min25 = new Date(baseTime.getTime() - 25 * 60 * 1000);
    expect(formatElapsedTime(min25, baseTime)).toBe("25 min");

    const min52 = new Date(baseTime.getTime() - 52 * 60 * 1000);
    expect(formatElapsedTime(min52, baseTime)).toBe("52 min");

    const hours2 = new Date(baseTime.getTime() - 120 * 60 * 1000);
    expect(formatElapsedTime(hours2, baseTime)).toBe("2 h");

    const hours2min10 = new Date(baseTime.getTime() - 130 * 60 * 1000);
    expect(formatElapsedTime(hours2min10, baseTime)).toBe("2 h 10");

    const hours2min05 = new Date(baseTime.getTime() - 125 * 60 * 1000);
    expect(formatElapsedTime(hours2min05, baseTime)).toBe("2 h 05");

    const days1hours3 = new Date(baseTime.getTime() - 27 * 60 * 60 * 1000);
    expect(formatElapsedTime(days1hours3, baseTime)).toBe("1 j 3 h");
  });

  it("classifies urgency levels and overdueMinutes correctly", () => {
    // < 45 min -> neutral
    const created30MinAgo = new Date(baseTime.getTime() - 30 * 60 * 1000);
    const u30 = getUrgencyInfo(created30MinAgo, baseTime);
    expect(u30.level).toBe("neutral");
    expect(u30.isOverdue).toBe(false);
    expect(u30.isCritical).toBe(false);
    expect(u30.overdueMinutes).toBe(0);

    // 45 - 90 min -> warning (amber)
    const created52MinAgo = new Date(baseTime.getTime() - 52 * 60 * 1000);
    const u52 = getUrgencyInfo(created52MinAgo, baseTime);
    expect(u52.level).toBe("warning");
    expect(u52.isOverdue).toBe(true);
    expect(u52.isCritical).toBe(false);
    expect(u52.overdueMinutes).toBe(7);

    // Exactly 45 min
    const created45MinAgo = new Date(baseTime.getTime() - HOUSE_ACCEPTANCE_WARNING_MINUTES * 60 * 1000);
    const u45 = getUrgencyInfo(created45MinAgo, baseTime);
    expect(u45.level).toBe("warning");
    expect(u45.isOverdue).toBe(true);
    expect(u45.overdueMinutes).toBe(0);

    // > 90 min -> critical (red)
    const created100MinAgo = new Date(baseTime.getTime() - 100 * 60 * 1000);
    const u100 = getUrgencyInfo(created100MinAgo, baseTime);
    expect(u100.level).toBe("critical");
    expect(u100.isOverdue).toBe(true);
    expect(u100.isCritical).toBe(true);
    expect(u100.overdueMinutes).toBe(55);
  });

  it("formats CDF currency in French style with space thousands separator", () => {
    expect(formatCDF(18000).replace(/\u202f|\u00a0/g, " ")).toBe("18 000 CDF");
    expect(formatCDF(0)).toBe("0 CDF");
    expect(formatCDF(2500500).replace(/\u202f|\u00a0/g, " ")).toBe("2 500 500 CDF");
  });

  it("formats short, readable order references", () => {
    expect(formatOrderRef("1042")).toBe("#1042");
    expect(formatOrderRef("ORD-1042")).toBe("#1042");
    expect(formatOrderRef("SAF-9876")).toBe("#9876");
    expect(formatOrderRef("1234567890abcdef")).toBe("#12345678");
    expect(formatOrderRef(null, "abcdef12-3456")).toBe("#abcdef12");
  });
});
