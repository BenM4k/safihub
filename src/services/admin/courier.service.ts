import "server-only";
import { hashPassword } from "better-auth/crypto";
import { err, ok, type Result } from "@/lib/result";
import { sanitizeServiceError } from "@/lib/service-errors";
import {
  createCourierAccountTransaction,
  getCourierById,
  getCourierShifts,
  getCouriers,
  getCourierZones,
  getZones,
  setCourierShifts,
  setCourierZones,
  upsertCourierProfile,
  type CourierRecord,
  type CourierShiftRecord,
  type CourierZoneRecord,
  type ZoneRecord,
} from "@/dal";

import {
  getCourierAssignedHouses,
  type CourierAssignedHouse,
} from "./courier-house-assignment.service";

export interface CourierDetailFull {
  courier: CourierRecord;
  shifts: CourierShiftRecord[];
  zones: CourierZoneRecord[];
  allZones: ZoneRecord[];
  houses: CourierAssignedHouse[];
}

export async function listAdminCouriers(): Promise<Result<CourierRecord[]>> {
  try {
    const couriers = await getCouriers();
    return ok(couriers);
  } catch (error) {
    return err(sanitizeServiceError(error, "Failed to load couriers", "listAdminCouriers"));
  }
}

export async function getAdminCourierDetail(
  courierId: string
): Promise<Result<CourierDetailFull>> {
  try {
    const courier = await getCourierById(courierId);
    if (!courier) {
      return err("Courier not found");
    }

    const [shifts, zones, allZones] = await Promise.all([
      getCourierShifts(courierId),
      getCourierZones(courierId),
      getZones(),
    ]);

    const houses = await getCourierAssignedHouses(courierId, zones);

    return ok({ courier, shifts, zones, allZones, houses });
  } catch (error) {
    return err(sanitizeServiceError(error, "Failed to load courier detail", "getAdminCourierDetail"));
  }
}

export async function updateAdminCourierProfile(params: {
  userId: string;
  cashCeiling?: number | null;
  securityDeposit?: number;
  changeFloat?: number;
  payPerLeg?: number | null;
  isActive?: boolean;
}): Promise<Result<void>> {
  try {
    if (params.cashCeiling !== undefined && params.cashCeiling !== null && params.cashCeiling < 0) {
      return err("Cash ceiling cannot be negative");
    }
    if (params.securityDeposit !== undefined && params.securityDeposit < 0) {
      return err("Security deposit cannot be negative");
    }
    if (params.changeFloat !== undefined && params.changeFloat < 0) {
      return err("Change float cannot be negative");
    }

    await upsertCourierProfile(params);
    return ok(undefined);
  } catch (error) {
    return err(sanitizeServiceError(error, "Failed to update courier profile", "updateAdminCourierProfile"));
  }
}

export async function updateAdminCourierShifts(params: {
  courierId: string;
  shifts: Array<{ weekday: number; startsAt: string; endsAt: string }>;
}): Promise<Result<void>> {
  try {
    for (const s of params.shifts) {
      if (s.weekday < 1 || s.weekday > 7) {
        return err("Shift weekday must be between 1 and 7");
      }
      if (s.endsAt <= s.startsAt) {
        return err("Shift end time must be after start time");
      }
    }
    await setCourierShifts(params.courierId, params.shifts);
    return ok(undefined);
  } catch (error) {
    return err(sanitizeServiceError(error, "Failed to update courier shifts", "updateAdminCourierShifts"));
  }
}

export async function updateAdminCourierZones(params: {
  courierId: string;
  zoneIds: string[];
}): Promise<Result<void>> {
  try {
    await setCourierZones(params.courierId, params.zoneIds);
    return ok(undefined);
  } catch (error) {
    return err(sanitizeServiceError(error, "Failed to update courier zones", "updateAdminCourierZones"));
  }
}

export async function createAdminCourier(params: {
  name: string;
  email: string;
  phone: string;
  password?: string;
  cashCeiling?: number;
  securityDeposit?: number;
  changeFloat?: number;
  zoneIds?: string[];
  shifts?: Array<{ weekday: number; startsAt: string; endsAt: string }>;
}): Promise<Result<{ courierId: string }>> {
  try {
    if (!params.name?.trim() || !params.email?.trim() || !params.phone?.trim()) {
      return err("Name, email, and phone are all required for courier creation");
    }

    const courierId = `usr_courier_${crypto.randomUUID().slice(0, 8)}`;
    const hashedPassword = params.password?.trim()
      ? await hashPassword(params.password.trim())
      : undefined;

    await createCourierAccountTransaction({
      user: {
        id: courierId,
        name: params.name.trim(),
        email: params.email.trim().toLowerCase(),
        contactPhone: params.phone.trim(),
      },
      hashedPassword,
      cashCeiling: params.cashCeiling,
      securityDeposit: params.securityDeposit,
      changeFloat: params.changeFloat,
      zoneIds: params.zoneIds,
      shifts: params.shifts,
    });

    return ok({ courierId });
  } catch (error) {
    return err(sanitizeServiceError(error, "Failed to create courier", "createAdminCourier"));
  }
}
