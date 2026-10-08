"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/services/auth";
import { err, type Result } from "@/lib/result";
import {
  addAdminHouseClosure,
  addAdminHouseExclusion,
  createAdminHouse,
  linkAdminHouseStaffUser,
  removeAdminHouseClosure,
  removeAdminHouseExclusion,
  toggleAdminHouseCoverage,
  unlinkAdminHouseStaffUser,
  updateAdminHouseHours,
  updateAdminHouseProfile,
} from "@/services/admin";

const createHouseSchema = z.object({
  name: z.string().min(1, "Nom du pressing requis"),
  neighborhoodId: z.string().uuid("Quartier invalide"),
  contactPhone: z.string().optional().nullable(),
  addressNote: z.string().optional().nullable(),
  commissionBps: z.coerce.number().min(0).max(10000).optional().nullable(),
  minimumOrderAmount: z.coerce.number().min(0).default(0),
  cutoffMinutes: z.coerce.number().min(0).default(120),
  turnaroundHours: z.coerce.number().min(1).default(48),
  dailyCapacity: z.coerce.number().optional().nullable(),
  maxDistanceLevel: z.coerce.number().optional().nullable(),
  isOwnerHouse: z.boolean().optional().default(false),
});

export async function createHouseAction(formData: FormData): Promise<Result<unknown>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const rawComm = formData.get("commissionBps");
  const parsed = createHouseSchema.safeParse({
    name: formData.get("name"),
    neighborhoodId: formData.get("neighborhoodId"),
    contactPhone: formData.get("contactPhone"),
    addressNote: formData.get("addressNote"),
    commissionBps: rawComm && rawComm !== "" ? Number(rawComm) : null,
    minimumOrderAmount: formData.get("minimumOrderAmount") || 0,
    cutoffMinutes: formData.get("cutoffMinutes") || 120,
    turnaroundHours: formData.get("turnaroundHours") || 48,
    dailyCapacity: formData.get("dailyCapacity") ? Number(formData.get("dailyCapacity")) : null,
    maxDistanceLevel: formData.get("maxDistanceLevel") ? Number(formData.get("maxDistanceLevel")) : null,
    isOwnerHouse: formData.get("isOwnerHouse") === "true",
  });

  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const res = await createAdminHouse(parsed.data);
  if (res.ok) {
    revalidatePath("/admin/houses");
  }
  return res;
}

export async function updateHouseProfileAction(
  houseId: string,
  formData: FormData
): Promise<Result<unknown>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const rawComm = formData.get("commissionBps");
  const rawCap = formData.get("dailyCapacity");
  const rawDist = formData.get("maxDistanceLevel");

  const res = await updateAdminHouseProfile(houseId, {
    name: String(formData.get("name")),
    neighborhoodId: String(formData.get("neighborhoodId")),
    contactPhone: formData.get("contactPhone") ? String(formData.get("contactPhone")) : null,
    addressNote: formData.get("addressNote") ? String(formData.get("addressNote")) : null,
    commissionBps: rawComm && rawComm !== "" ? Number(rawComm) : null,
    minimumOrderAmount: Number(formData.get("minimumOrderAmount") || 0),
    cutoffMinutes: Number(formData.get("cutoffMinutes") || 120),
    turnaroundHours: Number(formData.get("turnaroundHours") || 48),
    dailyCapacity: rawCap && rawCap !== "" ? Number(rawCap) : null,
    maxDistanceLevel: rawDist && rawDist !== "" ? Number(rawDist) : null,
    isActive: formData.get("isActive") === "true",
    isPaused: formData.get("isPaused") === "true",
  });

  if (res.ok) {
    revalidatePath(`/admin/houses/${houseId}`);
    revalidatePath("/admin/houses");
  }
  return res;
}

export async function updateHouseHoursAction(
  houseId: string,
  hours: Array<{ weekday: number; opensAt: string; closesAt: string }>
): Promise<Result<unknown>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const res = await updateAdminHouseHours(houseId, hours);
  if (res.ok) {
    revalidatePath(`/admin/houses/${houseId}`);
  }
  return res;
}

export async function addHouseClosureAction(formData: FormData): Promise<Result<unknown>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const houseId = String(formData.get("houseId"));
  const startsOn = String(formData.get("startsOn"));
  const endsOn = String(formData.get("endsOn"));
  const reason = formData.get("reason") ? String(formData.get("reason")) : null;

  const res = await addAdminHouseClosure({ houseId, startsOn, endsOn, reason });
  if (res.ok) {
    revalidatePath(`/admin/houses/${houseId}`);
  }
  return res;
}

export async function removeHouseClosureAction(
  closureId: string,
  houseId: string
): Promise<Result<unknown>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const res = await removeAdminHouseClosure(closureId);
  if (res.ok) {
    revalidatePath(`/admin/houses/${houseId}`);
  }
  return res;
}

export async function addHouseExclusionAction(formData: FormData): Promise<Result<unknown>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const houseId = String(formData.get("houseId"));
  const itemId = formData.get("itemId") ? String(formData.get("itemId")) : null;
  const fabricId = formData.get("fabricId") ? String(formData.get("fabricId")) : null;
  const note = formData.get("note") ? String(formData.get("note")) : null;

  const res = await addAdminHouseExclusion({ houseId, itemId, fabricId, note });
  if (res.ok) {
    revalidatePath(`/admin/houses/${houseId}`);
  }
  return res;
}

export async function removeHouseExclusionAction(
  exclusionId: string,
  houseId: string
): Promise<Result<unknown>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const res = await removeAdminHouseExclusion(exclusionId);
  if (res.ok) {
    revalidatePath(`/admin/houses/${houseId}`);
  }
  return res;
}

export async function toggleHouseCoverageAction(
  houseId: string,
  neighborhoodId: string,
  isActive: boolean
): Promise<Result<unknown>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const res = await toggleAdminHouseCoverage({ houseId, neighborhoodId, isActive });
  if (res.ok) {
    revalidatePath(`/admin/houses/${houseId}`);
  }
  return res;
}

export async function linkHouseStaffAction(
  houseId: string,
  userId: string
): Promise<Result<unknown>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const res = await linkAdminHouseStaffUser({ houseId, userId });
  if (res.ok) {
    revalidatePath(`/admin/houses/${houseId}`);
  }
  return res;
}

export async function unlinkHouseStaffAction(
  houseId: string,
  userId: string
): Promise<Result<unknown>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const res = await unlinkAdminHouseStaffUser({ houseId, userId });
  if (res.ok) {
    revalidatePath(`/admin/houses/${houseId}`);
  }
  return res;
}
