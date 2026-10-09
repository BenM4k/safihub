"use server";

import { z } from "zod";
import { requireRole } from "@/services/auth";
import { err, type Result } from "@/lib/result";
import {
  exportAdminDataset,
  type ExportDataset,
  type ExportFormat,
  type ExportResultData,
} from "@/services/admin";

const exportSchema = z.object({
  dataset: z.enum(["orders", "ledger", "customers"]),
  format: z.enum(["csv", "json"]).default("csv"),
});

export async function exportAdminDatasetAction(
  dataset: ExportDataset,
  format: ExportFormat = "csv"
): Promise<Result<ExportResultData>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const parsed = exportSchema.safeParse({ dataset, format });
  if (!parsed.success) {
    return err("Paramètres d'export invalides.");
  }

  return await exportAdminDataset(parsed.data.dataset, parsed.data.format);
}
