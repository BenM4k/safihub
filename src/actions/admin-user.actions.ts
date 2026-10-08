"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/services/auth";
import { err, type Result } from "@/lib/result";
import {
  blockAdminUser,
  createAdminStaffAccount,
  mergeAdminGuestCustomer,
  resetAdminUserPassword,
  unblockAdminUser,
} from "@/services/admin";

const createStaffSchema = z
  .object({
    name: z.string().min(1, "Nom requis"),
    email: z.string().email("Email valide requis"),
    role: z.enum(["courier", "house", "admin"]),
    phone: z.string().optional().nullable(),
    password: z.string().min(8, "Mot de passe d'au moins 8 caractères"),
    houseId: z.string().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.role === "house" && (!data.houseId || !data.houseId.trim())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["houseId"],
        message: "Un pressing doit être sélectionné pour le rôle pressing",
      });
    }
  });

export async function blockUserAction(formData: FormData): Promise<Result<unknown>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const userId = String(formData.get("userId"));
  const reason = String(formData.get("reason"));

  const res = await blockAdminUser({ userId, reason });
  if (res.ok) {
    revalidatePath("/admin/users");
    revalidatePath("/admin/customers");
  }
  return res;
}

export async function unblockUserAction(formData: FormData): Promise<Result<unknown>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const userId = String(formData.get("userId"));

  const res = await unblockAdminUser(userId);
  if (res.ok) {
    revalidatePath("/admin/users");
    revalidatePath("/admin/customers");
  }
  return res;
}

export async function resetUserPasswordAction(formData: FormData): Promise<Result<unknown>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const userId = String(formData.get("userId"));
  const newPassword = String(formData.get("newPassword"));

  const res = await resetAdminUserPassword({ userId, newPassword });
  if (res.ok) {
    revalidatePath("/admin/users");
  }
  return res;
}

export async function createStaffAccountAction(formData: FormData): Promise<Result<unknown>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const parsed = createStaffSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    houseId: formData.get("houseId"),
  });

  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const res = await createAdminStaffAccount(parsed.data);
  if (res.ok) {
    revalidatePath("/admin/users");
    revalidatePath("/admin/houses");
    revalidatePath("/admin/couriers");
  }
  return res;
}

export async function mergeGuestAccountAction(formData: FormData): Promise<Result<unknown>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const guestUserId = String(formData.get("guestUserId"));
  const targetUserId = String(formData.get("targetUserId"));

  const res = await mergeAdminGuestCustomer({ guestUserId, targetUserId });
  if (res.ok) {
    revalidatePath("/admin/users");
    revalidatePath("/admin/customers");
    revalidatePath("/admin/orders");
  }
  return res;
}
