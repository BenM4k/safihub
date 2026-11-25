"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/services/auth";
import { err, type Result } from "@/lib/result";
import { CACHE_TAGS } from "@/lib/cache-tags";
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
  name: z.string().trim().min(1, "Nom du pressing requis").max(120),
  neighborhoodId: z.string().uuid("Quartier invalide"),
  contactPhone: z.string().trim().max(32).optional().nullable(),
  addressNote: z.string().trim().max(500).optional().nullable(),
  commissionBps: z.coerce.number().int().min(0).max(10000).optional().nullable(),
  minimumOrderAmount: z.coerce.number().int().min(0).default(0),
  cutoffMinutes: z.coerce.number().int().min(0).default(120),
  turnaroundHours: z.coerce.number().int().min(1).default(48),
  dailyCapacity: z.coerce.number().int().min(1).optional().nullable(),
  maxDistanceLevel: z.coerce.number().int().min(1).max(3).optional().nullable(),
  isOwnerHouse: z.boolean().optional().default(false),
});

const updateHouseSchema = z.object({
  houseId: z.string().uuid("ID de pressing invalide"),
  name: z.string().trim().min(1, "Nom du pressing requis").max(120),
  neighborhoodId: z.string().uuid("Quartier invalide"),
  contactPhone: z.string().trim().max(32).optional().nullable(),
  addressNote: z.string().trim().max(500).optional().nullable(),
  commissionBps: z.coerce.number().int().min(0).max(10000).optional().nullable(),
  minimumOrderAmount: z.coerce.number().int().min(0).default(0),
  cutoffMinutes: z.coerce.number().int().min(0).default(120),
  turnaroundHours: z.coerce.number().int().min(1).default(48),
  dailyCapacity: z.coerce.number().int().min(1).optional().nullable(),
  maxDistanceLevel: z.coerce.number().int().min(1).max(3).optional().nullable(),
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
    revalidateTag(CACHE_TAGS.housesList, "max");
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
    revalidateTag(CACHE_TAGS.housesList, "max");
    revalidateTag(CACHE_TAGS.house(validatedHouseId), "max");
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
    revalidateTag(CACHE_TAGS.housesList, "max");
    revalidateTag(CACHE_TAGS.house(parsed.data.houseId), "max");
    revalidatePath("/admin/houses");
    revalidatePath(`/admin/houses/${parsed.data.houseId}`);
  }
  return res;
}

const houseUuidSchema = z.string().uuid("ID de pressing invalide");
const timeHmSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, "Format horaire invalide (HH:MM)");
const dateYmdSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide (AAAA-MM-JJ)");

const updateHouseHoursSchema = z.object({
  houseId: houseUuidSchema,
  hours: z
    .array(
      z.object({
        weekday: z.number().int().min(1).max(7),
        opensAt: timeHmSchema,
        closesAt: timeHmSchema,
      })
    )
    .max(21),
});

const addHouseClosureSchema = z.object({
  houseId: houseUuidSchema,
  startsOn: dateYmdSchema,
  endsOn: dateYmdSchema,
  reason: z.string().trim().max(500).nullable(),
});

const removeHouseClosureSchema = z.object({
  closureId: z.string().uuid("ID de fermeture invalide"),
  houseId: houseUuidSchema,
});

const addHouseExclusionSchema = z
  .object({
    houseId: houseUuidSchema,
    itemId: z.string().uuid("Article invalide").nullable(),
    fabricId: z.string().uuid("Tissu invalide").nullable(),
    note: z.string().trim().max(500).nullable(),
  })
  .refine((d) => Boolean(d.itemId || d.fabricId), {
    message: "Un article ou un tissu doit être sélectionné",
  });

const removeHouseExclusionSchema = z.object({
  exclusionId: z.string().uuid("ID d'exclusion invalide"),
  houseId: houseUuidSchema,
});

const toggleHouseCoverageSchema = z.object({
  houseId: houseUuidSchema,
  neighborhoodId: z.string().uuid("Quartier invalide"),
  isActive: z.boolean(),
});

const houseStaffLinkSchema = z.object({
  houseId: houseUuidSchema,
  userId: z.string().trim().min(1, "Identifiant utilisateur requis").max(128),
});

