import "server-only";
import { err, ok, type Result } from "@/lib/result";
import {
  getDailyCourierReconciliationData,
  recordDailyCourierReconciliation,
  getReconciliationLogs,
  holdCourierDeposit,
  releaseCourierDeposit,
  issueCourierFloat,
  returnCourierFloat,
  reverseLedgerEntry,
} from "@/dal";

export async function getAdminDailyReconciliation(dateStr: string) {
  try {
    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return err("Format de date invalide (AAAA-MM-JJ attendu)");
    }
    const data = await getDailyCourierReconciliationData(dateStr);
    return ok(data);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Erreur lors du chargement de la réconciliation");
  }
}

export async function confirmAdminDailyReconciliation(params: {
  courierId: string;
  businessDate: string;
  currency?: "CDF" | "USD";
  expectedAmount: number;
  receivedAmount: number;
  note?: string;
  reconciledBy: string;
  deductFromDeposit?: boolean;
}): Promise<Result<{ reconciliationId?: string; discrepancyLogged: boolean; depositDeducted: boolean }>> {
  try {
    if (!params.courierId) return err("Identifiant du coursier requis");
    if (!params.businessDate || !/^\d{4}-\d{2}-\d{2}$/.test(params.businessDate)) {
      return err("Date d'opération requise (AAAA-MM-JJ)");
    }
    if (params.receivedAmount < 0) {
      return err("Le montant reçu ne peut pas être négatif");
    }

    const res = await recordDailyCourierReconciliation({
      courierId: params.courierId,
      businessDate: params.businessDate,
      currency: params.currency ?? "CDF",
      expectedAmount: params.expectedAmount,
      receivedAmount: params.receivedAmount,
      note: params.note,
      reconciledBy: params.reconciledBy,
      deductFromDeposit: params.deductFromDeposit,
    });

    return ok({
      reconciliationId: res.reconciliationId,
      discrepancyLogged: res.discrepancyLogged,
      depositDeducted: res.depositDeducted,
    });
  } catch (error) {
    return err(error instanceof Error ? error.message : "Erreur lors de l'enregistrement de la réconciliation");
  }
}

export async function getAdminReconciliationHistory(limit = 30) {
  try {
    const logs = await getReconciliationLogs(limit);
    return ok(logs);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Erreur lors du chargement de l'historique");
  }
}

export async function holdAdminCourierDeposit(params: {
  courierId: string;
  amount: number;
  currency?: "CDF" | "USD";
  note?: string;
  adminId: string;
}) {
  try {
    if (!params.courierId) return err("Coursier requis");
    if (params.amount <= 0) return err("Le montant de la caution doit être supérieur à zéro");

    const res = await holdCourierDeposit({
      courierId: params.courierId,
      amount: params.amount,
      currency: params.currency,
      note: params.note,
      adminId: params.adminId,
    });
    return ok(res);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Erreur lors de la retenue de caution");
  }
}

export async function releaseAdminCourierDeposit(params: {
  courierId: string;
  amount: number;
  currency?: "CDF" | "USD";
  note?: string;
  adminId: string;
}) {
  try {
    if (!params.courierId) return err("Coursier requis");
    if (params.amount <= 0) return err("Le montant restitué doit être supérieur à zéro");

    const res = await releaseCourierDeposit({
      courierId: params.courierId,
      amount: params.amount,
      currency: params.currency,
      note: params.note,
      adminId: params.adminId,
    });
    return ok(res);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Erreur lors de la restitution de caution");
  }
}

export async function issueAdminCourierFloat(params: {
  courierId: string;
  amount: number;
  currency?: "CDF" | "USD";
  note?: string;
  adminId: string;
}) {
  try {
    if (!params.courierId) return err("Coursier requis");
    if (params.amount <= 0) return err("Le montant du fond de caisse doit être positif");

    const res = await issueCourierFloat({
      courierId: params.courierId,
      amount: params.amount,
      currency: params.currency,
      note: params.note,
      adminId: params.adminId,
    });
    return ok(res);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Erreur lors de l'émission du fond de caisse");
  }
}

export async function returnAdminCourierFloat(params: {
  courierId: string;
  amount: number;
  currency?: "CDF" | "USD";
  note?: string;
  adminId: string;
}) {
  try {
    if (!params.courierId) return err("Coursier requis");
    if (params.amount <= 0) return err("Le montant retourné doit être positif");

    const res = await returnCourierFloat({
      courierId: params.courierId,
      amount: params.amount,
      currency: params.currency,
      note: params.note,
      adminId: params.adminId,
    });
    return ok(res);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Erreur lors du retour du fond de caisse");
  }
}

export async function reverseAdminLedgerEntry(params: {
  entryId: string;
  reason: string;
  reversedBy: string;
}) {
  try {
    if (!params.entryId) return err("Identifiant d'écriture requis");
    if (!params.reason?.trim()) return err("Un motif de contre-passation est obligatoire");

    const res = await reverseLedgerEntry({
      entryId: params.entryId,
      reason: params.reason.trim(),
      reversedBy: params.reversedBy,
    });

    if (!res.ok) return err(res.error || "Échec de la contre-passation");
    return ok(res);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Erreur lors de la contre-passation");
  }
}
