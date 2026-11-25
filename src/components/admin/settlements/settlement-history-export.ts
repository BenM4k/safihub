import { formatFrenchDate } from "@/lib/cash-formatters";
import { escapeCsvCell } from "@/lib/csv-utils";
import type { SettlementHistoryRow } from "./types";

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
      escapeCsvCell(formatFrenchDate(log.createdAt), { alwaysQuote: true }),
      escapeCsvCell(log.payeeName, { alwaysQuote: true }),
      escapeCsvCell(log.payeeType === "house" ? "Pressing" : "Coursier", { alwaysQuote: true }),
      escapeCsvCell(log.period || "", { alwaysQuote: true }),
      escapeCsvCell(log.amount, { alwaysQuote: true }),
      escapeCsvCell(log.currency, { alwaysQuote: true }),
      escapeCsvCell(methodLabels[log.method] || log.method, { alwaysQuote: true }),
      escapeCsvCell(log.reference, { alwaysQuote: true }),
      escapeCsvCell(log.operatorName, { alwaysQuote: true }),
      escapeCsvCell(log.isReversed ? "Annulée" : "Validé", { alwaysQuote: true }),
      escapeCsvCell(log.reversalReason, { alwaysQuote: true }),
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
