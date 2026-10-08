import "server-only";
import { err, ok, type Result } from "@/lib/result";
import {
  createNeighborhood,
  createZone,
  getCoverageDemandRanked,
  getNeighborhoods,
  getZoneFees,
  getZones,
  markCoverageRequestsNotified,
  updateHouse,
  updateNeighborhood,
  updateSettings,
  upsertZoneFee,
  type CoverageDemandSummary,
  type NeighborhoodRecord,
  type ZoneFeeRecord,
  type ZoneRecord,
} from "@/dal";

export async function listAdminZones(): Promise<Result<ZoneRecord[]>> {
  try {
    const zones = await getZones();
    return ok(zones);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to load zones");
  }
}

export async function addAdminZone(params: {
  name: string;
  sortOrder?: number;
}): Promise<Result<ZoneRecord>> {
  try {
    if (!params.name || params.name.trim().length === 0) {
      return err("Zone name is required");
    }
    const created = await createZone(params);
    return ok(created);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to create zone");
  }
}

export async function listAdminNeighborhoods(): Promise<Result<NeighborhoodRecord[]>> {
  try {
    const neighborhoods = await getNeighborhoods();
    return ok(neighborhoods);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to load neighborhoods");
  }
}

export async function addAdminNeighborhood(params: {
  name: string;
  zoneId: string;
  status?: "served" | "paused" | "not_served";
  pauseReason?: string | null;
  sortOrder?: number;
}): Promise<Result<NeighborhoodRecord>> {
  try {
    if (!params.name || params.name.trim().length === 0) {
      return err("Neighborhood name is required");
    }
    if (!params.zoneId) {
      return err("Zone selection is required");
    }
    if (params.status === "paused" && (!params.pauseReason || !params.pauseReason.trim())) {
      return err("A pause reason is required when pausing a neighborhood");
    }

    const created = await createNeighborhood(params);
    return ok(created);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to create neighborhood");
  }
}

export async function setAdminNeighborhoodStatus(params: {
  id: string;
  status: "served" | "paused" | "not_served";
  pauseReason?: string | null;
  pausedUntil?: Date | null;
}): Promise<Result<void>> {
  try {
    if (params.status === "paused" && (!params.pauseReason || !params.pauseReason.trim())) {
      return err("A pause reason is mandatory when setting status to paused (AC 19)");
    }

    await updateNeighborhood(params.id, {
      status: params.status,
      pauseReason: params.status === "paused" ? params.pauseReason?.trim() : null,
      pausedUntil: params.status === "paused" ? params.pausedUntil : null,
    });
    return ok(undefined);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to update neighborhood status");
  }
}

export async function listAdminZoneFees(): Promise<Result<ZoneFeeRecord[]>> {
  try {
    const fees = await getZoneFees();
    return ok(fees);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to load zone fees");
  }
}

export async function setAdminZoneFeePair(params: {
  customerZoneId: string;
  houseZoneId: string;
  deliveryFee: number;
  distanceLevel: number;
  currency?: "CDF" | "USD";
}): Promise<Result<void>> {
  try {
    if (!params.customerZoneId || !params.houseZoneId) {
      return err("Both customer zone and laundry house zone must be selected");
    }
    if (!Number.isInteger(params.deliveryFee) || params.deliveryFee <= 0) {
      return err("Delivery fee must be positive");
    }
    if (!Number.isInteger(params.distanceLevel) || params.distanceLevel < 1 || params.distanceLevel > 3) {
      return err("Distance level must be 1, 2, or 3");
    }

    await upsertZoneFee(params);
    return ok(undefined);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to set zone fee pair");
  }
}

export async function updateAdminGlobalDistanceLimit(
  maxDistanceLevel: number
): Promise<Result<number>> {
  try {
    if (!Number.isInteger(maxDistanceLevel) || maxDistanceLevel < 1) {
      return err("Global max distance level must be at least 1");
    }
    const updated = await updateSettings({ maxCoverageDistanceLevel: maxDistanceLevel });
    return ok(updated.maxCoverageDistanceLevel);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to update global distance limit");
  }
}

export async function updateAdminHouseDistanceOverride(params: {
  houseId: string;
  maxDistanceLevel: number | null;
}): Promise<Result<void>> {
  try {
    if (
      params.maxDistanceLevel !== null &&
      (!Number.isInteger(params.maxDistanceLevel) || params.maxDistanceLevel < 1)
    ) {
      return err("House max distance level override must be null or at least 1");
    }
    await updateHouse(params.houseId, { maxDistanceLevel: params.maxDistanceLevel });
    return ok(undefined);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to update house distance override");
  }
}

export async function listAdminCoverageDemand(): Promise<Result<CoverageDemandSummary[]>> {
  try {
    const demand = await getCoverageDemandRanked();
    return ok(demand);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to load coverage demand");
  }
}

export async function notifyAdminCoverageRequests(
  phonesOrIds: string[]
): Promise<Result<void>> {
  try {
    if (phonesOrIds.length === 0) {
      return err("No requests selected for notification");
    }
    await markCoverageRequestsNotified(phonesOrIds);
    return ok(undefined);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to mark coverage requests notified");
  }
}
