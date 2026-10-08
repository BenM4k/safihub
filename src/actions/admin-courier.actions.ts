"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/services/auth";
import { err, type Result } from "@/lib/result";
import {
  createAdminCourier,
  updateAdminCourierProfile,
  updateAdminCourierShifts,
  updateAdminCourierZones,
} from "@/services/admin";

const createCourierSchema = z.object({
  name: z.string().min(1, "Nom requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(1, "Téléphone requis"),
  password: z.string().optional(),
  cashCeiling: z.coerce.number().optional().default(100000),
  securityDeposit: z.coerce.number().optional().default(0),
  changeFloat: z.coerce.number().optional().default(0),
});

export async function createCourierAction(formData: FormData): Promise<Result<unknown>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const parsed = createCourierSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    cashCeiling: formData.get("cashCeiling") || 100000,
    securityDeposit: formData.get("securityDeposit") || 0,
    changeFloat: formData.get("changeFloat") || 0,
  });

  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const res = await createAdminCourier(parsed.data);
  if (res.ok) {
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

  const res = await updateAdminCourierProfile({
    userId: courierId,
    cashCeiling: rawCeiling && rawCeiling !== "" ? Number(rawCeiling) : null,
    securityDeposit: Number(formData.get("securityDeposit") || 0),
    changeFloat: Number(formData.get("changeFloat") || 0),
    payPerLeg: formData.get("payPerLeg") ? Number(formData.get("payPerLeg")) : null,
    isActive: formData.get("isActive") === "true",
  });

  if (res.ok) {
    revalidatePath(`/admin/couriers/${courierId}`);
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

  const res = await updateAdminCourierShifts({ courierId, shifts });
  if (res.ok) {
    revalidatePath(`/admin/couriers/${courierId}`);
  }
  return res;
}

export async function updateCourierZonesAction(
  courierId: string,
  zoneIds: string[]
): Promise<Result<unknown>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const res = await updateAdminCourierZones({ courierId, zoneIds });
  if (res.ok) {
    revalidatePath(`/admin/couriers/${courierId}`);
  }
  return res;
}
