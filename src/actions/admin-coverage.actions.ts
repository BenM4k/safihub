"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/services/auth";
import { err, type Result } from "@/lib/result";
import {
  addAdminNeighborhood,
  addAdminZone,
  notifyAdminCoverageRequests,
  setAdminNeighborhoodStatus,
  setAdminZoneFeePair,
  updateAdminGlobalDistanceLimit,
  updateAdminHouseDistanceOverride,
} from "@/services/admin";

const createZoneSchema = z.object({
  name: z.string().min(1, "Nom de la zone requis"),
  sortOrder: z.coerce.number().optional().default(0),
});

const createNeighborhoodSchema = z.object({
  name: z.string().min(1, "Nom du quartier requis"),
  zoneId: z.string().uuid("Zone invalide"),
  status: z.enum(["served", "paused", "not_served"]).default("not_served"),
  pauseReason: z.string().optional().nullable(),
  sortOrder: z.coerce.number().optional().default(0),
});

const setNeighborhoodStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["served", "paused", "not_served"]),
  pauseReason: z.string().optional().nullable(),
});

const setZoneFeePairSchema = z.object({
  customerZoneId: z.string().uuid(),
  houseZoneId: z.string().uuid(),
  deliveryFee: z.coerce.number().int().min(0, "Frais de livraison >= 0"),
  distanceLevel: z.coerce.number().int().min(1, "Niveau de distance >= 1"),
});

export async function createZoneAction(formData: FormData): Promise<Result<unknown>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const parsed = createZoneSchema.safeParse({
    name: formData.get("name"),
    sortOrder: formData.get("sortOrder"),
  });

  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const res = await addAdminZone(parsed.data);
  if (res.ok) {
    revalidatePath("/admin/neighborhoods");
    revalidatePath("/admin/coverage");
  }
  return res;
}

export async function createNeighborhoodAction(formData: FormData): Promise<Result<unknown>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const parsed = createNeighborhoodSchema.safeParse({
    name: formData.get("name"),
    zoneId: formData.get("zoneId"),
    status: formData.get("status"),
    pauseReason: formData.get("pauseReason"),
    sortOrder: formData.get("sortOrder"),
  });

  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const res = await addAdminNeighborhood(parsed.data);
  if (res.ok) {
    revalidatePath("/admin/neighborhoods");
    revalidatePath("/admin/coverage");
  }
  return res;
}

export async function setNeighborhoodStatusAction(formData: FormData): Promise<Result<unknown>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const parsed = setNeighborhoodStatusSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
    pauseReason: formData.get("pauseReason"),
  });

  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const res = await setAdminNeighborhoodStatus(parsed.data);
  if (res.ok) {
    revalidatePath("/admin/neighborhoods");
    revalidatePath("/admin/coverage");
  }
  return res;
}

export async function setZoneFeePairAction(formData: FormData): Promise<Result<unknown>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const parsed = setZoneFeePairSchema.safeParse({
    customerZoneId: formData.get("customerZoneId"),
    houseZoneId: formData.get("houseZoneId"),
    deliveryFee: formData.get("deliveryFee"),
    distanceLevel: formData.get("distanceLevel"),
  });

  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const res = await setAdminZoneFeePair(parsed.data);
  if (res.ok) {
    revalidatePath("/admin/delivery-fees");
    revalidatePath("/admin/coverage");
  }
  return res;
}

export async function updateGlobalDistanceLimitAction(formData: FormData): Promise<Result<unknown>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const limit = Number(formData.get("maxCoverageDistanceLevel"));
  if (isNaN(limit) || limit < 1) {
    return err("La limite de distance globale doit être >= 1");
  }

  const res = await updateAdminGlobalDistanceLimit(limit);
  if (res.ok) {
    revalidatePath("/admin/coverage");
    revalidatePath("/admin/settings");
  }
  return res;
}

export async function updateHouseDistanceOverrideAction(formData: FormData): Promise<Result<unknown>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const houseId = String(formData.get("houseId"));
  const rawOverride = formData.get("maxDistanceLevel");
  const maxDistanceLevel = rawOverride && rawOverride !== "" ? Number(rawOverride) : null;

  const res = await updateAdminHouseDistanceOverride({ houseId, maxDistanceLevel });
  if (res.ok) {
    revalidatePath("/admin/coverage");
    revalidatePath(`/admin/houses/${houseId}`);
  }
  return res;
}

export async function notifyCoverageRequestsAction(phones: string[]): Promise<Result<unknown>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const res = await notifyAdminCoverageRequests(phones);
  if (res.ok) {
    revalidatePath("/admin/coverage");
  }
  return res;
}
