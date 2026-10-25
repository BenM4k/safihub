import "server-only";
import { err, ok, type Result } from "@/lib/result";
import {
  getCouriers,
  getCourierZones,
  getHousesForCourierAssignment,
  getSiblingHousesInZone,
  setCourierZones,
  type CourierZoneRecord,
  type HouseCourierAssignmentRecord,
} from "@/dal";

export type HouseServiceStatus = "full" | "partial" | "none";

export interface CourierAssignedHouse {
  id: string;
  name: string;
  slug: string;
  neighborhoodName: string;
  zoneId: string;
  zoneName: string;
  serviceStatus: HouseServiceStatus;
  coveredZoneCount: number;
  missingZoneCount: number;
}

export interface HouseWithoutCourierSummary {
  id: string;
  name: string;
  neighborhoodName: string;
  zoneName: string;
}

/**
 * Pure evaluation of courier's coverage of a house and its customer zones.
 * - full: covers house's zone AND all active covered customer zones of the house
 * - partial: covers house's zone AND some customer zones
 * - none: does not cover house's zone
 */
export function computeHouseServiceStatus(
  house: { zoneId: string; coveredZoneIds: string[] },
  courierZoneIds: Set<string>
): { status: HouseServiceStatus; missingCount: number } {
  if (!courierZoneIds.has(house.zoneId)) {
    return { status: "none", missingCount: house.coveredZoneIds.length + 1 };
  }

  if (house.coveredZoneIds.length === 0) {
    return { status: "full", missingCount: 0 };
  }

  let coveredCount = 0;
  for (const zId of house.coveredZoneIds) {
    if (courierZoneIds.has(zId)) {
      coveredCount++;
    }
  }

  if (coveredCount === house.coveredZoneIds.length) {
    return { status: "full", missingCount: 0 };
  }

  return {
    status: "partial",
    missingCount: house.coveredZoneIds.length - coveredCount,
  };
}

/**
 * Resolves all active houses and their service status for a courier.
 */
export async function getCourierAssignedHouses(
  courierId: string,
  existingZones?: CourierZoneRecord[]
): Promise<CourierAssignedHouse[]> {
  const [zones, allHouses] = await Promise.all([
    existingZones ? Promise.resolve(existingZones) : getCourierZones(courierId),
    getHousesForCourierAssignment(),
  ]);

  const courierZoneIds = new Set(zones.map((z) => z.zoneId));

  return allHouses.map((h: HouseCourierAssignmentRecord) => {
    const { status, missingCount } = computeHouseServiceStatus(h, courierZoneIds);
    return {
      id: h.id,
      name: h.name,
      slug: h.slug,
      neighborhoodName: h.neighborhoodName,
      zoneId: h.zoneId,
      zoneName: h.zoneName,
      serviceStatus: status,
      coveredZoneCount: h.coveredZoneIds.length,
      missingZoneCount: missingCount,
    };
  });
}

/**
 * Assigns one or more houses to a courier by adding the house's zone
 * AND the zones of all neighborhoods the house covers to the courier's courier_zones.
 */
export async function assignCourierToHouses(params: {
  courierId: string;
  houseIds: string[];
}): Promise<Result<{ addedZoneCount: number }>> {
  try {
    const { courierId, houseIds } = params;
    if (!courierId || !houseIds || houseIds.length === 0) {
      return err("Coursier et maisons requis");
    }

    const [currentZones, allHouses] = await Promise.all([
      getCourierZones(courierId),
      getHousesForCourierAssignment(),
    ]);

    const targetHouses = allHouses.filter((h) => houseIds.includes(h.id));
    if (targetHouses.length === 0) {
      return err("Aucune maison valide trouvée");
    }

    const updatedZoneIds = new Set(currentZones.map((z) => z.zoneId));
    let addedCount = 0;

    for (const h of targetHouses) {
      if (!updatedZoneIds.has(h.zoneId)) {
        updatedZoneIds.add(h.zoneId);
        addedCount++;
      }
      for (const covZoneId of h.coveredZoneIds) {
        if (!updatedZoneIds.has(covZoneId)) {
          updatedZoneIds.add(covZoneId);
          addedCount++;
        }
      }
    }

    await setCourierZones(courierId, Array.from(updatedZoneIds));
    return ok({ addedZoneCount: addedCount });
  } catch (error) {
    return err(error instanceof Error ? error.message : "Échec de l'assignation des maisons");
  }
}

/**
 * Unassigns a house from a courier by removing the house's zone from courier_zones.
 * Returns the removed zone and any sibling houses in the same zone that are also affected.
 */
export async function unassignCourierFromHouse(params: {
  courierId: string;
  houseId: string;
}): Promise<Result<{ removedZoneId: string; affectedSiblingHouses: { id: string; name: string }[] }>> {
  try {
    const { courierId, houseId } = params;
    const [currentZones, allHouses] = await Promise.all([
      getCourierZones(courierId),
      getHousesForCourierAssignment(),
    ]);

    const house = allHouses.find((h) => h.id === houseId);
    if (!house) {
      return err("Maison introuvable");
    }

    const affectedSiblingHouses = await getSiblingHousesInZone(house.zoneId, house.id);

    const remainingZoneIds = currentZones
      .map((z) => z.zoneId)
      .filter((zId) => zId !== house.zoneId);

    await setCourierZones(courierId, remainingZoneIds);

    return ok({
      removedZoneId: house.zoneId,
      affectedSiblingHouses,
    });
  } catch (error) {
    return err(error instanceof Error ? error.message : "Échec du retrait de la maison");
  }
}

/**
 * Returns active houses that have NO active courier on shift covering their zone.
 */
export async function getHousesWithoutCourier(): Promise<Result<HouseWithoutCourierSummary[]>> {
  try {
    const [houses, couriers] = await Promise.all([
      getHousesForCourierAssignment(),
      getCouriers(),
    ]);

    const activeCouriersWithShifts = couriers.filter(
      (c) => c.isActive && c.status === "active" && c.shiftCount > 0
    );

    const courierZonesPromises = activeCouriersWithShifts.map((c) => getCourierZones(c.userId));
    const courierZonesList = await Promise.all(courierZonesPromises);

    const servedZoneIds = new Set<string>();
    for (const zones of courierZonesList) {
      for (const z of zones) {
        servedZoneIds.add(z.zoneId);
      }
    }

    const unservedHouses: HouseWithoutCourierSummary[] = houses
      .filter((h) => !servedZoneIds.has(h.zoneId))
      .map((h) => ({
        id: h.id,
        name: h.name,
        neighborhoodName: h.neighborhoodName,
        zoneName: h.zoneName,
      }));

    return ok(unservedHouses);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Échec de la récupération des alertes");
  }
}
