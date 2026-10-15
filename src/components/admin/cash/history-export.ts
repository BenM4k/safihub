import type { ReconciliationLogRow } from "./reconciliation-history-table";

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
    `"${(l.courierName || l.courierId).replace(/"/g, '""')}"`,
    l.expectedAmount,
    l.receivedAmount,
    l.difference,
    l.note?.includes("[ANNULÉE") ? "Annulée" : l.difference === 0 ? "Réconcilié" : "Écart",
    `"${(l.reconcilerName || l.reconciledBy || "—").replace(/"/g, '""')}"`,
    new Date(l.createdAt).toISOString(),
    `"${(l.note || "").replace(/"/g, '""')}"`,
  ]);

  const csvContent =
    "data:text/csv;charset=utf-8,\uFEFF" +
    [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `reconciliation_caisse_${period}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
