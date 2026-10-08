import "server-only";
import { hashPassword } from "better-auth/crypto";
import { err, ok, type Result } from "@/lib/result";
import {
  createStaffUser,
  getCourierById,
  getCourierShifts,
  getCouriers,
  getCourierZones,
  getZones,
  setCourierShifts,
  setCourierZones,
  setUserPasswordCredential,
  upsertCourierProfile,
  type CourierRecord,
  type CourierShiftRecord,
  type CourierZoneRecord,
  type ZoneRecord,
} from "@/dal";

export interface CourierDetailFull {
  courier: CourierRecord;
  shifts: CourierShiftRecord[];
  zones: CourierZoneRecord[];
  allZones: ZoneRecord[];
}

export async function listAdminCouriers(): Promise<Result<CourierRecord[]>> {
  try {
    const couriers = await getCouriers();
    return ok(couriers);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to load couriers");
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

    return ok({ courier, shifts, zones, allZones });
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to load courier detail");
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
    return err(error instanceof Error ? error.message : "Failed to update courier profile");
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
    return err(error instanceof Error ? error.message : "Failed to update courier shifts");
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
    return err(error instanceof Error ? error.message : "Failed to update courier zones");
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
    await createStaffUser({
      id: courierId,
      name: params.name.trim(),
      email: params.email.trim().toLowerCase(),
      role: "courier",
      contactPhone: params.phone.trim(),
    });

    if (params.password?.trim()) {
      const hashedPassword = await hashPassword(params.password.trim());
      await setUserPasswordCredential({
        userId: courierId,
        hashedPassword,
      });
    }

    await upsertCourierProfile({
      userId: courierId,
      cashCeiling: params.cashCeiling ?? 100000,
      securityDeposit: params.securityDeposit ?? 0,
      changeFloat: params.changeFloat ?? 0,
      isActive: true,
    });

    if (params.zoneIds && params.zoneIds.length > 0) {
      await setCourierZones(courierId, params.zoneIds);
    }

    if (params.shifts && params.shifts.length > 0) {
      await setCourierShifts(courierId, params.shifts);
    }

    return ok({ courierId });
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to create courier");
  }
}
