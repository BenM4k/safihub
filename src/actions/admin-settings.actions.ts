"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/services/auth";
import { err, type Result } from "@/lib/result";
import {
  recordAdminDailyExchangeRate,
  updateAdminPlatformSettings,
} from "@/services/admin";

export async function updatePlatformSettingsAction(formData: FormData): Promise<Result<unknown>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const rawCeiling = formData.get("defaultCashCeiling");
  const rawPay = formData.get("defaultCourierPayPerLeg");

  const res = await updateAdminPlatformSettings({
    defaultCommissionBps: Number(formData.get("defaultCommissionBps")),
    acceptanceDelayMinutes: Number(formData.get("acceptanceDelayMinutes")),
    receptionWindowMinutes: Number(formData.get("receptionWindowMinutes")),
    slotLengthMinutes: Number(formData.get("slotLengthMinutes")),
    maxCoverageDistanceLevel: Number(formData.get("maxCoverageDistanceLevel")),
    defaultCashCeiling: rawCeiling && rawCeiling !== "" ? Number(rawCeiling) : null,
    defaultCourierPayPerLeg: rawPay && rawPay !== "" ? Number(rawPay) : null,
    firstOrderScreening: formData.get("firstOrderScreening") === "true",
    timezone: String(formData.get("timezone") || "Africa/Lubumbashi"),
  });

  if (res.ok) {
    revalidatePath("/admin/settings");
  }

  return res;
}

export async function recordDailyExchangeRateAction(formData: FormData): Promise<Result<unknown>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const rate = String(formData.get("rate"));
  const effectiveDate = String(formData.get("effectiveDate"));

  const res = await recordAdminDailyExchangeRate({
    rate,
    effectiveDate,
    adminId: auth.value.user.id,
  });

  if (res.ok) {
    revalidatePath("/admin/settings");
  }

  return res;
}
