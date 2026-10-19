"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { PartnerPayoutDTO } from "@/types/partner-settlements";
import { EmptyState } from "@/components/shared";
import { PayoutsMobileList } from "./payouts-mobile-list";
import { PayoutTableRow } from "./payout-table-row";

interface PayoutsTableProps {
  payouts: PartnerPayoutDTO[];
  onSelectPayout: (payout: PartnerPayoutDTO) => void;
  onOpenReportDialog: (payout: PartnerPayoutDTO) => void;
  onOpenReceiptModal: (payout: PartnerPayoutDTO) => void;
}

const METHOD_LABELS: Record<string, string> = {
  mobile_money: "Mobile Money",
  bank: "Virement bancaire",
  cash: "Espèces",
};

export function PayoutsTable({
  payouts,
  onSelectPayout,
  onOpenReportDialog,
  onOpenReceiptModal,
}: PayoutsTableProps) {
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState<string>("all");

  const filteredPayouts = useMemo(() => {
    return payouts.filter((p) => {
      if (methodFilter !== "all" && p.method !== methodFilter) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase().trim();
      return (
        (p.reference && p.reference.toLowerCase().includes(q)) ||
        (p.periodCovered && p.periodCovered.toLowerCase().includes(q)) ||
        (p.note && p.note.toLowerCase().includes(q))
      );
    });
  }, [payouts, search, methodFilter]);

  return (
    <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden space-y-4 p-4 sm:p-5">
      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par référence, note..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-surface text-xs focus:ring-2 focus:ring-primary focus:outline-hidden min-h-[44px]"
            aria-label="Rechercher un versement"
          />
        </div>

        {/* Method filter pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0" role="group" aria-label="Filtrer par méthode">
          {[
            { key: "all", label: "Toutes méthodes" },
            { key: "mobile_money", label: "Mobile Money" },
            { key: "bank", label: "Virement" },
            { key: "cash", label: "Espèces" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setMethodFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer min-h-[44px] sm:min-h-0 flex items-center ${
                methodFilter === tab.key
                  ? "bg-heading text-white shadow-xs"
                  : "bg-surface text-muted-foreground hover:bg-surface-hover border border-border"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border bg-surface text-muted-foreground font-semibold">
              <th className="py-3 px-4">Date versement</th>
              <th className="py-3 px-4">Période couverte</th>
              <th className="py-3 px-4">Méthode</th>
              <th className="py-3 px-4 text-right">Montant</th>
              <th className="py-3 px-4 text-center">Statut</th>
              <th className="py-3 px-4">Référence</th>
              <th className="py-3 px-4 text-center">Reçu</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredPayouts.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8">
                  <EmptyState
                    title="Aucun versement enregistré"
                    description="Aucun versement ne correspond aux critères de recherche sur cette période."
                  />
                </td>
              </tr>
            ) : (
              filteredPayouts.map((p) => (
                <PayoutTableRow
                  key={p.id}
                  payout={p}
                  methodLabel={METHOD_LABELS[p.method] || p.method}
                  onSelectPayout={onSelectPayout}
                  onOpenReportDialog={onOpenReportDialog}
                  onOpenReceiptModal={onOpenReceiptModal}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Card List */}
      <PayoutsMobileList
        payouts={filteredPayouts}
        methodLabels={METHOD_LABELS}
        onSelectPayout={onSelectPayout}
        onOpenReportDialog={onOpenReportDialog}
        onOpenReceiptModal={onOpenReceiptModal}
      />
    </div>
  );
}
