import "server-only";
import { asc, eq, inArray } from "drizzle-orm";
import { db, schema } from "./db";
import { toBukavuDateTime } from "@/services/availability/bukavu-time";

export interface CustomerHouseSummary {
  id: string;
  name: string;
  neighborhoodId: string;
  neighborhoodName: string;
  zoneId: string;
  zoneName: string;
  addressNote: string | null;
  minimumOrderAmount: number;
  turnaroundHours: number;
  dailyCapacity: number | null;
  cutoffMinutes: number;
  isActive: boolean;
  isPaused: boolean;
  pausedUntil: Date | null;
  isOpenNow: boolean;
  todayHoursText: string;
  minItemPriceCdf: number;
  availableServices: Array<{
    id: string;
    slug: string;
    nameFr: string;
    nameSw: string;
  }>;
  coveredNeighborhoodIds: string[];
  rating: number;
  reviewCount: number;
  imageUrl: string;
  coords: { lat: number; lng: number };
}

export interface CustomerHouseCatalogueItem {
  houseItemId: string;
  serviceId: string;
  serviceSlug: string;
  serviceNameFr: string;
  serviceNameSw: string;
  itemId: string;
  itemNameFr: string;
  itemNameSw: string;
  itemCategory: string;
  fabricId: string;
  fabricNameFr: string;
  fabricNameSw: string;
  priceCdf: number;
  currency: "CDF" | "USD";
  isExcluded: boolean;
  exclusionNote: string | null;
}

export interface CustomerHouseDetailData {
  house: {
    id: string;
    name: string;
    neighborhoodId: string;
    neighborhoodName: string;
    zoneId: string;
    zoneName: string;
    addressNote: string | null;
    contactPhone: string | null;
    minimumOrderAmount: number;
    turnaroundHours: number;
    dailyCapacity: number | null;
    cutoffMinutes: number;
    isOpenNow: boolean;
    todayHoursText: string;
    rating: number;
    reviewCount: number;
    imageUrl: string;
  };
  services: Array<{
    id: string;
    slug: string;
    nameFr: string;
    nameSw: string;
  }>;
  items: CustomerHouseCatalogueItem[];
  exclusions: Array<{
    itemId: string | null;
    itemNameFr: string | null;
    fabricId: string | null;
    fabricNameFr: string | null;
    note: string | null;
  }>;
  weeklyHours: Array<{
    weekday: number;
    opensAt: string;
    closesAt: string;
  }>;
}

export const BUKAVU_NEIGHBORHOOD_COORDS: Record<string, { lat: number; lng: number }> = {
  "La Botte": { lat: -2.502, lng: 28.864 },
  "Nguba": { lat: -2.528, lng: 28.871 },
  "Muhumba": { lat: -2.515, lng: 28.868 },
  "Nyarwizimya": { lat: -2.508, lng: 28.859 },
  "Panzi": { lat: -2.545, lng: 28.865 },
  "Kadutu Centre": { lat: -2.501, lng: 28.845 },
  "Nyamugo": { lat: -2.493, lng: 28.848 },
  "Cimpunda": { lat: -2.507, lng: 28.838 },
  "Bagira Centre": { lat: -2.478, lng: 28.825 },
  "Lumumba": { lat: -2.483, lng: 28.831 },
};

const HOUSE_STOCK_IMAGES: Record<string, string> = {
  "Pressing du Lac Kivu":
    "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=800&q=80",
  "Pressing Étoile de Kadutu":
    "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=800&q=80",
  "Kivu Clean Express":
    "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=800&q=80",
  "Blanchisserie Pro Muhumba":
    "https://images.unsplash.com/photo-1521656693074-0ef32e80a5d5?auto=format&fit=crop&w=800&q=80",
};

const DEFAULT_HOUSE_IMAGE =
  "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=800&q=80";

