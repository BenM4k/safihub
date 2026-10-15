"use server";

import { z } from "zod";
import { getCurrentUser } from "@/services/auth";
import { err, type Result } from "@/lib/result";
import {
  settleAdminHouse,
  settleAdminCourier,
  reverseAdminSettlement,
} from "@/services/admin";

const settleHouseSchema = z.object({
  houseId: z.string().min(1, "Pressing requis"),
  amount: z.number().positive("Le montant du règlement doit être supérieur à zéro"),
  currency: z.enum(["CDF", "USD"]).default("CDF"),
  method: z.enum(["mobile_money", "bank", "cash"]).default("mobile_money"),
  reference: z.string().optional(),
  period: z.string().optional(),
  note: z.string().optional(),
});

const settleCourierSchema = z.object({
  courierId: z.string().min(1, "Coursier requis"),
  amount: z.number().positive("Le montant du règlement doit être supérieur à zéro"),
  currency: z.enum(["CDF", "USD"]).default("CDF"),
  method: z.enum(["mobile_money", "bank", "cash"]).default("mobile_money"),
  reference: z.string().optional(),
  period: z.string().optional(),
  note: z.string().optional(),
});

const reverseSettlementSchema = z.object({
  settlementId: z.string().min(1, "Identifiant de règlement requis"),
  reason: z.string().min(3, "Un motif d'annulation est requis (au moins 3 caractères)"),
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

export async function reverseSettlementAction(
  data: z.infer<typeof reverseSettlementSchema>
): Promise<Result<{ reversalId?: string }>> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return err("Non autorisé : droits administrateur requis");

  const parsed = reverseSettlementSchema.safeParse(data);
  if (!parsed.success) return err(parsed.error.issues[0]?.message || "Données invalides");

  return await reverseAdminSettlement({
    ...parsed.data,
    adminId: user.id,
  });
}
