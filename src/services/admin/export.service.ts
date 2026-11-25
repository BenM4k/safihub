import "server-only";
import { ok, err, type Result } from "@/lib/result";
import { escapeCsvCell } from "@/lib/csv-utils";
import { sanitizeServiceError } from "@/lib/service-errors";
import {
  getAdminOrdersExportData,
  getAdminLedgerExportData,
  getAdminCustomersExportData,
} from "@/dal";

export type ExportDataset = "orders" | "ledger" | "customers";
export type ExportFormat = "csv" | "json";

export interface ExportResultData {
  content: string;
  filename: string;
  mimeType: string;
  rowCount: number;
}

/**
 * Converts an array of objects to a CSV string.
 */
function convertToCsv<T extends Record<string, unknown>>(data: T[]): string {
  if (data.length === 0) return "";
  const headers = Object.keys(data[0]!);
  const headerLine = headers.map((h) => escapeCsvCell(h)).join(",");
  const rows = data.map((row) =>
    headers.map((field) => escapeCsvCell(row[field])).join(",")
  );
  return [headerLine, ...rows].join("\r\n");
}

/**
 * Exports data for admin operations and reporting.
 */
export async function exportAdminDataset(
  dataset: ExportDataset,
  format: ExportFormat = "csv",
  options?: { limit?: number }
): Promise<Result<ExportResultData>> {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

    if (dataset === "orders") {
      const orders = await getAdminOrdersExportData({ limit: options?.limit });
      const filename = `safihub-orders-${timestamp}.${format}`;
      if (format === "json") {
        return ok({
          content: JSON.stringify(orders, null, 2),
          filename,
          mimeType: "application/json",
          rowCount: orders.length,
        });
      }
      return ok({
        content: convertToCsv(orders),
        filename,
        mimeType: "text/csv; charset=utf-8",
        rowCount: orders.length,
      });
    }

    if (dataset === "ledger") {
      const ledger = await getAdminLedgerExportData({ limit: options?.limit });
      const filename = `safihub-cash-ledger-${timestamp}.${format}`;
      if (format === "json") {
        return ok({
          content: JSON.stringify(ledger, null, 2),
          filename,
          mimeType: "application/json",
          rowCount: ledger.length,
        });
      }
      return ok({
        content: convertToCsv(ledger),
        filename,
        mimeType: "text/csv; charset=utf-8",
        rowCount: ledger.length,
      });
    }

    if (dataset === "customers") {
      const customers = await getAdminCustomersExportData({ limit: options?.limit });
      const filename = `safihub-customers-${timestamp}.${format}`;
      if (format === "json") {
        return ok({
          content: JSON.stringify(customers, null, 2),
          filename,
          mimeType: "application/json",
          rowCount: customers.length,
        });
      }
      return ok({
        content: convertToCsv(customers),
        filename,
        mimeType: "text/csv; charset=utf-8",
        rowCount: customers.length,
      });
    }

    return err(`Type de jeu de données inconnu : ${dataset}`);
  } catch (error) {
    return err(
      sanitizeServiceError(
        error,
        "Erreur lors de l'export des données.",
        "exportAdminDataset"
      )
    );
  }
}
