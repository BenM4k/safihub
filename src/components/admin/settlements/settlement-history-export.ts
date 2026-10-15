import { formatFrenchDate } from "@/lib/cash-formatters";
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
      `"${formatFrenchDate(log.createdAt)}"`,
      `"${(log.payeeName || "").replace(/"/g, '""')}"`,
      `"${log.payeeType === "house" ? "Pressing" : "Coursier"}"`,
      `"${log.period || ""}"`,
      `"${log.amount}"`,
      `"${log.currency}"`,
      `"${methodLabels[log.method] || log.method}"`,
      `"${(log.reference || "").replace(/"/g, '""')}"`,
      `"${(log.operatorName || "").replace(/"/g, '""')}"`,
      `"${log.isReversed ? "Annulée" : "Validé"}"`,
      `"${(log.reversalReason || "").replace(/"/g, '""')}"`,
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
