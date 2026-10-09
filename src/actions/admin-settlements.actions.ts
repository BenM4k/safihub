"use server";

import { z } from "zod";
import { getCurrentUser } from "@/services/auth";
import { err, type Result } from "@/lib/result";
import { settleAdminHouse, settleAdminCourier } from "@/services/admin";

const settleHouseSchema = z.object({
  houseId: z.string().min(1, "Pressing requis"),
  amount: z.number().positive("Le montant du règlement doit être supérieur à zéro"),
  currency: z.enum(["CDF", "USD"]).default("CDF"),
  reference: z.string().optional(),
});

const settleCourierSchema = z.object({
  courierId: z.string().min(1, "Coursier requis"),
  amount: z.number().positive("Le montant du règlement doit être supérieur à zéro"),
  currency: z.enum(["CDF", "USD"]).default("CDF"),
  reference: z.string().optional(),
});

export async function settleHouseAction(
  data: z.infer<typeof settleHouseSchema>
): Promise<Result<{ settlementId?: string; newBalanceCDF: number }>> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return err("Non autorisé : droits administrateur requis");

  const parsed = settleHouseSchema.safeParse(data);
  if (!parsed.success) return err(parsed.error.issues[0]?.message || "Données invalides");

  return await settleAdminHouse({
    ...parsed.data,
    adminId: user.id,
  });
}

export async function settleCourierAction(
  data: z.infer<typeof settleCourierSchema>
): Promise<Result<{ settlementId?: string; newBalanceCDF: number }>> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return err("Non autorisé : droits administrateur requis");

  const parsed = settleCourierSchema.safeParse(data);
  if (!parsed.success) return err(parsed.error.issues[0]?.message || "Données invalides");

  return await settleAdminCourier({
    ...parsed.data,
    adminId: user.id,
  });
}
