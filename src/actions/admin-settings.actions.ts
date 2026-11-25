"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/services/auth";
import { err, type Result } from "@/lib/result";
import { CACHE_TAGS } from "@/lib/cache-tags";
import {
  recordAdminDailyExchangeRate,
  updateAdminPlatformSettings,
} from "@/services/admin";

function isValidIanaTimeZone(tz: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

function isRealYmdCalendarDate(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const [yStr, mStr, dStr] = dateStr.split("-");
  const y = Number(yStr);
  const m = Number(mStr);
  const day = Number(dStr);
  const d = new Date(Date.UTC(y, m - 1, day));
  return (
    d.getUTCFullYear() === y &&
    d.getUTCMonth() + 1 === m &&
    d.getUTCDate() === day
  );
}

const updatePlatformSettingsSchema = z.object({
  defaultCommissionBps: z.coerce.number().int("Taux entier requis").min(0, "Taux de commission invalide").max(10000),
  acceptanceDelayMinutes: z.coerce.number().int().min(15, "Délai d'acceptation min 15 minutes").max(1440),
  receptionWindowMinutes: z.coerce.number().int().min(15, "Fenêtre de réception min 15 minutes").max(1440),
  slotLengthMinutes: z.coerce.number().int().min(15, "Créneau min 15 minutes").max(480),
  maxCoverageDistanceLevel: z.coerce.number().int().min(1).max(3, "Distance max 1..3"),
  defaultCashCeiling: z.number().int("Plafond entier requis").nonnegative("Plafond >= 0").nullable().optional(),
  defaultCourierPayPerLeg: z.number().int("Rémunération entière requise").nonnegative("Rémunération >= 0").nullable().optional(),
  firstOrderScreening: z.boolean().default(false),
  timezone: z
    .string()
    .trim()
    .min(1)
    .max(64)
    .refine(isValidIanaTimeZone, "Fuseau horaire IANA invalide")
    .optional(),
});

const recordDailyExchangeRateSchema = z.object({
  rate: z
    .string()
    .trim()
    .min(1, "Taux de change requis")
    .refine((v) => {
      const n = Number(v);
      return Number.isFinite(n) && n > 0 && n <= 1_000_000;
    }, "Taux de change invalide (0 < taux <= 1 000 000)"),
  effectiveDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide (YYYY-MM-DD)")
    .refine(isRealYmdCalendarDate, "Date calendaire invalide"),
});

export async function updatePlatformSettingsAction(formData: FormData): Promise<Result<unknown>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const rawCeiling = formData.get("defaultCashCeiling");
  const rawPay = formData.get("defaultCourierPayPerLeg");
  const tz = formData.get("timezone");

  const parsed = updatePlatformSettingsSchema.safeParse({
    defaultCommissionBps: formData.get("defaultCommissionBps"),
    acceptanceDelayMinutes: formData.get("acceptanceDelayMinutes"),
    receptionWindowMinutes: formData.get("receptionWindowMinutes"),
    slotLengthMinutes: formData.get("slotLengthMinutes"),
    maxCoverageDistanceLevel: formData.get("maxCoverageDistanceLevel"),
    defaultCashCeiling: rawCeiling && rawCeiling !== "" ? Number(rawCeiling) : null,
    defaultCourierPayPerLeg: rawPay && rawPay !== "" ? Number(rawPay) : null,
    firstOrderScreening: formData.get("firstOrderScreening") === "true",
    timezone: tz ? String(tz) : undefined,
  });

  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const res = await updateAdminPlatformSettings(parsed.data);

  if (res.ok) {
    revalidateTag(CACHE_TAGS.catalogItems, "max");
    revalidateTag(CACHE_TAGS.coverageZones, "max");
    revalidatePath("/admin/settings");
  }

  return res;
}

export async function recordDailyExchangeRateAction(formData: FormData): Promise<Result<unknown>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const parsed = recordDailyExchangeRateSchema.safeParse({
    rate: formData.get("rate"),
    effectiveDate: formData.get("effectiveDate"),
  });

  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const res = await recordAdminDailyExchangeRate({
    rate: parsed.data.rate,
    effectiveDate: parsed.data.effectiveDate,
    adminId: auth.value.user.id,
  });

  if (res.ok) {
    revalidateTag(CACHE_TAGS.catalogItems, "max");
    revalidateTag(CACHE_TAGS.coverageZones, "max");
    revalidatePath("/admin/settings");
  }

  return res;
}