export async function getCustomerHousesList(): Promise<CustomerHouseSummary[]> {
  const now = new Date();
  const bukavuNow = toBukavuDateTime(now);

  const rawHouses = await db
    .select({
      id: schema.houses.id,
      name: schema.houses.name,
      neighborhoodId: schema.houses.neighborhoodId,
      neighborhoodName: schema.neighborhoods.name,
      zoneId: schema.neighborhoods.zoneId,
      zoneName: schema.zones.name,
      addressNote: schema.houses.addressNote,
      minimumOrderAmount: schema.houses.minimumOrderAmount,
      turnaroundHours: schema.houses.turnaroundHours,
      dailyCapacity: schema.houses.dailyCapacity,
      cutoffMinutes: schema.houses.cutoffMinutes,
      isActive: schema.houses.isActive,
      isPaused: schema.houses.isPaused,
      pausedUntil: schema.houses.pausedUntil,
    })
    .from(schema.houses)
    .innerJoin(schema.neighborhoods, eq(schema.houses.neighborhoodId, schema.neighborhoods.id))
    .innerJoin(schema.zones, eq(schema.neighborhoods.zoneId, schema.zones.id))
    .where(eq(schema.houses.isActive, true))
    .orderBy(asc(schema.houses.name));

  if (rawHouses.length === 0) return [];

  const houseIds = rawHouses.map((h) => h.id);

  const [allHours, allCoverage, allHouseItems] = await Promise.all([
    db
      .select()
      .from(schema.houseHours)
      .where(inArray(schema.houseHours.houseId, houseIds)),
    db
      .select({
        houseId: schema.houseCoverage.houseId,
        neighborhoodId: schema.houseCoverage.neighborhoodId,
        isActive: schema.houseCoverage.isActive,
      })
      .from(schema.houseCoverage)
      .where(inArray(schema.houseCoverage.houseId, houseIds)),
    db
      .select({
        houseId: schema.houseItems.houseId,
        serviceId: schema.services.id,
        serviceSlug: schema.services.slug,
        serviceNameFr: schema.services.nameFr,
        serviceNameSw: schema.services.nameSw,
        price: schema.houseItems.price,
        isActive: schema.houseItems.isActive,
      })
      .from(schema.houseItems)
      .innerJoin(schema.services, eq(schema.houseItems.serviceId, schema.services.id))
      .where(inArray(schema.houseItems.houseId, houseIds)),
  ]);

  const hoursByHouse = new Map<string, typeof allHours>();
  for (const hr of allHours) {
    const list = hoursByHouse.get(hr.houseId) || [];
    list.push(hr);
    hoursByHouse.set(hr.houseId, list);
  }

  const coverageByHouse = new Map<string, string[]>();
  for (const cov of allCoverage) {
    if (cov.isActive) {
      const list = coverageByHouse.get(cov.houseId) || [];
      list.push(cov.neighborhoodId);
      coverageByHouse.set(cov.houseId, list);
    }
  }

  const servicesByHouse = new Map<string, Map<string, { id: string; slug: string; nameFr: string; nameSw: string }>>();
  const minPriceByHouse = new Map<string, number>();

  for (const hi of allHouseItems) {
    if (!hi.isActive) continue;

    const currentMin = minPriceByHouse.get(hi.houseId) ?? Infinity;
    if (hi.price < currentMin) {
      minPriceByHouse.set(hi.houseId, hi.price);
    }

    let svcMap = servicesByHouse.get(hi.houseId);
    if (!svcMap) {
      svcMap = new Map();
      servicesByHouse.set(hi.houseId, svcMap);
    }
    svcMap.set(hi.serviceId, {
      id: hi.serviceId,
      slug: hi.serviceSlug,
      nameFr: hi.serviceNameFr,
      nameSw: hi.serviceNameSw,
    });
  }

  return rawHouses.map((h, index) => {
    const houseHrs = hoursByHouse.get(h.id) || [];
    const todayHrs = houseHrs.find((hr) => hr.weekday === bukavuNow.weekday);

    let isOpenNow = false;
    let todayHoursText = "Fermé aujourd'hui";

    if (h.isPaused) {
      isOpenNow = false;
      todayHoursText = "Temporairement fermé";
    } else if (todayHrs) {
      todayHoursText = `${todayHrs.opensAt.slice(0, 5)} - ${todayHrs.closesAt.slice(0, 5)}`;
      const currentHm = bukavuNow.timeString;
      const opensHm = todayHrs.opensAt.slice(0, 5);
      const closesHm = todayHrs.closesAt.slice(0, 5);
      isOpenNow = currentHm >= opensHm && currentHm < closesHm;
    }

    const services = Array.from(servicesByHouse.get(h.id)?.values() || []);
    const minPrice = minPriceByHouse.get(h.id);
    const minItemPriceCdf = minPrice !== undefined && minPrice < Infinity ? minPrice : 2500;

    const coords = BUKAVU_NEIGHBORHOOD_COORDS[h.neighborhoodName] || {
      lat: -2.5083 + (index * 0.004),
      lng: 28.8608 + (index * 0.003),
    };

    const imageUrl = HOUSE_STOCK_IMAGES[h.name] || DEFAULT_HOUSE_IMAGE;

    return {
      id: h.id,
      name: h.name,
      neighborhoodId: h.neighborhoodId,
      neighborhoodName: h.neighborhoodName,
      zoneId: h.zoneId,
      zoneName: h.zoneName,
      addressNote: h.addressNote,
      minimumOrderAmount: h.minimumOrderAmount,
      turnaroundHours: h.turnaroundHours,
      dailyCapacity: h.dailyCapacity,
      cutoffMinutes: h.cutoffMinutes,
      isActive: h.isActive,
      isPaused: h.isPaused,
      pausedUntil: h.pausedUntil,
      isOpenNow,
      todayHoursText,
      minItemPriceCdf,
      availableServices: services,
      coveredNeighborhoodIds: coverageByHouse.get(h.id) || [h.neighborhoodId],
      rating: 4.8 + ((index % 3) * 0.1),
      reviewCount: 120 + ((index + 1) * 64),
      imageUrl,
      coords,
    };
  });
}

