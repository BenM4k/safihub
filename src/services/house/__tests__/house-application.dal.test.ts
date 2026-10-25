import { describe, expect, it } from "vitest";
import {
  createHouseApplication,
  getHouseApplicationById,
  getPendingApplicationByEmail,
  isHouseSlugAvailable,
  listHouseApplications,
  updateHouseApplication,
  approveHouseApplicationTransaction,
} from "@/dal/house-application.dal";
import { getHouseBySlug } from "@/dal/house.dal";

describe("House Application DAL & Slug Queries", () => {
  it("exports required functions", () => {
    expect(createHouseApplication).toBeDefined();
    expect(getHouseApplicationById).toBeDefined();
    expect(getPendingApplicationByEmail).toBeDefined();
    expect(listHouseApplications).toBeDefined();
    expect(updateHouseApplication).toBeDefined();
    expect(isHouseSlugAvailable).toBeDefined();
    expect(getHouseBySlug).toBeDefined();
    expect(approveHouseApplicationTransaction).toBeDefined();
  });
});
