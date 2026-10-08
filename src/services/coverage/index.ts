import { err, ok, type Result } from "@/lib/result";
import type { ZonePairFee } from "@/services/pricing";

export type NeighborhoodStatus = "served" | "paused" | "not_served";

export interface NeighborhoodData {
  id: string;
  name: string;
  zoneId: string;
  status: NeighborhoodStatus;
  pauseReason?: string | null;
  pausedUntil?: Date | string | null;
}

export interface HouseData {
  id: string;
  name: string;
  neighborhoodId: string;
  isActive: boolean;
  isPaused: boolean;
  pausedUntil?: Date | string | null;
  maxDistanceLevel?: number | null; // Per-house override
}

export interface HouseCoverageRecord {
  houseId: string;
  neighborhoodId: string;
  isActive: boolean;
  pausedUntil?: Date | string | null;
}

export interface CoverageFailure {
  status?: NeighborhoodStatus;
  reason: string;
  code:
    | "NEIGHBORHOOD_NOT_SERVED"
    | "NEIGHBORHOOD_PAUSED"
    | "HOUSE_INACTIVE"
    | "HOUSE_PAUSED"
    | "HOUSE_DOES_NOT_COVER"
    | "NO_ZONE_FEE"
    | "DISTANCE_LIMIT_EXCEEDED";
}

export interface HouseCoverageMatch {
  house: HouseData;
  deliveryFee: number;
  distanceLevel: number;
  currency: "CDF" | "USD";
}

/**
 * Checks whether a customer neighborhood is active for new orders.
 * AC 17: not_served -> refused; visitor can leave coverage request.
 * AC 19: paused -> refused with pause reason; ongoing orders continue.
 */
export function checkNeighborhoodStatus(
  neighborhood: NeighborhoodData
): Result<NeighborhoodData, CoverageFailure> {
  if (neighborhood.status === "not_served") {
    return err({
      status: "not_served",
      code: "NEIGHBORHOOD_NOT_SERVED",
      reason: `Neighborhood '${neighborhood.name}' is not served yet. Leave a coverage request to be notified when service opens.`,
    });
  }

  if (neighborhood.status === "paused") {
    return err({
      status: "paused",
      code: "NEIGHBORHOOD_PAUSED",
      reason:
        neighborhood.pauseReason ??
        `Service in neighborhood '${neighborhood.name}' is temporarily paused.`,
    });
  }

  return ok(neighborhood);
}

/**
 * Checks whether a given house covers a customer's neighborhood.
 * AC 18: House does not cover neighborhood -> refused with explanation.
 * AC 21: Distance level within house or global limit.
 */
export function checkHouseCoverage(params: {
  customerNeighborhood: NeighborhoodData;
  house: HouseData;
  houseNeighborhood: NeighborhoodData;
  houseCoverage: HouseCoverageRecord[];
  zoneFees: ZonePairFee[];
  globalMaxDistanceLevel: number;
}): Result<HouseCoverageMatch, CoverageFailure> {
  const {
    customerNeighborhood,
    house,
    houseNeighborhood,
    houseCoverage,
    zoneFees,
    globalMaxDistanceLevel,
  } = params;

  // 1. Check neighborhood status
  const nStatus = checkNeighborhoodStatus(customerNeighborhood);
  if (!nStatus.ok) return nStatus;

  // 2. Check house active / paused
  if (!house.isActive) {
    return err({
      code: "HOUSE_INACTIVE",
      reason: `Laundry house '${house.name}' is currently inactive.`,
    });
  }

  if (house.isPaused) {
    return err({
      code: "HOUSE_PAUSED",
      reason: `Laundry house '${house.name}' is temporarily paused.`,
    });
  }

  // 3. Check house coverage selection
  const coverageRecord = houseCoverage.find(
    (c) => c.houseId === house.id && c.neighborhoodId === customerNeighborhood.id && c.isActive
  );

  if (!coverageRecord) {
    return err({
      code: "HOUSE_DOES_NOT_COVER",
      reason: `Laundry house '${house.name}' does not serve neighborhood '${customerNeighborhood.name}'.`,
    });
  }

  // 4. Find zone fee for pair (customer zone -> house zone)
  const zoneFee = zoneFees.find(
    (zf) =>
      zf.customerZoneId === customerNeighborhood.zoneId &&
      zf.houseZoneId === houseNeighborhood.zoneId
  );

  if (!zoneFee) {
    return err({
      code: "NO_ZONE_FEE",
      reason: `No delivery route or fee defined between customer zone and '${house.name}'.`,
    });
  }

  // 5. Distance level limit check (AC 21)
  const effectiveMaxDistance = house.maxDistanceLevel ?? globalMaxDistanceLevel;
  if (zoneFee.distanceLevel > effectiveMaxDistance) {
    return err({
      code: "DISTANCE_LIMIT_EXCEEDED",
      reason: `Distance level ${zoneFee.distanceLevel} exceeds the maximum allowed limit of ${effectiveMaxDistance} for '${house.name}'.`,
    });
  }

  return ok({
    house,
    deliveryFee: zoneFee.deliveryFee,
    distanceLevel: zoneFee.distanceLevel,
    currency: zoneFee.currency ?? "CDF",
  });
}

/**
 * Lists all active houses covering a specific customer neighborhood.
 */
export function listHousesCoveringNeighborhood(params: {
  customerNeighborhood: NeighborhoodData;
  neighborhoodsById: Map<string, NeighborhoodData>;
  houses: HouseData[];
  houseCoverage: HouseCoverageRecord[];
  zoneFees: ZonePairFee[];
  globalMaxDistanceLevel: number;
}): Result<HouseCoverageMatch[], CoverageFailure> {
  const {
    customerNeighborhood,
    neighborhoodsById,
    houses,
    houseCoverage,
    zoneFees,
    globalMaxDistanceLevel,
  } = params;

  const nStatus = checkNeighborhoodStatus(customerNeighborhood);
  if (!nStatus.ok) return nStatus;

  const eligible: HouseCoverageMatch[] = [];

  for (const house of houses) {
    const houseNeigh = neighborhoodsById.get(house.neighborhoodId);
    if (!houseNeigh) continue;

    const coverageCheck = checkHouseCoverage({
      customerNeighborhood,
      house,
      houseNeighborhood: houseNeigh,
      houseCoverage,
      zoneFees,
      globalMaxDistanceLevel,
    });

    if (coverageCheck.ok) {
      eligible.push(coverageCheck.value);
    }
  }

  return ok(eligible);
}
