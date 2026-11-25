"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/services/auth";
import { err, type Result } from "@/lib/result";
import { CACHE_TAGS } from "@/lib/cache-tags";
import {
  settleAdminHouse,
  settleAdminCourier,
  reverseAdminSettlement,
} from "@/services/admin";

const settleHouseSchema = z.object({
  houseId: z.string().uuid("Identifiant de pressing invalide"),
  amount: z.number().int().positive("Le montant du règlement doit être supérieur à zéro"),
  currency: z.enum(["CDF", "USD"]).default("CDF"),
  method: z.enum(["mobile_money", "bank", "cash"]).default("mobile_money"),
  reference: z.string().trim().max(150).optional(),
  period: z.string().trim().max(64).optional(),
  note: z.string().trim().max(500).optional(),
});

const settleCourierSchema = z.object({
  courierId: z.string().trim().min(1, "Coursier requis").max(128),
  amount: z.number().int().positive("Le montant du règlement doit être supérieur à zéro"),
  currency: z.enum(["CDF", "USD"]).default("CDF"),
  method: z.enum(["mobile_money", "bank", "cash"]).default("mobile_money"),
  reference: z.string().trim().max(150).optional(),
  period: z.string().trim().max(64).optional(),
  note: z.string().trim().max(500).optional(),
});

const reverseSettlementSchema = z.object({
  settlementId: z.string().uuid("Identifiant de règlement invalide"),
  reason: z.string().trim().min(3, "Un motif d'annulation est requis (au moins 3 caractères)").max(500),
});

export async function settleHouseAction(
  data: z.infer<typeof settleHouseSchema>
): Promise<Result<{ settlementId?: string; newBalanceCDF: number }>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err("Non autorisé : droits administrateur requis");

  const parsed = settleHouseSchema.safeParse(data);
  if (!parsed.success) return err(parsed.error.issues[0]?.message || "Données invalides");

  const res = await settleAdminHouse({
    ...parsed.data,
    adminId: auth.value.user.id,
  });
  if (res.ok) {
    revalidateTag(CACHE_TAGS.adminCash, "max");
    revalidateTag(CACHE_TAGS.house(parsed.data.houseId), "max");
    revalidatePath("/admin/settlements");
    revalidatePath(`/admin/houses/${parsed.data.houseId}`);
  }
  return res;
}

export async function settleCourierAction(
  data: z.infer<typeof settleCourierSchema>
): Promise<Result<{ settlementId?: string; newBalanceCDF: number }>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err("Non autorisé : droits administrateur requis");

  const parsed = settleCourierSchema.safeParse(data);
  if (!parsed.success) return err(parsed.error.issues[0]?.message || "Données invalides");

  const res = await settleAdminCourier({
    ...parsed.data,
    adminId: auth.value.user.id,
  });
  if (res.ok) {
    revalidateTag(CACHE_TAGS.adminCash, "max");
    revalidateTag(CACHE_TAGS.courierMissions(parsed.data.courierId), "max");
    revalidatePath("/admin/settlements");
    revalidatePath("/admin/couriers");
  }
  return res;
}

export async function reverseSettlementAction(
  data: z.infer<typeof reverseSettlementSchema>
): Promise<Result<{ reversalId?: string }>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err("Non autorisé : droits administrateur requis");

  const parsed = reverseSettlementSchema.safeParse(data);
  if (!parsed.success) return err(parsed.error.issues[0]?.message || "Données invalides");

  const res = await reverseAdminSettlement({
    ...parsed.data,
    adminId: auth.value.user.id,
  });
  if (res.ok) {
    revalidateTag(CACHE_TAGS.adminCash, "max");
    revalidatePath("/admin/settlements");
  }
  return res;
}
