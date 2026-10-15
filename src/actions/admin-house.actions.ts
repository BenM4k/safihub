"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/services/auth";
import { err, type Result } from "@/lib/result";
import { percentToBps } from "@/lib/commission-conversion";
import {
  addAdminHouseClosure,
  addAdminHouseExclusion,
  createAdminHouse,
  linkAdminHouseStaffUser,
  removeAdminHouseClosure,
  removeAdminHouseExclusion,
  toggleAdminHouseActiveStatus,
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
  maxDistanceLevel: z.coerce.number().min(1).max(3).optional().nullable(),
  isOwnerHouse: z.boolean().optional().default(false),
});

const updateHouseSchema = z.object({
  houseId: z.string().uuid("ID de pressing invalide"),
  name: z.string().min(1, "Nom du pressing requis"),
  neighborhoodId: z.string().uuid("Quartier invalide"),
  contactPhone: z.string().optional().nullable(),
  addressNote: z.string().optional().nullable(),
  commissionBps: z.coerce.number().min(0).max(10000).optional().nullable(),
  minimumOrderAmount: z.coerce.number().min(0).default(0),
  cutoffMinutes: z.coerce.number().min(0).default(120),
  turnaroundHours: z.coerce.number().min(1).default(48),
  dailyCapacity: z.coerce.number().optional().nullable(),
  maxDistanceLevel: z.coerce.number().min(1).max(3).optional().nullable(),
  isActive: z.boolean().default(true),
  isPaused: z.boolean().default(false),
});

export async function createHouseAction(formData: FormData): Promise<Result<unknown>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  let commBps: number | null = null;
  const rawCommPercent = formData.get("commissionPercent");
  if (rawCommPercent !== null && rawCommPercent !== undefined) {
    try {
      commBps = percentToBps(rawCommPercent.toString());
    } catch (e) {
      return err(e instanceof Error ? e.message : "Commission invalide");
    }
  } else {
    const rawComm = formData.get("commissionBps");
    commBps = rawComm && rawComm !== "" ? Number(rawComm) : null;
  }

  const parsed = createHouseSchema.safeParse({
    name: formData.get("name"),
    neighborhoodId: formData.get("neighborhoodId"),
    contactPhone: formData.get("contactPhone"),
    addressNote: formData.get("addressNote"),
    commissionBps: commBps,
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

  let commBps: number | null = null;
  const rawCommPercent = formData.get("commissionPercent");
  if (rawCommPercent !== null && rawCommPercent !== undefined) {
    try {
      commBps = percentToBps(rawCommPercent.toString());
    } catch (e) {
      return err(e instanceof Error ? e.message : "Commission invalide");
    }
  } else {
    const rawComm = formData.get("commissionBps");
    commBps = rawComm && rawComm !== "" ? Number(rawComm) : null;
  }

  const rawCap = formData.get("dailyCapacity");
  const rawDist = formData.get("maxDistanceLevel");

  const parsed = updateHouseSchema.safeParse({
    houseId,
    name: formData.get("name"),
    neighborhoodId: formData.get("neighborhoodId"),
    contactPhone: formData.get("contactPhone") || null,
    addressNote: formData.get("addressNote") || null,
    commissionBps: commBps,
    minimumOrderAmount: formData.get("minimumOrderAmount") || 0,
    cutoffMinutes: formData.get("cutoffMinutes") || 120,
    turnaroundHours: formData.get("turnaroundHours") || 48,
    dailyCapacity: rawCap && rawCap !== "" ? Number(rawCap) : null,
    maxDistanceLevel: rawDist && rawDist !== "" ? Number(rawDist) : null,
    isActive: formData.get("isActive") === "true",
    isPaused: formData.get("isPaused") === "true",
  });

  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const { houseId: validatedHouseId, ...updateData } = parsed.data;
  const res = await updateAdminHouseProfile(validatedHouseId, updateData);

  if (res.ok) {
    revalidatePath(`/admin/houses/${validatedHouseId}`);
    revalidatePath("/admin/houses");
  }
  return res;
}

const toggleHouseActiveStatusSchema = z
  .object({
    houseId: z.string().uuid("Identifiant du pressing invalide (UUID attendu)"),
    isActive: z.boolean(),
    reason: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.isActive) {
        return Boolean(data.reason && data.reason.trim().length > 0);
      }
      return true;
    },
    {
      message: "Un motif obligatoire est requis pour suspendre le pressing",
      path: ["reason"],
    }
  );

export async function toggleHouseActiveStatusAction(params: {
  houseId: string;
  isActive: boolean;
  reason?: string;
}): Promise<Result<unknown>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const parsed = toggleHouseActiveStatusSchema.safeParse(params);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message || "Données invalides");
  }

  const res = await toggleAdminHouseActiveStatus({
    houseId: parsed.data.houseId,
    isActive: parsed.data.isActive,
    reason: parsed.data.reason?.trim(),
    adminId: auth.value.user.id,
  });

  if (res.ok) {
    revalidatePath("/admin/houses");
    revalidatePath(`/admin/houses/${parsed.data.houseId}`);
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
