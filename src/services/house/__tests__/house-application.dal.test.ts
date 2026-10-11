import { describe, expect, it } from "vitest";
import {
  createHouseApplication,
  getHouseApplicationById,
  isHouseSlugAvailable,
  listHouseApplications,
  updateHouseApplication,
} from "@/dal/house-application.dal";
import { getHouseBySlug } from "@/dal/house.dal";

describe("House Application DAL & Slug Queries", () => {
  it("exports required functions", () => {
    expect(createHouseApplication).toBeDefined();
    expect(getHouseApplicationById).toBeDefined();
    expect(listHouseApplications).toBeDefined();
    expect(updateHouseApplication).toBeDefined();
    expect(isHouseSlugAvailable).toBeDefined();
    expect(getHouseBySlug).toBeDefined();
  });
});
