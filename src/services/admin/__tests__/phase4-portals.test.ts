import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildAdminHousesQueryString,
  HOUSES_PAGE_SIZE_OPTIONS,
  parseAdminHousesSearchParams,
} from "@/lib/admin-houses-query";
import {
  APPLICATIONS_PAGE_SIZE_OPTIONS,
  parseAdminApplicationsSearchParams,
} from "@/lib/admin-applications-query";
import {
  COURIERS_PAGE_SIZE_OPTIONS,
  parseAdminCouriersSearchParams,
} from "@/lib/admin-couriers-query";
import {
  buildAdminCustomersQueryString,
  parseAdminCustomersSearchParams,
} from "@/lib/admin-customers-query";

const dalMocks = vi.hoisted(() => ({
  listHouseApplicationsPaginated: vi.fn(),
}));

vi.mock("@/dal/house-application.dal", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/dal/house-application.dal")>();
  return {
    ...actual,
    listHouseApplicationsPaginated: dalMocks.listHouseApplicationsPaginated,
  };
});

import { listAdminPartnerApplicationsPaginated } from "../partner-application.service";

describe("Phase 4 Ops Portals Query Parsers & Services", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("parses and serializes /admin/houses query parameters cleanly", () => {
    const validUuid = "11111111-1111-4111-8111-111111111111";
    const parsed = parseAdminHousesSearchParams({
      tab: "reviews",
      search: "  Kivu ",
      status: "paused",
      neighborhoodId: validUuid,
      page: "2",
      pageSize: "25",
    });

    expect(parsed).toEqual({
      tab: "reviews",
      search: "Kivu",
      status: "paused",
      neighborhoodId: validUuid,
      page: 2,
      pageSize: 25,
    });
    expect(buildAdminHousesQueryString(parsed)).toContain("tab=reviews");
    expect(buildAdminHousesQueryString(parsed)).toContain(`neighborhoodId=${validUuid}`);

    const upperUuid = "11111111-1111-4111-8111-111111111111".toUpperCase();
    const upperParsed = parseAdminHousesSearchParams({
      neighborhoodId: upperUuid,
    });
    expect(upperParsed.neighborhoodId).toBe(upperUuid.toLowerCase());

    expect(HOUSES_PAGE_SIZE_OPTIONS).toEqual([10, 15, 25, 50]);
    expect(APPLICATIONS_PAGE_SIZE_OPTIONS).toEqual([10, 15, 25, 50]);
    expect(COURIERS_PAGE_SIZE_OPTIONS).toEqual([10, 15, 25, 50]);
    for (const size of [10, 15, 25, 50]) {
      expect(
        parseAdminHousesSearchParams({ pageSize: String(size) }).pageSize
      ).toBe(size);
      expect(
        parseAdminApplicationsSearchParams({ pageSize: String(size) }).pageSize
      ).toBe(size);
      expect(
        parseAdminCouriersSearchParams({ pageSize: String(size) }).pageSize
      ).toBe(size);
    }
    expect(parseAdminCouriersSearchParams({ pageSize: "100" }).pageSize).toBe(15);

    const fallback = parseAdminHousesSearchParams({
      tab: "other",
      status: "bogus",
      neighborhoodId: "bad-id",
      page: "-2",
      pageSize: "99",
    });
    expect(fallback).toEqual({
      tab: "all",
      search: "",
      status: "all",
      neighborhoodId: "",
      page: 1,
      pageSize: 15,
    });
    expect(buildAdminHousesQueryString(fallback)).toBe("");
  });

  it("parses /admin/applications and /admin/couriers URL params safely", () => {
    expect(
      parseAdminApplicationsSearchParams({
        status: "pending",
        search: "  Nyawera ",
        page: "3",
        pageSize: "50",
      })
    ).toEqual({
      status: "pending",
      search: "Nyawera",
      page: 3,
      pageSize: 50,
    });

    expect(
      parseAdminCouriersSearchParams({
        status: "active",
        search: "Jean",
        page: "0",
        pageSize: "10",
      })
    ).toEqual({
      status: "active",
      search: "Jean",
      page: 1,
      pageSize: 10,
    });
  });

  it("parses and serializes /admin/customers URL query state cleanly", () => {
    const parsed = parseAdminCustomersSearchParams({
      search: "Aline",
      status: "blocked",
      type: "guest",
      hasOrdered: "1",
      hideTest: "true",
      dateFrom: "2026-11-01",
      dateTo: "invalid-date",
      page: "2",
      pageSize: "50",
    });

    expect(parsed).toEqual({
      filters: {
        search: "Aline",
        status: "blocked",
        type: "guest",
        hasOrdered: true,
        hideTestAccounts: true,
        dateFrom: "2026-11-01",
        dateTo: "",
      },
      page: 2,
      pageSize: 50,
    });
    expect(buildAdminCustomersQueryString(parsed)).toContain("hasOrdered=1");
    expect(buildAdminCustomersQueryString(parsed)).toContain("hideTest=1");
    expect(buildAdminCustomersQueryString(parsed)).not.toContain("dateTo=");
  });

  it("delegates listAdminPartnerApplicationsPaginated with normalized status", async () => {
    const payload = {
      applications: [],
      totalCount: 0,
      page: 1,
      pageSize: 15,
      counts: { all: 4, pending: 2, approved: 1, rejected: 1 },
    };
    dalMocks.listHouseApplicationsPaginated.mockResolvedValue(payload);

    const res = await listAdminPartnerApplicationsPaginated({
      status: "all",
      search: "pressing",
      page: 1,
      pageSize: 15,
    });

    expect(dalMocks.listHouseApplicationsPaginated).toHaveBeenCalledWith({
      status: undefined,
      search: "pressing",
      page: 1,
      pageSize: 15,
    });
    expect(res).toEqual({ ok: true, value: payload });
  });
});
