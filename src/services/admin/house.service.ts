import "server-only";
import { err, ok, type Result } from "@/lib/result";
import {
  addHouseMember,
  createHouse,
  createHouseClosure,
  createHouseExclusion,
  deleteHouseClosure,
  deleteHouseExclusion,
  getActiveOrdersCountsByHouse,
  getAllHousesClosures,
  getAllHousesHours,
  getHouseBalancesMap,
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
  getSettings,
  listAdminPendingHouseReviews,
  removeHouseMember,
  setHouseHours,
  updateHouse,
  upsertHouseCoverage,
  type AdminPendingReviewRow,
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
import { toBukavuDateTime } from "@/services/availability/bukavu-time";
import type { AdminHouseRow, HouseOperationalStatus } from "@/components/admin/houses/types";

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

export function computeOperationalStatus(params: {
  isActive: boolean;
  isPaused: boolean;
  isClosedByException: boolean;
  isOpenNow: boolean;
}): HouseOperationalStatus {
  if (!params.isActive) {
    return "suspended";
  }
  if (params.isPaused) {
    return "paused";
  }
  if (params.isClosedByException || !params.isOpenNow) {
    return "closed_today";
  }
  return "active";
}

export async function listAdminHousesEnriched(): Promise<
  Result<{
    houses: AdminHouseRow[];
    defaultCommissionBps: number;
    totalHousesCount: number;
    activeHousesCount: number;
    totalBalanceOwedCDF: number;
  }>
> {
  try {
    const [
      houses,
      hours,
      closures,
      activeOrdersCounts,
      settlementsMap,
      settings,
    ] = await Promise.all([
      getHouses(),
      getAllHousesHours(),
      getAllHousesClosures(),
      getActiveOrdersCountsByHouse(),
      getHouseBalancesMap().catch(() => new Map<string, number>()),
      getSettings().catch(() => null),
    ]);

    const defaultCommissionBps = settings?.defaultCommissionBps ?? 2000;

    const now = new Date();
    const bukavuNow = toBukavuDateTime(now);
    const todayDateStr = bukavuNow.dateString;

    const enrichedHouses: AdminHouseRow[] = houses.map((house) => {
      const houseHours = hours.filter((hr) => hr.houseId === house.id);
      const houseClosures = closures.filter((c) => c.houseId === house.id);

      const isClosedTodayByClosure = houseClosures.some(
        (c) => todayDateStr >= c.startsOn && todayDateStr <= c.endsOn
      );

      // Collect all slots for bukavuNow.weekday
      const todaySlots = houseHours.filter((hr) => hr.weekday === bukavuNow.weekday);

      const currentHm = bukavuNow.timeString;
      const isSlotOpenNow = todaySlots.some((slot) => {
        const opensHm = slot.opensAt.slice(0, 5);
        const closesHm = slot.closesAt.slice(0, 5);
        return currentHm >= opensHm && currentHm < closesHm;
      });

      const todayHoursText =
        todaySlots.length > 0
          ? todaySlots
              .map((slot) => `${slot.opensAt.slice(0, 5)} - ${slot.closesAt.slice(0, 5)}`)
              .join(", ")
          : "—";

      const status = computeOperationalStatus({
        isActive: house.isActive,
        isPaused: house.isPaused,
        isClosedByException: isClosedTodayByClosure,
        isOpenNow: isSlotOpenNow,
      });

      const isOpenNow = status === "active";

      const activeOrdersCount = activeOrdersCounts[house.id] ?? 0;
      const balanceOwedCDF = settlementsMap.get(house.id) ?? 0;
      const imageUrl = HOUSE_STOCK_IMAGES[house.name] || DEFAULT_HOUSE_IMAGE;

      return {
        ...house,
        imageUrl,
        isOpenNow,
        todayHoursText,
        activeOrdersCount,
        balanceOwedCDF,
        status,
      };
    });

    const activeHousesCount = enrichedHouses.filter((h) => h.status === "active").length;
    const totalBalanceOwedCDF = enrichedHouses.reduce((sum, h) => sum + h.balanceOwedCDF, 0);

    return ok({
      houses: enrichedHouses,
      defaultCommissionBps,
      totalHousesCount: enrichedHouses.length,
      activeHousesCount,
      totalBalanceOwedCDF,
    });
  } catch (error) {
    return err(
      error instanceof Error ? error.message : "Failed to load enriched houses"
    );
  }
}

export async function listAdminPendingReviews(): Promise<AdminPendingReviewRow[]> {
  try {
    return await listAdminPendingHouseReviews();
  } catch {
    return [];
  }
}

export async function toggleAdminHouseActiveStatus(params: {
  houseId: string;
  isActive: boolean;
  reason?: string;
  adminId?: string;
}): Promise<Result<void>> {
  try {
    await updateHouse(params.houseId, { isActive: params.isActive });
    console.info("[Admin House Status Toggle]", {
      houseId: params.houseId,
      isActive: params.isActive,
      reason: params.reason,
      adminId: params.adminId,
      timestamp: new Date().toISOString(),
    });
    return ok(undefined);
  } catch (error) {
    return err(
      error instanceof Error ? error.message : "Failed to toggle house status"
    );
  }
}
