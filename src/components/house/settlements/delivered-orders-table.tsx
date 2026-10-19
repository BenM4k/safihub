"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { formatMoney } from "@/lib/cash-formatters";
import type { PartnerDeliveredOrderDTO } from "@/types/partner-settlements";
import { EmptyState } from "@/components/shared";
import { DeliveredOrdersMobileList } from "./delivered-orders-mobile-list";
import { DeliveredOrderTableRow } from "./delivered-order-table-row";

interface DeliveredOrdersTableProps {
  orders: PartnerDeliveredOrderDTO[];
  houseSlug: string;
  onOpenReportDialog: (order: PartnerDeliveredOrderDTO) => void;
}

export function DeliveredOrdersTable({
  orders,
  houseSlug,
  onOpenReportDialog,
}: DeliveredOrdersTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "settled" | "disputed">("all");

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== "all" && o.settlementStatus !== statusFilter) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase().trim();
      return (
        o.code.toLowerCase().includes(q) ||
        o.shortReference.toLowerCase().includes(q) ||
        o.customerDisplayName.toLowerCase().includes(q) ||
        (o.settlementReference && o.settlementReference.toLowerCase().includes(q))
      );
    });
  }, [orders, search, statusFilter]);

  const totals = useMemo(() => {
    return filteredOrders.reduce(
      (acc, o) => {
        acc.itemsTotal += o.itemsTotal;
        acc.commission += o.commissionAmount;
        acc.net += o.netReceivable;
        return acc;
      },
      { itemsTotal: 0, commission: 0, net: 0 }
    );
  }, [filteredOrders]);

  return (
    <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden space-y-4 p-4 sm:p-5">
      {/* Table filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher code, client, virement..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-surface text-xs focus:ring-2 focus:ring-primary focus:outline-hidden min-h-[44px]"
            aria-label="Rechercher une commande livrée"
          />
        </div>

        {/* Status filter tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0" role="group" aria-label="Filtrer par statut de règlement">
          {[
            { key: "all", label: "Toutes" },
            { key: "pending", label: "En attente" },
            { key: "settled", label: "Incluses" },
            { key: "disputed", label: "Litiges" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key as "all" | "pending" | "settled" | "disputed")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer min-h-[44px] sm:min-h-0 flex items-center ${
                statusFilter === tab.key
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
              <th className="py-3 px-4">Référence</th>
              <th className="py-3 px-4">Client</th>
              <th className="py-3 px-4">Livraison</th>
              <th className="py-3 px-4 text-right">Montant articles</th>
              <th className="py-3 px-4 text-right">Commission</th>
              <th className="py-3 px-4 text-right">Net à percevoir</th>
              <th className="py-3 px-4 text-center">Statut règlement</th>
              <th className="py-3 px-4">Versement</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8">
                  <EmptyState
                    title="Aucune commande livrée trouvée"
                    description="Aucune commande ne correspond aux filtres ou à la période sélectionnée."
                  />
                </td>
              </tr>
            ) : (
              filteredOrders.map((o) => (
                <DeliveredOrderTableRow
                  key={o.id}
                  order={o}
                  houseSlug={houseSlug}
                  onOpenReportDialog={onOpenReportDialog}
                />
              ))
            )}
          </tbody>

          {filteredOrders.length > 0 && (
            <tfoot>
              <tr className="bg-surface border-t-2 border-border font-bold text-heading">
                <td colSpan={3} className="py-3 px-4 text-xs font-bold">
                  Total filtré ({filteredOrders.length} commandes)
                </td>
                <td className="py-3 px-4 text-right font-mono tabular-nums">
                  {formatMoney(totals.itemsTotal, "CDF")}
                </td>
                <td className="py-3 px-4 text-right font-mono tabular-nums text-muted-foreground">
                  -{formatMoney(totals.commission, "CDF")}
                </td>
                <td className="py-3 px-4 text-right font-mono tabular-nums text-primary text-sm font-black">
                  {formatMoney(totals.net, "CDF")}
                </td>
                <td colSpan={3} />
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Mobile Stacked Card List */}
      <DeliveredOrdersMobileList
        orders={filteredOrders}
        houseSlug={houseSlug}
        totals={totals}
        onOpenReportDialog={onOpenReportDialog}
      />
    </div>
  );
}
