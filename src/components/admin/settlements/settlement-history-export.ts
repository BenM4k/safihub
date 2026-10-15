import { formatFrenchDate } from "@/lib/cash-formatters";
import type { SettlementHistoryRow } from "./types";

function escapeCsvField(value: string | null | undefined): string {
  if (!value) return '""';
  let str = value;
  if (/^[=+\-@]/.test(str)) {
    str = `'${str}`;
  }
  return `"${str.replace(/"/g, '""')}"`;
}

export function exportSettlementHistoryCsv(
  logs: SettlementHistoryRow[],
  period: string
): void {
  const headers = [
    "Date",
    "Bénéficiaire",
    "Type",
    "Période",
    "Montant",
    "Devise",
    "Mode de règlement",
    "Référence / Preuve",
    "Opérateur",
    "Statut",
    "Motif annulation",
  ];

  const methodLabels: Record<string, string> = {
    mobile_money: "Mobile Money",
    bank: "Virement Bancaire",
    cash: "Espèces",
  };

  const rows = logs.map((log) => {
    return [
      `"${formatFrenchDate(log.createdAt)}"`,
      escapeCsvField(log.payeeName),
      `"${log.payeeType === "house" ? "Pressing" : "Coursier"}"`,
      `"${log.period || ""}"`,
      `"${log.amount}"`,
      `"${log.currency}"`,
      `"${methodLabels[log.method] || log.method}"`,
      escapeCsvField(log.reference),
      escapeCsvField(log.operatorName),
      `"${log.isReversed ? "Annulée" : "Validé"}"`,
      escapeCsvField(log.reversalReason),
    ].join(";");
  });

  const csvContent = "\uFEFF" + [headers.join(";"), ...rows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const today = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `reglements-safihub-${period}-${today}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
