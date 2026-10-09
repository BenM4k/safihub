"use server";

import { z } from "zod";
import { getCurrentUser } from "@/services/auth";
import { err, type Result } from "@/lib/result";
import {
  confirmAdminDailyReconciliation,
  holdAdminCourierDeposit,
  releaseAdminCourierDeposit,
  issueAdminCourierFloat,
  returnAdminCourierFloat,
  reverseAdminLedgerEntry,
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
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return err("Non autorisé : droits administrateur requis");

  const parsed = confirmReconciliationSchema.safeParse(data);
  if (!parsed.success) return err(parsed.error.issues[0]?.message || "Données invalides");

  return await confirmAdminDailyReconciliation({
    ...parsed.data,
    reconciledBy: user.id,
  });
}

export async function holdCourierDepositAction(
  data: z.infer<typeof depositFloatSchema>
): Promise<Result<{ newDeposit: number }>> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return err("Non autorisé : droits administrateur requis");

  const parsed = depositFloatSchema.safeParse(data);
  if (!parsed.success) return err(parsed.error.issues[0]?.message || "Données invalides");

  return await holdAdminCourierDeposit({
    ...parsed.data,
    adminId: user.id,
  });
}

export async function releaseCourierDepositAction(
  data: z.infer<typeof depositFloatSchema>
): Promise<Result<{ newDeposit: number }>> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return err("Non autorisé : droits administrateur requis");

  const parsed = depositFloatSchema.safeParse(data);
  if (!parsed.success) return err(parsed.error.issues[0]?.message || "Données invalides");

  return await releaseAdminCourierDeposit({
    ...parsed.data,
    adminId: user.id,
  });
}

export async function issueCourierFloatAction(
  data: z.infer<typeof depositFloatSchema>
): Promise<Result<{ newFloat: number }>> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return err("Non autorisé : droits administrateur requis");

  const parsed = depositFloatSchema.safeParse(data);
  if (!parsed.success) return err(parsed.error.issues[0]?.message || "Données invalides");

  return await issueAdminCourierFloat({
    ...parsed.data,
    adminId: user.id,
  });
}

export async function returnCourierFloatAction(
  data: z.infer<typeof depositFloatSchema>
): Promise<Result<{ newFloat: number }>> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return err("Non autorisé : droits administrateur requis");

  const parsed = depositFloatSchema.safeParse(data);
  if (!parsed.success) return err(parsed.error.issues[0]?.message || "Données invalides");

  return await returnAdminCourierFloat({
    ...parsed.data,
    adminId: user.id,
  });
}

export async function reverseLedgerEntryAction(
  data: z.infer<typeof reverseLedgerSchema>
): Promise<Result<{ reversalId?: string }>> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return err("Non autorisé : droits administrateur requis");

  const parsed = reverseLedgerSchema.safeParse(data);
  if (!parsed.success) return err(parsed.error.issues[0]?.message || "Données invalides");

  return await reverseAdminLedgerEntry({
    ...parsed.data,
    reversedBy: user.id,
  });
}