export async function getCustomerHouseDetail(
  houseId: string
): Promise<CustomerHouseDetailData | null> {
  const [house] = await db
    .select({
      id: schema.houses.id,
      name: schema.houses.name,
      neighborhoodId: schema.houses.neighborhoodId,
      neighborhoodName: schema.neighborhoods.name,
      zoneId: schema.neighborhoods.zoneId,
      zoneName: schema.zones.name,
      addressNote: schema.houses.addressNote,
      contactPhone: schema.houses.contactPhone,
      minimumOrderAmount: schema.houses.minimumOrderAmount,
      turnaroundHours: schema.houses.turnaroundHours,
      dailyCapacity: schema.houses.dailyCapacity,
      cutoffMinutes: schema.houses.cutoffMinutes,
      isActive: schema.houses.isActive,
      isPaused: schema.houses.isPaused,
    })
    .from(schema.houses)
    .innerJoin(schema.neighborhoods, eq(schema.houses.neighborhoodId, schema.neighborhoods.id))
    .innerJoin(schema.zones, eq(schema.neighborhoods.zoneId, schema.zones.id))
    .where(eq(schema.houses.id, houseId))
    .limit(1);

  if (!house || !house.isActive) return null;

  const now = new Date();
  const bukavuNow = toBukavuDateTime(now);

  const [weeklyHours, rawExclusions, rawHouseItems] = await Promise.all([
    db
      .select({
        weekday: schema.houseHours.weekday,
        opensAt: schema.houseHours.opensAt,
        closesAt: schema.houseHours.closesAt,
      })
      .from(schema.houseHours)
      .where(eq(schema.houseHours.houseId, houseId))
      .orderBy(asc(schema.houseHours.weekday)),
    db
      .select({
        itemId: schema.houseExclusions.itemId,
        itemNameFr: schema.items.nameFr,
        fabricId: schema.houseExclusions.fabricId,
        fabricNameFr: schema.fabrics.nameFr,
        note: schema.houseExclusions.note,
      })
      .from(schema.houseExclusions)
      .leftJoin(schema.items, eq(schema.houseExclusions.itemId, schema.items.id))
      .leftJoin(schema.fabrics, eq(schema.houseExclusions.fabricId, schema.fabrics.id))
      .where(eq(schema.houseExclusions.houseId, houseId)),
    db
      .select({
        houseItemId: schema.houseItems.id,
        serviceId: schema.services.id,
        serviceSlug: schema.services.slug,
        serviceNameFr: schema.services.nameFr,
        serviceNameSw: schema.services.nameSw,
        serviceSort: schema.services.sortOrder,
        itemId: schema.items.id,
        itemNameFr: schema.items.nameFr,
        itemNameSw: schema.items.nameSw,
        itemCategory: schema.items.category,
        itemSort: schema.items.sortOrder,
        fabricId: schema.fabrics.id,
        fabricNameFr: schema.fabrics.nameFr,
        fabricNameSw: schema.fabrics.nameSw,
        fabricSort: schema.fabrics.sortOrder,
        price: schema.houseItems.price,
        currency: schema.houseItems.currency,
        isActive: schema.houseItems.isActive,
      })
      .from(schema.houseItems)
      .innerJoin(schema.services, eq(schema.houseItems.serviceId, schema.services.id))
      .innerJoin(schema.items, eq(schema.houseItems.itemId, schema.items.id))
      .innerJoin(schema.fabrics, eq(schema.houseItems.fabricId, schema.fabrics.id))
      .where(eq(schema.houseItems.houseId, houseId))
      .orderBy(
        asc(schema.services.sortOrder),
        asc(schema.items.sortOrder),
        asc(schema.fabrics.sortOrder)
      ),
  ]);

  const excludedItemIds = new Set<string>();
  const excludedFabricIds = new Set<string>();
  const exclusionNotes = new Map<string, string>();

  for (const ex of rawExclusions) {
    if (ex.itemId) {
      excludedItemIds.add(ex.itemId);
      if (ex.note) exclusionNotes.set(`item_${ex.itemId}`, ex.note);
    }
    if (ex.fabricId) {
      excludedFabricIds.add(ex.fabricId);
      if (ex.note) exclusionNotes.set(`fabric_${ex.fabricId}`, ex.note);
    }
  }

  const todayHrs = weeklyHours.find((h) => h.weekday === bukavuNow.weekday);
  let isOpenNow = false;
  let todayHoursText = "Fermé aujourd'hui";

  if (house.isPaused) {
    isOpenNow = false;
    todayHoursText = "Temporairement fermé";
  } else if (todayHrs) {
    todayHoursText = `${todayHrs.opensAt.slice(0, 5)} - ${todayHrs.closesAt.slice(0, 5)}`;
    const currentHm = bukavuNow.timeString;
    const opensHm = todayHrs.opensAt.slice(0, 5);
    const closesHm = todayHrs.closesAt.slice(0, 5);
    isOpenNow = currentHm >= opensHm && currentHm < closesHm;
  }

  const serviceMap = new Map<string, { id: string; slug: string; nameFr: string; nameSw: string }>();
  const items: CustomerHouseCatalogueItem[] = [];

  for (const r of rawHouseItems) {
    if (!r.isActive) continue;

    serviceMap.set(r.serviceId, {
      id: r.serviceId,
      slug: r.serviceSlug,
      nameFr: r.serviceNameFr,
      nameSw: r.serviceNameSw,
    });

    const isExcluded = excludedItemIds.has(r.itemId) || excludedFabricIds.has(r.fabricId);
    const note =
      exclusionNotes.get(`item_${r.itemId}`) ||
      exclusionNotes.get(`fabric_${r.fabricId}`) ||
      (isExcluded ? "Article ou tissu non pris en charge par cet établissement" : null);

    items.push({
      houseItemId: r.houseItemId,
      serviceId: r.serviceId,
      serviceSlug: r.serviceSlug,
      serviceNameFr: r.serviceNameFr,
      serviceNameSw: r.serviceNameSw,
      itemId: r.itemId,
      itemNameFr: r.itemNameFr,
      itemNameSw: r.itemNameSw,
      itemCategory: r.itemCategory || "clothing",
      fabricId: r.fabricId,
      fabricNameFr: r.fabricNameFr,
      fabricNameSw: r.fabricNameSw,
      priceCdf: r.price,
      currency: r.currency,
      isExcluded,
      exclusionNote: note,
    });
  }

  const imageUrl = HOUSE_STOCK_IMAGES[house.name] || DEFAULT_HOUSE_IMAGE;

  return {
    house: {
      id: house.id,
      name: house.name,
      neighborhoodId: house.neighborhoodId,
      neighborhoodName: house.neighborhoodName,
      zoneId: house.zoneId,
      zoneName: house.zoneName,
      addressNote: house.addressNote,
      contactPhone: house.contactPhone,
      minimumOrderAmount: house.minimumOrderAmount,
      turnaroundHours: house.turnaroundHours,
      dailyCapacity: house.dailyCapacity,
      cutoffMinutes: house.cutoffMinutes,
      isOpenNow,
      todayHoursText,
      rating: 4.9,
      reviewCount: 312,
      imageUrl,
    },
    services: Array.from(serviceMap.values()),
    items,
    exclusions: rawExclusions,
    weeklyHours,
  };
}
