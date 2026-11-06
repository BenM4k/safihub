import "server-only";
import {
  findHousesWithinRadius,
  getCustomerHouseDetail,
  getCustomerHousesList,
  getNeighborhoods,
  getZones,
  getZoneFees,
  type CustomerHouseDetailData,
  type CustomerHouseSummary,
  type NeighborhoodRecord,
  type ZoneFeeRecord,
  type ZoneRecord,
} from "@/dal";
import { err, ok, type Result } from "@/lib/result";

export interface CustomerHouseSearchFilter {
  query?: string;
  neighborhoodId?: string;
  serviceSlug?: string;
  openNow?: boolean;
  maxTurnaround?: number;
  maxMinOrder?: number;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  sort?: "recommended" | "turnaround" | "price" | "rating";
}

export interface CustomerHousesPageData {
  houses: CustomerHouseSummary[];
  neighborhoods: NeighborhoodRecord[];
  zones: ZoneRecord[];
  zoneFees?: ZoneFeeRecord[];
  availableServices: Array<{ slug: string; nameFr: string; nameSw: string }>;
}

export async function getCustomerHousesData(
  filter: CustomerHouseSearchFilter = {}
): Promise<CustomerHousesPageData> {
  const hasRadiusFilter =
    typeof filter.lat === "number" &&
    Number.isFinite(filter.lat) &&
    typeof filter.lng === "number" &&
    Number.isFinite(filter.lng) &&
    typeof filter.radiusKm === "number" &&
    Number.isFinite(filter.radiusKm) &&
    filter.radiusKm > 0;

  const [allHouses, neighborhoods, zones, zoneFees, nearbyRows] =
    await Promise.all([
      getCustomerHousesList(),
      getNeighborhoods(),
      getZones(),
      getZoneFees(),
      hasRadiusFilter
        ? findHousesWithinRadius({
            lat: filter.lat!,
            lng: filter.lng!,
            radiusMeters: Math.round(Math.min(filter.radiusKm!, 50) * 1000),
          })
        : Promise.resolve(null),
    ]);

  let filtered = [...allHouses];

  const nearbyDistanceMap =
    nearbyRows !== null
      ? new Map(nearbyRows.map((row) => [row.houseId, row.distanceMeters]))
      : null;

  if (nearbyDistanceMap !== null) {
    filtered = filtered.filter((h) => nearbyDistanceMap.has(h.id));
  }

  if (filter.neighborhoodId) {
    const targetNeighborhood = neighborhoods.find(
      (n) => n.id === filter.neighborhoodId
    );
    // Strict AC 18: A house that does not cover the neighborhood is never listed
    filtered = filtered.filter((h) =>
      h.coveredNeighborhoodIds.includes(filter.neighborhoodId!)
    );

    if (targetNeighborhood) {
      filtered = filtered.map((h) => {
        const fee = zoneFees.find(
          (zf) =>
            zf.customerZoneId === targetNeighborhood.zoneId &&
            zf.houseZoneId === h.zoneId
        );
        return {
          ...h,
          estimatedDeliveryFee: fee ? fee.deliveryFee : null,
        };
      });
    }
  }

  if (filter.query) {
    const q = filter.query.toLowerCase().trim();
    filtered = filtered.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        h.neighborhoodName.toLowerCase().includes(q) ||
        h.zoneName.toLowerCase().includes(q) ||
        (h.addressNote && h.addressNote.toLowerCase().includes(q))
    );
  }

  if (filter.serviceSlug) {
    filtered = filtered.filter((h) =>
      h.availableServices.some((s) => s.slug === filter.serviceSlug)
    );
  }

  if (filter.openNow) {
    filtered = filtered.filter((h) => h.isOpenNow);
  }

  if (filter.maxTurnaround) {
    filtered = filtered.filter((h) => h.turnaroundHours <= filter.maxTurnaround!);
  }

  if (filter.maxMinOrder) {
    filtered = filtered.filter((h) => h.minimumOrderAmount <= filter.maxMinOrder!);
  }

  switch (filter.sort) {
    case "turnaround":
      filtered.sort((a, b) => a.turnaroundHours - b.turnaroundHours);
      break;
    case "price":
      filtered.sort((a, b) => a.minItemPriceCdf - b.minItemPriceCdf);
      break;
    case "rating":
      filtered.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      break;
    case "recommended":
    default:
      // Prioritize open houses, then PostGIS distance when radius filter is active, then rating
      filtered.sort((a, b) => {
        if (a.isOpenNow && !b.isOpenNow) return -1;
        if (!a.isOpenNow && b.isOpenNow) return 1;
        if (nearbyDistanceMap !== null) {
          const distA = nearbyDistanceMap.get(a.id) ?? Infinity;
          const distB = nearbyDistanceMap.get(b.id) ?? Infinity;
          if (distA !== distB) return distA - distB;
        }
        return (b.rating ?? 0) - (a.rating ?? 0);
      });
      break;
  }

  const serviceMap = new Map<string, { slug: string; nameFr: string; nameSw: string }>();
  for (const h of allHouses) {
    for (const s of h.availableServices) {
      if (!serviceMap.has(s.slug)) {
        serviceMap.set(s.slug, {
          slug: s.slug,
          nameFr: s.nameFr,
          nameSw: s.nameSw,
        });
      }
    }
  }

  return {
    houses: filtered,
    neighborhoods,
    zones,
    zoneFees,
    availableServices: Array.from(serviceMap.values()),
  };
}

export async function getCustomerHouseProfile(
  houseId: string
): Promise<Result<CustomerHouseDetailData>> {
  if (!houseId) {
    return err("Identifiant d'établissement requis");
  }

  const detail = await getCustomerHouseDetail(houseId);
  if (!detail) {
    return err("Maison de pressing introuvable ou non disponible");
  }

  return ok(detail);
}
