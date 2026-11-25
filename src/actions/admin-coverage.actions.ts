"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/services/auth";
import { err, type Result } from "@/lib/result";
import { CACHE_TAGS } from "@/lib/cache-tags";
import {
  addAdminNeighborhood,
  addAdminZone,
  notifyAdminCoverageRequests,
  setAdminNeighborhoodStatus,
  setAdminZoneFeePair,
  updateAdminGlobalDistanceLimit,
  updateAdminHouseDistanceOverride,
} from "@/services/admin";
import { updateNeighborhoodCentroidService } from "@/services/house";
import { latLngSchema } from "@/lib/validations/location";

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
  deliveryFee: z.coerce.number().int().positive("Frais de livraison > 0"),
  distanceLevel: z.coerce.number().int().min(1, "Niveau de distance >= 1").max(3, "Niveau de distance <= 3"),
});

const globalDistanceLimitSchema = z.coerce
  .number()
  .int("La limite de distance doit être un entier")
  .min(1, "La limite de distance globale doit être comprise entre 1 et 3")
  .max(3, "La limite de distance globale doit être comprise entre 1 et 3");

const houseDistanceOverrideSchema = z.object({
  houseId: z.string().uuid("ID de pressing invalide"),
  maxDistanceLevel: z
    .number()
    .int("La dérogation doit être un entier")
    .min(1, "La dérogation de distance doit être comprise entre 1 et 3 ou vide")
    .max(3, "La dérogation de distance doit être comprise entre 1 et 3 ou vide")
    .nullable(),
});

const notifyCoverageRequestsSchema = z
  .array(z.string().trim().min(1).max(128))
  .min(1, "Aucune demande sélectionnée pour notification")
  .max(200, "Trop de demandes sélectionnées");

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
    revalidateTag(CACHE_TAGS.coverageZones, "max");
    revalidateTag(CACHE_TAGS.housesList, "max");
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
    revalidateTag(CACHE_TAGS.coverageZones, "max");
    revalidateTag(CACHE_TAGS.housesList, "max");
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
    revalidateTag(CACHE_TAGS.coverageZones, "max");
    revalidateTag(CACHE_TAGS.housesList, "max");
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
    revalidateTag(CACHE_TAGS.coverageZones, "max");
    revalidateTag(CACHE_TAGS.housesList, "max");
    revalidatePath("/admin/delivery-fees");
    revalidatePath("/admin/coverage");
  }
  return res;
}

export async function updateGlobalDistanceLimitAction(formData: FormData): Promise<Result<unknown>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const parsed = globalDistanceLimitSchema.safeParse(formData.get("maxCoverageDistanceLevel"));
  if (!parsed.success) {
    return err(
      parsed.error.issues[0]?.message ??
        "La limite de distance globale doit être comprise entre 1 et 3"
    );
  }

  const res = await updateAdminGlobalDistanceLimit(parsed.data);
  if (res.ok) {
    revalidateTag(CACHE_TAGS.coverageZones, "max");
    revalidateTag(CACHE_TAGS.housesList, "max");
    revalidatePath("/admin/coverage");
    revalidatePath("/admin/settings");
  }
  return res;
}

export async function updateHouseDistanceOverrideAction(formData: FormData): Promise<Result<unknown>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const rawOverride = formData.get("maxDistanceLevel");
  const parsed = houseDistanceOverrideSchema.safeParse({
    houseId: formData.get("houseId"),
    maxDistanceLevel:
      typeof rawOverride === "string" && rawOverride.trim() !== ""
        ? Number(rawOverride)
        : null,
  });
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const res = await updateAdminHouseDistanceOverride(parsed.data);
  if (res.ok) {
    revalidateTag(CACHE_TAGS.coverageZones, "max");
    revalidateTag(CACHE_TAGS.housesList, "max");
    revalidateTag(CACHE_TAGS.house(parsed.data.houseId), "max");
    revalidatePath("/admin/coverage");
    revalidatePath(`/admin/houses/${parsed.data.houseId}`);
  }
  return res;
}

export async function notifyCoverageRequestsAction(phonesOrIds: string[]): Promise<Result<unknown>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const parsed = notifyCoverageRequestsSchema.safeParse(phonesOrIds);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Aucune demande sélectionnée pour notification");
  }

  const res = await notifyAdminCoverageRequests(parsed.data);
  if (res.ok) {
    revalidatePath("/admin/coverage");
  }
  return res;
}

const updateNeighborhoodCentroidSchema = z.object({
  neighborhoodId: z.string().uuid("ID de quartier invalide"),
  coords: latLngSchema.nullable(),
});

export async function updateNeighborhoodCentroidAction(input: {
  neighborhoodId: string;
  coords: { lat: number; lng: number } | null;
}): Promise<Result<void>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const parsed = updateNeighborhoodCentroidSchema.safeParse(input);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Coordonnées invalides");
  }

  const res = await updateNeighborhoodCentroidService({
    neighborhoodId: parsed.data.neighborhoodId,
    coords: parsed.data.coords,
  });

  if (res.ok) {
    revalidateTag(CACHE_TAGS.coverageZones, "max");
    revalidateTag(CACHE_TAGS.housesList, "max");
    revalidatePath("/admin/neighborhoods");
    revalidatePath("/admin/coverage");
    revalidatePath("/houses");
  }

  return res;
}
