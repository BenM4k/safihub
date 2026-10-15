"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import type { PartnerOrderListItemDTO, PartnerOrderTabCounts } from "@/dal/partner-order.dal";
import { usePartnerOrders } from "./use-partner-orders";
import { PartnerOrdersTabs } from "./partner-orders-tabs";
import { PartnerOrdersFilterBar } from "./partner-orders-filter-bar";
import { PartnerOrdersEmptyState } from "./partner-orders-empty-state";
import { PartnerOrdersCardList } from "./partner-orders-card-list";
import { PartnerOrdersTable } from "./partner-orders-table";
import { PartnerOrdersPagination } from "./partner-orders-pagination";
import { PartnerOrderDetailSheet } from "./partner-order-detail-sheet";
import { PartnerOrderRejectDialog } from "./partner-order-reject-dialog";
import { PartnerOrderIssueDialog } from "./partner-order-issue-dialog";
import { PartnerOrderTicketDialog } from "./partner-order-ticket-dialog";

interface PartnerOrdersContainerProps {
  initialOrders: PartnerOrderListItemDTO[];
  initialCounts: PartnerOrderTabCounts;
  houseSlug: string;
}

export function PartnerOrdersContainer({
  initialOrders,
  initialCounts,
  houseSlug,
}: PartnerOrdersContainerProps) {
  const {
    orders,
    paginatedOrders,
    currentPage,
    pageSize,
    totalItems,
    counts,
    currentTab,
    currentSearch,
    currentDate,
    currentSort,
    pendingOrderId,
    isRefreshing,
    soundEnabled,
    feedbackToast,
    setSoundEnabled,
    updateUrl,
    refreshData,
    handlePageChange,
    handlePageSizeChange,
    handleAccept,
    handleReject,
    handleMarkReceived,
    handleStartWashing,
    handleMarkReady,
    handleHandover,
    handleReportIssue,
  } = usePartnerOrders(initialOrders, initialCounts, houseSlug);

  const [detailOrder, setDetailOrder] = useState<PartnerOrderListItemDTO | null>(null);
  const [ticketOrder, setTicketOrder] = useState<PartnerOrderListItemDTO | null>(null);
  const [rejectOrder, setRejectOrder] = useState<PartnerOrderListItemDTO | null>(null);
  const [issueOrder, setIssueOrder] = useState<PartnerOrderListItemDTO | null>(null);

  return (
    <div className="space-y-4 font-sans">
      {/* Toast Feedback */}
      {feedbackToast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl text-xs font-bold shadow-2xl flex items-center gap-2 border animate-in fade-in slide-in-from-bottom-2 ${
            feedbackToast.type === "success"
              ? "bg-slate-900 text-white border-slate-700"
              : "bg-destructive text-white border-destructive"
          }`}
        >
          {feedbackToast.type === "success" ? (
            <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="size-4 text-white shrink-0" />
          )}
          <span>{feedbackToast.message}</span>
        </div>
      )}

      {/* Stage Tabs with live counts */}
      <PartnerOrdersTabs
        activeTab={currentTab}
        counts={counts}
        onTabChange={(tab) => updateUrl({ tab })}
      />

      {/* Filter Bar */}
      <PartnerOrdersFilterBar
        search={currentSearch}
        onSearchChange={(search) => updateUrl({ search })}
        date={currentDate}
        onDateChange={(date) => updateUrl({ date })}
        sort={currentSort}
        onSortChange={(sort) => updateUrl({ sort })}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
        onRefresh={() => refreshData(false)}
        isRefreshing={isRefreshing}
      />

      {/* Content: Empty state or List/Table */}
      {orders.length === 0 ? (
        <PartnerOrdersEmptyState tab={currentTab} />
      ) : (
        <>
          <PartnerOrdersCardList
            orders={paginatedOrders}
            pendingOrderId={pendingOrderId}
            onAccept={handleAccept}
            onMarkReceived={handleMarkReceived}
            onStartWashing={handleStartWashing}
            onMarkReady={handleMarkReady}
            onHandover={handleHandover}
            onOpenDetail={setDetailOrder}
            onOpenTicket={setTicketOrder}
            onOpenIssue={setIssueOrder}
            onOpenReject={setRejectOrder}
          />

          <PartnerOrdersTable
            orders={paginatedOrders}
            pendingOrderId={pendingOrderId}
            onAccept={handleAccept}
            onMarkReceived={handleMarkReceived}
            onStartWashing={handleStartWashing}
            onMarkReady={handleMarkReady}
            onHandover={handleHandover}
            onOpenDetail={setDetailOrder}
            onOpenTicket={setTicketOrder}
            onOpenIssue={setIssueOrder}
            onOpenReject={setRejectOrder}
          />

          <PartnerOrdersPagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </>
      )}

      {/* Detail Slide-over Sheet */}
      <PartnerOrderDetailSheet
        order={detailOrder}
        houseSlug={houseSlug}
        isOpen={Boolean(detailOrder)}
        onClose={() => setDetailOrder(null)}
      />

      {/* Printable Ticket Dialog */}
      <PartnerOrderTicketDialog
        order={ticketOrder}
        isOpen={Boolean(ticketOrder)}
        onClose={() => setTicketOrder(null)}
      />

      {/* Rejection Dialog */}
      <PartnerOrderRejectDialog
        order={rejectOrder}
        isOpen={Boolean(rejectOrder)}
        onClose={() => setRejectOrder(null)}
        onConfirm={handleReject}
      />

      {/* Report Issue Dialog */}
      <PartnerOrderIssueDialog
        order={issueOrder}
        isOpen={Boolean(issueOrder)}
        onClose={() => setIssueOrder(null)}
        onConfirm={handleReportIssue}
      />
    </div>
  );
}
