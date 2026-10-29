"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/services/auth";
import { err, type Result } from "@/lib/result";
import {
  confirmAdminDailyReconciliation,
  holdAdminCourierDeposit,
  releaseAdminCourierDeposit,
  issueAdminCourierFloat,
  returnAdminCourierFloat,
  reverseAdminLedgerEntry,
  reverseAdminCourierReconciliation,
} from "@/services/admin";

const confirmReconciliationSchema = z.object({
  courierId: z.string().min(1, "Coursier requis"),
  businessDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date requise (AAAA-MM-JJ)"),
  currency: z.enum(["CDF", "USD"]).default("CDF"),
  expectedAmount: z.number().nonnegative(),
  receivedAmount: z.number().nonnegative("Montant reçu invalide"),
  note: z.string().optional(),
  deductFromDeposit: z.boolean().optional(),
});

const depositFloatSchema = z.object({
  courierId: z.string().min(1, "Coursier requis"),
  amount: z.number().positive("Le montant doit être supérieur à zéro"),
  currency: z.enum(["CDF", "USD"]).default("CDF"),
  note: z.string().optional(),
});

const reverseLedgerSchema = z.object({
  entryId: z.string().min(1, "Écriture requise"),
  reason: z.string().min(3, "Un motif d'annulation est requis"),
});

export async function confirmDailyReconciliationAction(
  data: z.infer<typeof confirmReconciliationSchema>
): Promise<Result<{ reconciliationId?: string; discrepancyLogged: boolean; depositDeducted: boolean }>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err("Non autorisé : droits administrateur requis");

  const parsed = confirmReconciliationSchema.safeParse(data);
  if (!parsed.success) return err(parsed.error.issues[0]?.message || "Données invalides");

  const res = await confirmAdminDailyReconciliation({
    ...parsed.data,
    reconciledBy: auth.value.user.id,
  });
  if (res.ok) {
    revalidatePath("/admin/cash");
    revalidatePath("/admin/couriers");
  }
  return res;
}

export async function holdCourierDepositAction(
  data: z.infer<typeof depositFloatSchema>
): Promise<Result<{ newDeposit: number }>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err("Non autorisé : droits administrateur requis");

  const parsed = depositFloatSchema.safeParse(data);
  if (!parsed.success) return err(parsed.error.issues[0]?.message || "Données invalides");

  const res = await holdAdminCourierDeposit({
    ...parsed.data,
    adminId: auth.value.user.id,
  });
  if (res.ok) {
    revalidatePath("/admin/cash");
    revalidatePath("/admin/couriers");
  }
  return res;
}

export async function releaseCourierDepositAction(
  data: z.infer<typeof depositFloatSchema>
): Promise<Result<{ newDeposit: number }>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err("Non autorisé : droits administrateur requis");

  const parsed = depositFloatSchema.safeParse(data);
  if (!parsed.success) return err(parsed.error.issues[0]?.message || "Données invalides");

  const res = await releaseAdminCourierDeposit({
    ...parsed.data,
    adminId: auth.value.user.id,
  });
  if (res.ok) {
    revalidatePath("/admin/cash");
    revalidatePath("/admin/couriers");
  }
  return res;
}

export async function issueCourierFloatAction(
  data: z.infer<typeof depositFloatSchema>
): Promise<Result<{ newFloat: number }>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err("Non autorisé : droits administrateur requis");

  const parsed = depositFloatSchema.safeParse(data);
  if (!parsed.success) return err(parsed.error.issues[0]?.message || "Données invalides");

  const res = await issueAdminCourierFloat({
    ...parsed.data,
    adminId: auth.value.user.id,
  });
  if (res.ok) {
    revalidatePath("/admin/cash");
    revalidatePath("/admin/couriers");
  }
  return res;
}

export async function returnCourierFloatAction(
  data: z.infer<typeof depositFloatSchema>
): Promise<Result<{ newFloat: number }>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err("Non autorisé : droits administrateur requis");

  const parsed = depositFloatSchema.safeParse(data);
  if (!parsed.success) return err(parsed.error.issues[0]?.message || "Données invalides");

  const res = await returnAdminCourierFloat({
    ...parsed.data,
    adminId: auth.value.user.id,
  });
  if (res.ok) {
    revalidatePath("/admin/cash");
    revalidatePath("/admin/couriers");
  }
  return res;
}

export async function reverseLedgerEntryAction(
  data: z.infer<typeof reverseLedgerSchema>
): Promise<Result<{ reversalId?: string }>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err("Non autorisé : droits administrateur requis");

  const parsed = reverseLedgerSchema.safeParse(data);
  if (!parsed.success) return err(parsed.error.issues[0]?.message || "Données invalides");

  const res = await reverseAdminLedgerEntry({
    ...parsed.data,
    reversedBy: auth.value.user.id,
  });
  if (res.ok) {
    revalidatePath("/admin/cash");
    revalidatePath("/admin/settlements");
  }
  return res;
}

const reverseReconciliationSchema = z.object({
  reconciliationId: z.string().min(1, "Identifiant de réconciliation requis"),
  reason: z.string().min(3, "Un motif d'annulation est requis (au moins 3 caractères)"),
});

export async function reverseCourierReconciliationAction(
  data: z.infer<typeof reverseReconciliationSchema>
): Promise<Result<{ reversalId?: string }>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err("Non autorisé : droits administrateur requis");

  const parsed = reverseReconciliationSchema.safeParse(data);
  if (!parsed.success) return err(parsed.error.issues[0]?.message || "Données invalides");

  const res = await reverseAdminCourierReconciliation({
    ...parsed.data,
    reversedBy: auth.value.user.id,
  });
  if (res.ok) {
    revalidatePath("/admin/cash");
  }
  return res;
}

