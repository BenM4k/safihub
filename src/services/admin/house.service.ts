import "server-only";
import { err, ok, type Result } from "@/lib/result";
import {
  addHouseMember,
  createHouse,
  createHouseClosure,
  createHouseExclusion,
  deleteHouseClosure,
  deleteHouseExclusion,
  getHouseById,
  getHouseClosures,
  getHouseCoverage,
  getHouseExclusions,
  getHouseHours,
  getHouses,
  getHouseStaff,
  getMasterFabrics,
  getMasterItems,
  getNeighborhoods,
  removeHouseMember,
  setHouseHours,
  updateHouse,
  upsertHouseCoverage,
  type HouseClosureRecord,
  type HouseCoverageRecord,
  type HouseExclusionRecord,
  type HouseHourRecord,
  type HouseRecord,
  type HouseStaffMemberRecord,
  type MasterFabricRecord,
  type MasterItemRecord,
  type NeighborhoodRecord,
} from "@/dal";

export interface HouseDetailFull {
  house: HouseRecord;
  hours: HouseHourRecord[];
  closures: HouseClosureRecord[];
  exclusions: HouseExclusionRecord[];
  coverage: HouseCoverageRecord[];
  staff: HouseStaffMemberRecord[];
  allNeighborhoods: NeighborhoodRecord[];
  masterItems: MasterItemRecord[];
  masterFabrics: MasterFabricRecord[];
}

export async function listAdminHouses(): Promise<Result<HouseRecord[]>> {
  try {
    const houses = await getHouses();
    return ok(houses);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to load houses");
  }
}

export async function getAdminHouseDetail(
  houseId: string
): Promise<Result<HouseDetailFull>> {
  try {
    const house = await getHouseById(houseId);
    if (!house) {
      return err("Laundry house not found");
    }

    const [
      hours,
      closures,
      exclusions,
      coverage,
      staff,
      allNeighborhoods,
      masterItems,
      masterFabrics,
    ] = await Promise.all([
      getHouseHours(houseId),
      getHouseClosures(houseId),
      getHouseExclusions(houseId),
      getHouseCoverage(houseId),
      getHouseStaff(houseId),
      getNeighborhoods(),
      getMasterItems(),
      getMasterFabrics(),
    ]);

    return ok({
      house,
      hours,
      closures,
      exclusions,
      coverage,
      staff,
      allNeighborhoods,
      masterItems,
      masterFabrics,
    });
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to load house detail");
  }
}

export async function createAdminHouse(params: {
  name: string;
  neighborhoodId: string;
  addressNote?: string | null;
  contactPhone?: string | null;
  commissionBps?: number | null;
  minimumOrderAmount?: number;
  cutoffMinutes?: number;
  turnaroundHours?: number;
  dailyCapacity?: number | null;
  maxDistanceLevel?: number | null;
  isOwnerHouse?: boolean;
}): Promise<Result<HouseRecord>> {
  try {
    if (!params.name?.trim()) {
      return err("House name is required");
    }
    if (!params.neighborhoodId) {
      return err("Neighborhood is required");
    }
    if (
      params.commissionBps !== undefined &&
      params.commissionBps !== null &&
      (params.commissionBps < 0 || params.commissionBps > 10000)
    ) {
      return err("Commission rate must be between 0 and 10000 bps (0% to 100%)");
    }

    const created = await createHouse(params);
    return ok(created);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to create house");
  }
}

export async function updateAdminHouseProfile(
  houseId: string,
  params: Partial<{
    name: string;
    neighborhoodId: string;
    addressNote: string | null;
    contactPhone: string | null;
    commissionBps: number | null;
    minimumOrderAmount: number;
    cutoffMinutes: number;
    turnaroundHours: number;
    dailyCapacity: number | null;
    maxDistanceLevel: number | null;
    isActive: boolean;
    isPaused: boolean;
    pausedUntil: Date | null;
  }>
): Promise<Result<void>> {
  try {
    await updateHouse(houseId, params);
    return ok(undefined);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to update house");
  }
}

export async function updateAdminHouseHours(
  houseId: string,
  hours: Array<{ weekday: number; opensAt: string; closesAt: string }>
): Promise<Result<void>> {
  try {
    for (const h of hours) {
      if (h.weekday < 1 || h.weekday > 7) {
        return err("Weekday must be between 1 (Monday) and 7 (Sunday)");
      }
      if (h.closesAt <= h.opensAt) {
        return err("Closing time must be after opening time");
      }
    }
    await setHouseHours(houseId, hours);
    return ok(undefined);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to set house hours");
  }
}

export async function addAdminHouseClosure(params: {
  houseId: string;
  startsOn: string;
  endsOn: string;
  reason?: string | null;
}): Promise<Result<void>> {
  try {
    if (params.endsOn < params.startsOn) {
      return err("Closure end date cannot be earlier than start date");
    }
    await createHouseClosure(params);
    return ok(undefined);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to add closure");
  }
}

export async function removeAdminHouseClosure(
  closureId: string
): Promise<Result<void>> {
  try {
    await deleteHouseClosure(closureId);
    return ok(undefined);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to delete closure");
  }
}

export async function addAdminHouseExclusion(params: {
  houseId: string;
  itemId?: string | null;
  fabricId?: string | null;
  note?: string | null;
}): Promise<Result<void>> {
  try {
    if (!params.itemId && !params.fabricId) {
      return err("Either an item or a fabric must be specified for exclusion");
    }
    await createHouseExclusion(params);
    return ok(undefined);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to add exclusion");
  }
}

export async function removeAdminHouseExclusion(
  exclusionId: string
): Promise<Result<void>> {
  try {
    await deleteHouseExclusion(exclusionId);
    return ok(undefined);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to delete exclusion");
  }
}

export async function toggleAdminHouseCoverage(params: {
  houseId: string;
  neighborhoodId: string;
  isActive: boolean;
}): Promise<Result<void>> {
  try {
    await upsertHouseCoverage(params);
    return ok(undefined);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to update house coverage");
  }
}

export async function linkAdminHouseStaffUser(params: {
  houseId: string;
  userId: string;
}): Promise<Result<void>> {
  try {
    await addHouseMember(params);
    return ok(undefined);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to link staff member");
  }
}

export async function unlinkAdminHouseStaffUser(params: {
  houseId: string;
  userId: string;
}): Promise<Result<void>> {
  try {
    await removeHouseMember(params);
    return ok(undefined);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to unlink staff member");
  }
}
