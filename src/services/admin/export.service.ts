import "server-only";
import { ok, err, type Result } from "@/lib/result";
import { escapeCsvCell } from "@/lib/csv-utils";
import { sanitizeServiceError } from "@/lib/service-errors";
import { clampExportLimit, clampExportOffset } from "@/lib/export-limits";
import {
  getAdminOrdersExportData,
  getAdminLedgerExportData,
  getAdminCustomersExportData,
} from "@/dal/ops.dal";

export type ExportDataset = "orders" | "ledger" | "customers";
export type ExportFormat = "csv" | "json";

export interface ExportResultData {
  content: string;
  filename: string;
  mimeType: string;
  rowCount: number;
  truncated: boolean;
  limit: number;
  offset: number;
  nextOffset: number | null;
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

function buildExportResponse<T extends Record<string, unknown>>(params: {
  datasetPrefix: string;
  rawRows: T[];
  format: ExportFormat;
  limit: number;
  offset: number;
  timestamp: string;
}): ExportResultData {
  const truncated = params.rawRows.length > params.limit;
  const rows = truncated ? params.rawRows.slice(0, params.limit) : params.rawRows;
  const offsetSuffix = params.offset > 0 ? `-offset-${params.offset}` : "";
  const filename = `${params.datasetPrefix}-${params.timestamp}${offsetSuffix}.${params.format}`;
  const nextOffset = truncated ? params.offset + rows.length : null;

  if (params.format === "json") {
    return {
      content: JSON.stringify(rows, null, 2),
      filename,
      mimeType: "application/json",
      rowCount: rows.length,
      truncated,
      limit: params.limit,
      offset: params.offset,
      nextOffset,
    };
  }

  return {
    content: convertToCsv(rows),
    filename,
    mimeType: "text/csv; charset=utf-8",
    rowCount: rows.length,
    truncated,
    limit: params.limit,
    offset: params.offset,
    nextOffset,
  };
}

/**
 * Exports data for admin operations and reporting.
 */
export async function exportAdminDataset(
  dataset: ExportDataset,
  format: ExportFormat = "csv",
  options?: { limit?: number; offset?: number }
): Promise<Result<ExportResultData>> {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const limit = clampExportLimit(options?.limit);
    const offset = clampExportOffset(options?.offset);

    if (dataset === "orders") {
      const rawRows = await getAdminOrdersExportData({
        limit,
        offset,
        probeExtraRow: true,
      });
      return ok(
        buildExportResponse({
          datasetPrefix: "safihub-orders",
          rawRows,
          format,
          limit,
          offset,
          timestamp,
        })
      );
    }

    if (dataset === "ledger") {
      const rawRows = await getAdminLedgerExportData({
        limit,
        offset,
        probeExtraRow: true,
      });
      return ok(
        buildExportResponse({
          datasetPrefix: "safihub-cash-ledger",
          rawRows,
          format,
          limit,
          offset,
          timestamp,
        })
      );
    }

    if (dataset === "customers") {
      const rawRows = await getAdminCustomersExportData({
        limit,
        offset,
        probeExtraRow: true,
      });
      return ok(
        buildExportResponse({
          datasetPrefix: "safihub-customers",
          rawRows,
          format,
          limit,
          offset,
          timestamp,
        })
      );
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
