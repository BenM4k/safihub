import { describe, expect, it, vi } from "vitest";
import {
  getCustomerHousesData,
  getCustomerHouseProfile,
} from "../customer-search.service";
import type { CustomerHouseDetailData, CustomerHouseSummary } from "@/dal";

const MOCK_HOUSES: CustomerHouseSummary[] = [
  {
    id: "house-1",
    name: "Pressing du Lac Kivu",
    neighborhoodId: "n-ibanda",
    neighborhoodName: "La Botte",
    zoneId: "z-ibanda",
    zoneName: "Commune d'Ibanda",
    addressNote: "Face hôtel",
    minimumOrderAmount: 7000,
    turnaroundHours: 24,
    dailyCapacity: 25,
    cutoffMinutes: 120,
    isActive: true,
    isPaused: false,
    pausedUntil: null,
    isOpenNow: true,
    todayHoursText: "08:00 - 18:00",
    minItemPriceCdf: 3500,
    availableServices: [
      { id: "s-wash", slug: "wash", nameFr: "Lavage & Pliage", nameSw: "Kufua" },
      { id: "s-iron", slug: "iron", nameFr: "Repassage", nameSw: "Pasi" },
    ],
    coveredNeighborhoodIds: ["n-ibanda", "n-nguba"],
    rating: 4.9,
    reviewCount: 312,
    imageUrl: "https://example.com/h1.jpg",
    coords: { lat: -2.502, lng: 28.864 },
  },
  {
    id: "house-2",
    name: "Pressing Étoile de Kadutu",
    neighborhoodId: "n-kadutu",
    neighborhoodName: "Kadutu Centre",
    zoneId: "z-kadutu",
    zoneName: "Commune de Kadutu",
    addressNote: "Rond-point",
    minimumOrderAmount: 5000,
    turnaroundHours: 36,
    dailyCapacity: 20,
    cutoffMinutes: 90,
    isActive: true,
    isPaused: false,
    pausedUntil: null,
    isOpenNow: false,
    todayHoursText: "07:30 - 17:30",
    minItemPriceCdf: 2500,
    availableServices: [
      { id: "s-wash", slug: "wash", nameFr: "Lavage & Pliage", nameSw: "Kufua" },
      { id: "s-dry", slug: "dry_clean", nameFr: "Nettoyage à sec", nameSw: "Usafi kavu" },
    ],
    coveredNeighborhoodIds: ["n-kadutu"],
    rating: 4.7,
    reviewCount: 189,
    imageUrl: "https://example.com/h2.jpg",
    coords: { lat: -2.501, lng: 28.845 },
  },
];

const MOCK_NEIGHBORHOODS = [
  { id: "n-ibanda", name: "La Botte", zoneId: "z-ibanda", status: "served" as const, pauseReason: null, pausedUntil: null, sortOrder: 1 },
  { id: "n-kadutu", name: "Kadutu Centre", zoneId: "z-kadutu", status: "served" as const, pauseReason: null, pausedUntil: null, sortOrder: 2 },
];

const MOCK_ZONES = [
  { id: "z-ibanda", name: "Commune d'Ibanda", sortOrder: 1 },
  { id: "z-kadutu", name: "Commune de Kadutu", sortOrder: 2 },
];

const MOCK_HOUSE_DETAIL: CustomerHouseDetailData = {
  house: {
    id: "house-1",
    name: "Pressing du Lac Kivu",
    neighborhoodId: "n-ibanda",
    neighborhoodName: "La Botte",
    zoneId: "z-ibanda",
    zoneName: "Commune d'Ibanda",
    addressNote: "Face hôtel",
    contactPhone: "+243999123456",
    minimumOrderAmount: 7000,
    turnaroundHours: 24,
    dailyCapacity: 25,
    cutoffMinutes: 120,
    isOpenNow: true,
    todayHoursText: "08:00 - 18:00",
    rating: 4.9,
    reviewCount: 312,
    imageUrl: "https://example.com/h1.jpg",
  },
  services: [
    { id: "s-wash", slug: "wash", nameFr: "Lavage & Pliage", nameSw: "Kufua" },
  ],
  items: [
    {
      houseItemId: "hi-1",
      serviceId: "s-wash",
      serviceSlug: "wash",
      serviceNameFr: "Lavage & Pliage",
      serviceNameSw: "Kufua",
      itemId: "item-shirt",
      itemNameFr: "Chemise",
      itemNameSw: "Shati",
      itemCategory: "tops",
      fabricId: "fab-coton",
      fabricNameFr: "Coton",
      fabricNameSw: "Pamba",
      priceCdf: 3500,
      currency: "CDF",
      isExcluded: false,
      exclusionNote: null,
    },
  ],
  exclusions: [],
  weeklyHours: [{ weekday: 1, opensAt: "08:00", closesAt: "18:00" }],
};

vi.mock("@/dal", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/dal")>();
  return {
    ...actual,
    getCustomerHousesList: vi.fn(async () => MOCK_HOUSES),
    getNeighborhoods: vi.fn(async () => MOCK_NEIGHBORHOODS),
    getZones: vi.fn(async () => MOCK_ZONES),
    getCustomerHouseDetail: vi.fn(async (houseId: string) => {
      if (houseId === "house-1") return MOCK_HOUSE_DETAIL;
      return null;
    }),
  };
});

describe("Customer House Search & Service Selection (Phase 4)", () => {
  it("proposes all active houses when no filter is applied", async () => {
    const data = await getCustomerHousesData();
    expect(data.houses).toHaveLength(2);
    expect(data.houses[0].id).toBe("house-1");
    expect(data.availableServices.length).toBeGreaterThan(0);
  });

  it("filters houses by neighborhood and coverage", async () => {
    const data = await getCustomerHousesData({ neighborhoodId: "n-kadutu" });
    expect(data.houses).toHaveLength(1);
    expect(data.houses[0].name).toBe("Pressing Étoile de Kadutu");
  });

  it("filters houses by text query", async () => {
    const data = await getCustomerHousesData({ query: "lac kivu" });
    expect(data.houses).toHaveLength(1);
    expect(data.houses[0].name).toBe("Pressing du Lac Kivu");
  });

  it("filters houses by service type", async () => {
    const dryCleanData = await getCustomerHousesData({ serviceSlug: "dry_clean" });
    expect(dryCleanData.houses).toHaveLength(1);
    expect(dryCleanData.houses[0].id).toBe("house-2");
  });

  it("filters houses by open now", async () => {
    const data = await getCustomerHousesData({ openNow: true });
    expect(data.houses).toHaveLength(1);
    expect(data.houses[0].isOpenNow).toBe(true);
  });

  it("filters houses by maximum turnaround", async () => {
    const data = await getCustomerHousesData({ maxTurnaround: 24 });
    expect(data.houses).toHaveLength(1);
    expect(data.houses[0].turnaroundHours).toBe(24);
  });

  it("sorts houses by price ascending", async () => {
    const data = await getCustomerHousesData({ sort: "price" });
    expect(data.houses[0].minItemPriceCdf).toBeLessThanOrEqual(data.houses[1].minItemPriceCdf);
  });

  it("retrieves house profile and services for a selected house", async () => {
    const res = await getCustomerHouseProfile("house-1");
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.house.name).toBe("Pressing du Lac Kivu");
      expect(res.value.items).toHaveLength(1);
      expect(res.value.items[0].itemNameFr).toBe("Chemise");
    }
  });

  it("returns error for an invalid houseId", async () => {
    const res = await getCustomerHouseProfile("house-nonexistent");
    expect(res.ok).toBe(false);
  });
});
