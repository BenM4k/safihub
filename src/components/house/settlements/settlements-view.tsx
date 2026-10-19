"use client";

import { useState } from "react";
import { PackageCheck, Receipt } from "lucide-react";
import type {
  PartnerDeliveredOrderDTO,
  PartnerPayoutDTO,
  PartnerSettlementsPageData,
} from "@/types/partner-settlements";
import { HeroBalanceCard } from "./hero-balance-card";
import { SettlementAlerts } from "./settlement-alerts";
import { PeriodKpiRow } from "./period-kpi-row";
import { PeriodSelectorToolbar } from "./period-selector-toolbar";
import { DeliveredOrdersTable } from "./delivered-orders-table";
import { PayoutsTable } from "./payouts-table";
import { PayoutDetailSheet } from "./payout-detail-sheet";
import { SupportTicketDialog, type SupportTicketTarget } from "./support-ticket-dialog";
import { HowItWorksCard } from "./how-it-works-card";
import { StatementModal } from "./statement-modal";

interface SettlementsViewProps {
  data: PartnerSettlementsPageData;
}

export function SettlementsView({ data }: SettlementsViewProps) {
  const [activeTab, setActiveTab] = useState<"orders" | "payouts">("orders");
  const [selectedPayout, setSelectedPayout] = useState<PartnerPayoutDTO | null>(null);
  const [ticketTarget, setTicketTarget] = useState<SupportTicketTarget | null>(null);
  const [isStatementModalOpen, setIsStatementModalOpen] = useState(false);

  // CSV export handler with French Excel encoding
  function handleExportCsv(type: "orders" | "payouts") {
    let csvContent = "\uFEFF"; // UTF-8 BOM
    let filename = "";

    if (type === "orders") {
      filename = `commandes-livrees-${data.houseSlug}-${data.selectedPeriod}.csv`;
      csvContent += "Code;Client;Date livraison;Montant articles (CDF);Commission SafiHub (CDF);Net pressing (CDF);Statut règlement;Référence versement\n";

      for (const o of data.orders) {
        const row = [
          `"${o.code}"`,
          `"${o.customerDisplayName}"`,
          `"${o.deliveredAt ? o.deliveredAt.split("T")[0] : ""}"`,
          o.itemsTotal,
          o.commissionAmount,
          o.netReceivable,
          `"${o.settlementStatus}"`,
          `"${o.settlementReference || ""}"`,
        ];
        csvContent += row.join(";") + "\n";
      }
    } else {
      filename = `versements-recus-${data.houseSlug}-${data.selectedPeriod}.csv`;
      csvContent += "Référence;Date;Période couverte;Méthode;Montant (CDF);Statut;Commandes incluses\n";

      for (const p of data.payouts) {
        const row = [
          `"${p.reference || p.id}"`,
          `"${p.date.split("T")[0]}"`,
          `"${p.periodCovered || ""}"`,
          `"${p.method}"`,
          p.amount,
          `"${p.status}"`,
          p.ordersCount,
        ];
        csvContent += row.join(";") + "\n";
      }
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function handleOpenOrderReport(order: PartnerDeliveredOrderDTO) {
    setTicketTarget({
      type: "order",
      reference: order.code,
      amount: order.netReceivable,
      periodOrDate: order.deliveredAt,
      orderId: order.id,
    });
  }

  function handleOpenPayoutReport(payout: PartnerPayoutDTO) {
    setTicketTarget({
      type: "settlement",
      reference: payout.reference || `#${payout.id.slice(0, 8)}`,
      amount: payout.amount,
      periodOrDate: payout.periodCovered,
      settlementId: payout.id,
    });
  }

  function handleOpenReceiptModal(payout: PartnerPayoutDTO) {
    setSelectedPayout(payout);
    setIsStatementModalOpen(true);
  }

  return (
    <div className="space-y-6">
      {/* 1. Alerts row (only when relevant) */}
      <SettlementAlerts alerts={data.alerts} houseSlug={data.houseSlug} />

      {/* 2. Hero Balance Card (Solde à recevoir) */}
      <HeroBalanceCard hero={data.hero} houseSlug={data.houseSlug} />

      {/* 3. Period selector toolbar */}
      <PeriodSelectorToolbar
        currentPeriod={data.selectedPeriod}
        periodStart={data.periodStartDate}
        periodEnd={data.periodEndDate}
        onOpenStatementModal={() => setIsStatementModalOpen(true)}
        onExportCsv={handleExportCsv}
      />

      {/* 4. KPI Row (Period-scoped with trends) */}
      <PeriodKpiRow kpis={data.kpis} />

      {/* 5. Full-width Tabs for Commandes livrées vs Versements */}
      <div className="space-y-4">
        <div className="flex border-b border-border gap-2" role="tablist" aria-label="Onglets d'activité">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "orders"}
            onClick={() => setActiveTab("orders")}
            className={`pb-3 px-4 text-sm font-bold transition flex items-center gap-2 border-b-2 cursor-pointer min-h-[44px] ${
              activeTab === "orders"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-heading"
            }`}
          >
            <PackageCheck className="size-4" />
            <span>Commandes livrées</span>
            <span className="px-2 py-0.5 rounded-full text-2xs font-semibold bg-surface border border-border">
              {data.orders.length}
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "payouts"}
            onClick={() => setActiveTab("payouts")}
            className={`pb-3 px-4 text-sm font-bold transition flex items-center gap-2 border-b-2 cursor-pointer min-h-[44px] ${
              activeTab === "payouts"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-heading"
            }`}
          >
            <Receipt className="size-4" />
            <span>Versements reçus</span>
            <span className="px-2 py-0.5 rounded-full text-2xs font-semibold bg-surface border border-border">
              {data.payouts.length}
            </span>
          </button>
        </div>

        {activeTab === "orders" ? (
          <DeliveredOrdersTable
            orders={data.orders}
            houseSlug={data.houseSlug}
            onOpenReportDialog={handleOpenOrderReport}
          />
        ) : (
          <PayoutsTable
            payouts={data.payouts}
            onSelectPayout={setSelectedPayout}
            onOpenReportDialog={handleOpenPayoutReport}
            onOpenReceiptModal={handleOpenReceiptModal}
          />
        )}
      </div>

      {/* 6. Explanatory Accordion: Comment ça marche */}
      <HowItWorksCard
        commissionRatePercent={data.config.commissionRatePercent}
        settlementDelayNotice={data.config.settlementDelayNotice}
      />

      {/* Payout Detail Side Panel (Sheet) */}
      <PayoutDetailSheet
        payout={selectedPayout}
        onClose={() => setSelectedPayout(null)}
        houseSlug={data.houseSlug}
        onOpenReportDialog={handleOpenPayoutReport}
        onOpenReceiptModal={handleOpenReceiptModal}
      />

      {/* Problem Reporting Support Ticket Dialog */}
      <SupportTicketDialog
        target={ticketTarget}
        onClose={() => setTicketTarget(null)}
        houseSlug={data.houseSlug}
      />

      {/* Relevé de Compte Modal */}
      <StatementModal
        isOpen={isStatementModalOpen}
        onClose={() => setIsStatementModalOpen(false)}
        data={data}
      />
    </div>
  );
}
