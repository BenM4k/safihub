import type { ReconciliationLogRow } from "./reconciliation-history-table";

function escapeCsvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '""';
  let str = String(value);
  if (/^[=+\-@]/.test(str)) {
    str = `'${str}`;
  }
  return `"${str.replace(/"/g, '""')}"`;
}

/**
 * Exports filtered reconciliation records to CSV with UTF-8 BOM and standard accounting columns.
 */
export function exportReconciliationHistoryCsv(
  logs: ReconciliationLogRow[],
  period: string
): void {
  const headers = [
    "Date comptable",
    "Coursier",
    "Attendu (CDF)",
    "Reçu (CDF)",
    "Écart (CDF)",
    "Statut",
    "Réconcilié par",
    "Date et heure",
    "Note",
  ];

  const rows = logs.map((l) => [
    l.businessDate,
    escapeCsvCell(l.courierName || l.courierId),
    l.expectedAmount,
    l.receivedAmount,
    l.difference,
    l.note?.includes("[ANNULÉE") ? "Annulée" : l.difference === 0 ? "Réconcilié" : "Écart",
    escapeCsvCell(l.reconcilerName || l.reconciledBy || "—"),
    new Date(l.createdAt).toISOString(),
    escapeCsvCell(l.note || ""),
  ]);

  const csvContent =
    "\uFEFF" + [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `reconciliation_caisse_${period}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