export async function updateHouseHoursAction(
  houseId: string,
  hours: Array<{ weekday: number; opensAt: string; closesAt: string }>
): Promise<Result<unknown>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const parsed = updateHouseHoursSchema.safeParse({ houseId, hours });
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Horaires invalides");
  }

  const res = await updateAdminHouseHours(parsed.data.houseId, parsed.data.hours);
  if (res.ok) {
    revalidateTag(CACHE_TAGS.housesList, "max");
    revalidateTag(CACHE_TAGS.house(parsed.data.houseId), "max");
    revalidatePath(`/admin/houses/${parsed.data.houseId}`);
  }
  return res;
}

export async function addHouseClosureAction(formData: FormData): Promise<Result<unknown>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const rawReason = formData.get("reason");
  const parsed = addHouseClosureSchema.safeParse({
    houseId: formData.get("houseId"),
    startsOn: formData.get("startsOn"),
    endsOn: formData.get("endsOn"),
    reason: typeof rawReason === "string" && rawReason.trim() ? rawReason.trim() : null,
  });
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const res = await addAdminHouseClosure(parsed.data);
  if (res.ok) {
    revalidateTag(CACHE_TAGS.housesList, "max");
    revalidateTag(CACHE_TAGS.house(parsed.data.houseId), "max");
    revalidatePath(`/admin/houses/${parsed.data.houseId}`);
  }
  return res;
}

export async function removeHouseClosureAction(
  closureId: string,
  houseId: string
): Promise<Result<unknown>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const parsed = removeHouseClosureSchema.safeParse({ closureId, houseId });
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const res = await removeAdminHouseClosure(parsed.data.closureId);
  if (res.ok) {
    revalidateTag(CACHE_TAGS.housesList, "max");
    revalidateTag(CACHE_TAGS.house(parsed.data.houseId), "max");
    revalidatePath(`/admin/houses/${parsed.data.houseId}`);
  }
  return res;
}

export async function addHouseExclusionAction(formData: FormData): Promise<Result<unknown>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const rawItemId = formData.get("itemId");
  const rawFabricId = formData.get("fabricId");
  const rawNote = formData.get("note");

  const parsed = addHouseExclusionSchema.safeParse({
    houseId: formData.get("houseId"),
    itemId: typeof rawItemId === "string" && rawItemId.trim() ? rawItemId.trim() : null,
    fabricId: typeof rawFabricId === "string" && rawFabricId.trim() ? rawFabricId.trim() : null,
    note: typeof rawNote === "string" && rawNote.trim() ? rawNote.trim() : null,
  });
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const res = await addAdminHouseExclusion(parsed.data);
  if (res.ok) {
    revalidateTag(CACHE_TAGS.housesList, "max");
    revalidateTag(CACHE_TAGS.house(parsed.data.houseId), "max");
    revalidatePath(`/admin/houses/${parsed.data.houseId}`);
  }
  return res;
}

export async function removeHouseExclusionAction(
  exclusionId: string,
  houseId: string
): Promise<Result<unknown>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const parsed = removeHouseExclusionSchema.safeParse({ exclusionId, houseId });
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const res = await removeAdminHouseExclusion(parsed.data.exclusionId);
  if (res.ok) {
    revalidateTag(CACHE_TAGS.housesList, "max");
    revalidateTag(CACHE_TAGS.house(parsed.data.houseId), "max");
    revalidatePath(`/admin/houses/${parsed.data.houseId}`);
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

  const parsed = toggleHouseCoverageSchema.safeParse({ houseId, neighborhoodId, isActive });
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const res = await toggleAdminHouseCoverage(parsed.data);
  if (res.ok) {
    revalidateTag(CACHE_TAGS.housesList, "max");
    revalidateTag(CACHE_TAGS.house(parsed.data.houseId), "max");
    revalidatePath(`/admin/houses/${parsed.data.houseId}`);
  }
  return res;
}

export async function linkHouseStaffAction(
  houseId: string,
  userId: string
): Promise<Result<unknown>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const parsed = houseStaffLinkSchema.safeParse({ houseId, userId });
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const res = await linkAdminHouseStaffUser(parsed.data);
  if (res.ok) {
    revalidatePath(`/admin/houses/${parsed.data.houseId}`);
  }
  return res;
}

export async function unlinkHouseStaffAction(
  houseId: string,
  userId: string
): Promise<Result<unknown>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const parsed = houseStaffLinkSchema.safeParse({ houseId, userId });
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const res = await unlinkAdminHouseStaffUser(parsed.data);
  if (res.ok) {
    revalidatePath(`/admin/houses/${parsed.data.houseId}`);
  }
  return res;
}
