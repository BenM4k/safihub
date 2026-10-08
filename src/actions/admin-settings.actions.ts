"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/services/auth";
import { err, type Result } from "@/lib/result";
import {
  recordAdminDailyExchangeRate,
  updateAdminPlatformSettings,
} from "@/services/admin";

const updatePlatformSettingsSchema = z.object({
  defaultCommissionBps: z.coerce.number().min(0, "Taux de commission invalide").max(10000),
  acceptanceDelayMinutes: z.coerce.number().min(15, "Délai d'acceptation min 15 minutes"),
  receptionWindowMinutes: z.coerce.number().min(15, "Fenêtre de réception min 15 minutes"),
  slotLengthMinutes: z.coerce.number().min(15, "Créneau min 15 minutes"),
  maxCoverageDistanceLevel: z.coerce.number().min(1).max(3, "Distance max 1..3"),
  defaultCashCeiling: z.coerce.number().optional().nullable(),
  defaultCourierPayPerLeg: z.coerce.number().optional().nullable(),
  firstOrderScreening: z.boolean().default(false),
  timezone: z.string().optional(),
});

const recordDailyExchangeRateSchema = z.object({
  rate: z.string().min(1, "Taux de change requis"),
  effectiveDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide (YYYY-MM-DD)"),
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
    revalidatePath("/admin/settings");
  }

  return res;
}
