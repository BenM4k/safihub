import type { PartnerSettlementsPageData } from "@/types/partner-settlements";

/**
 * Formats and sanitizes a cell value for CSV export.
 * Preserves numeric types; escapes double quotes; prefixes formula injection triggers (=, +, -, @).
 */
export function csvCell(val: string | number | null | undefined): string {
  if (val === null || val === undefined) {
    return '""';
  }
  if (typeof val === "number") {
    return Number.isFinite(val) ? String(val) : '""';
  }
  let str = String(val);
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  return `"${str.replace(/"/g, '""')}"`;
}

/**
 * Builds UTF-8 BOM CSV export content for orders or payouts.
 */
export function buildSettlementsCsv(
  type: "orders" | "payouts",
  data: PartnerSettlementsPageData
): { csvContent: string; filename: string } {
  let csvContent = "\uFEFF"; // UTF-8 BOM
  let filename = "";

  if (type === "orders") {
    filename = `commandes-livrees-${data.houseSlug}-${data.selectedPeriod}.csv`;
    csvContent +=
      "Code;Client;Date livraison;Montant articles (CDF);Commission SafiHub (CDF);Net pressing (CDF);Statut règlement;Référence versement\n";

    for (const o of data.orders) {
      const row = [
        csvCell(o.code),
        csvCell(o.customerDisplayName),
        csvCell(o.deliveredAt ? o.deliveredAt.split("T")[0] : ""),
        csvCell(o.itemsTotal),
        csvCell(o.commissionAmount),
        csvCell(o.netReceivable),
        csvCell(o.settlementStatus),
        csvCell(o.settlementReference || ""),
      ];
      csvContent += row.join(";") + "\n";
    }
  } else {
    filename = `versements-recus-${data.houseSlug}-${data.selectedPeriod}.csv`;
    csvContent +=
      "Référence;Date;Période couverte;Méthode;Montant (CDF);Statut;Commandes incluses\n";

    for (const p of data.payouts) {
      const row = [
        csvCell(p.reference || p.id),
        csvCell(p.date.split("T")[0]),
        csvCell(p.periodCovered || ""),
        csvCell(p.method),
        csvCell(p.amount),
        csvCell(p.status),
        csvCell(p.ordersCount),
      ];
      csvContent += row.join(";") + "\n";
    }
  }

  return { csvContent, filename };
}
