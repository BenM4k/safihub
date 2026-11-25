"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/services/auth";
import { err, type Result } from "@/lib/result";
import { CACHE_TAGS } from "@/lib/cache-tags";
import {
  createAdminCourier,
  updateAdminCourierProfile,
  updateAdminCourierShifts,
  updateAdminCourierZones,
  assignCourierToHouses,
  unassignCourierFromHouse,
} from "@/services/admin";

const courierIdSchema = z
  .string()
  .trim()
  .min(1, "Identifiant coursier requis")
  .max(128, "Identifiant coursier invalide");

const timeHmSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, "Format horaire invalide (HH:MM)");

const createCourierSchema = z.object({
  name: z.string().trim().min(1, "Nom requis").max(120),
  email: z.string().trim().email("Email invalide").max(255),
  phone: z.string().trim().min(6, "Téléphone requis").max(32),
  password: z
    .string()
    .trim()
    .min(8, "Le mot de passe doit comporter au moins 8 caractères")
    .max(128)
    .optional(),
  cashCeiling: z.coerce.number().int().nonnegative().optional().default(140000),
  securityDeposit: z.coerce.number().int().nonnegative().optional().default(0),
  changeFloat: z.coerce.number().int().nonnegative().optional().default(0),
});

const updateCourierProfileSchema = z.object({
  courierId: courierIdSchema,
  cashCeiling: z.number().int("Le plafond doit être un entier").nonnegative("Plafond >= 0").nullable(),
  securityDeposit: z.number().int("La caution doit être un entier").nonnegative("Caution >= 0"),
  changeFloat: z.number().int("Le fond de caisse doit être un entier").nonnegative("Fond de caisse >= 0"),
  payPerLeg: z.number().int("La rémunération doit être un entier").nonnegative("Rémunération >= 0").nullable(),
  isActive: z.boolean(),
});

const updateCourierShiftsSchema = z.object({
  courierId: courierIdSchema,
  shifts: z
    .array(
      z.object({
        weekday: z.number().int().min(1).max(7),
        startsAt: timeHmSchema,
        endsAt: timeHmSchema,
      })
    )
    .max(21),
});

const updateCourierZonesSchema = z.object({
  courierId: courierIdSchema,
  zoneIds: z.array(z.string().uuid("Zone invalide")).max(50),
});

const assignHousesSchema = z.object({
  courierId: courierIdSchema,
  houseIds: z.array(z.string().uuid("Pressing invalide")).min(1, "Au moins un pressing requis").max(100),
});

const unassignHouseSchema = z.object({
  courierId: courierIdSchema,
  houseId: z.string().uuid("Pressing invalide"),
});

export async function createCourierAction(formData: FormData): Promise<Result<unknown>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const rawPassword = formData.get("password");
  const password = typeof rawPassword === "string" && rawPassword.trim() ? rawPassword.trim() : undefined;

  const parsed = createCourierSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password,
    cashCeiling: formData.get("cashCeiling") || 140000,
    securityDeposit: formData.get("securityDeposit") || 0,
    changeFloat: formData.get("changeFloat") || 0,
  });

  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const res = await createAdminCourier(parsed.data);
  if (res.ok) {
    revalidateTag(CACHE_TAGS.coverageZones, "max");
    revalidateTag(CACHE_TAGS.housesList, "max");
    revalidatePath("/admin/couriers");
  }
  return res;
}

export async function updateCourierProfileAction(
  courierId: string,
  formData: FormData
): Promise<Result<unknown>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const rawCeiling = formData.get("cashCeiling");
  const rawPay = formData.get("payPerLeg");

  const parsed = updateCourierProfileSchema.safeParse({
    courierId,
    cashCeiling:
      typeof rawCeiling === "string" && rawCeiling.trim() !== "" ? Number(rawCeiling) : null,
    securityDeposit: Number(formData.get("securityDeposit") || 0),
    changeFloat: Number(formData.get("changeFloat") || 0),
    payPerLeg: typeof rawPay === "string" && rawPay.trim() !== "" ? Number(rawPay) : null,
    isActive: formData.get("isActive") === "true",
  });
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const res = await updateAdminCourierProfile({
    userId: parsed.data.courierId,
    cashCeiling: parsed.data.cashCeiling,
    securityDeposit: parsed.data.securityDeposit,
    changeFloat: parsed.data.changeFloat,
    payPerLeg: parsed.data.payPerLeg,
    isActive: parsed.data.isActive,
  });

  if (res.ok) {
    revalidateTag(CACHE_TAGS.coverageZones, "max");
    revalidateTag(CACHE_TAGS.housesList, "max");
    revalidateTag(CACHE_TAGS.courierMissions(parsed.data.courierId), "max");
    revalidatePath(`/admin/couriers/${parsed.data.courierId}`);
    revalidatePath("/admin/couriers");
  }
  return res;
}

export async function updateCourierShiftsAction(
  courierId: string,
  shifts: Array<{ weekday: number; startsAt: string; endsAt: string }>
): Promise<Result<unknown>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const parsed = updateCourierShiftsSchema.safeParse({ courierId, shifts });
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Créneaux invalides");
  }

  const res = await updateAdminCourierShifts(parsed.data);
  if (res.ok) {
    revalidateTag(CACHE_TAGS.coverageZones, "max");
    revalidateTag(CACHE_TAGS.housesList, "max");
    revalidateTag(CACHE_TAGS.courierMissions(parsed.data.courierId), "max");
    revalidatePath(`/admin/couriers/${parsed.data.courierId}`);
  }
  return res;
}

export async function updateCourierZonesAction(
  courierId: string,
  zoneIds: string[]
): Promise<Result<unknown>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const parsed = updateCourierZonesSchema.safeParse({ courierId, zoneIds });
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Zones invalides");
  }

  const res = await updateAdminCourierZones(parsed.data);
  if (res.ok) {
    revalidateTag(CACHE_TAGS.coverageZones, "max");
    revalidateTag(CACHE_TAGS.housesList, "max");
    revalidateTag(CACHE_TAGS.courierMissions(parsed.data.courierId), "max");
    revalidatePath(`/admin/couriers/${parsed.data.courierId}`);
  }
  return res;
}

export async function assignCourierHousesAction(
  courierId: string,
  houseIds: string[]
): Promise<Result<{ addedZoneCount: number }>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const parsed = assignHousesSchema.safeParse({ courierId, houseIds });
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const res = await assignCourierToHouses(parsed.data);
  if (res.ok) {
    revalidateTag(CACHE_TAGS.coverageZones, "max");
    revalidateTag(CACHE_TAGS.housesList, "max");
    revalidateTag(CACHE_TAGS.courierMissions(parsed.data.courierId), "max");
    revalidatePath(`/admin/couriers/${parsed.data.courierId}`);
    revalidatePath("/admin/couriers");
  }
  return res;
}

export async function unassignCourierHouseAction(
  courierId: string,
  houseId: string
): Promise<Result<{ removedZoneId: string; affectedSiblingHouses: { id: string; name: string }[] }>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const parsed = unassignHouseSchema.safeParse({ courierId, houseId });
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const res = await unassignCourierFromHouse(parsed.data);
  if (res.ok) {
    revalidateTag(CACHE_TAGS.coverageZones, "max");
    revalidateTag(CACHE_TAGS.housesList, "max");
    revalidateTag(CACHE_TAGS.courierMissions(parsed.data.courierId), "max");
    revalidatePath(`/admin/couriers/${parsed.data.courierId}`);
    revalidatePath("/admin/couriers");
  }
  return res;
}
