"use client";

import { useEffect } from "react";
import { usePartnerOrdersActions } from "./partner-orders-context";
import { PartnerOrdersCardList } from "./partner-orders-card-list";
import { PartnerOrdersTable } from "./partner-orders-table";
import { PartnerOrdersPagination } from "./partner-orders-pagination";
import type { PartnerOrderListItemDTO } from "@/dal/partner-order.dal";

interface PartnerOrdersListViewProps {
  orders: PartnerOrderListItemDTO[];
  totalItems: number;
  currentPage: number;
  pageSize: number;
}

export function PartnerOrdersListView({
  orders,
  totalItems,
  currentPage,
  pageSize,
}: PartnerOrdersListViewProps) {
  const {
    notifyOrders,
    pendingOrderId,
    handleAccept,
    handleMarkReceived,
    handleStartWashing,
    handleMarkReady,
    handleHandover,
    setDetailOrder,
    setTicketOrder,
    setIssueOrder,
    setRejectOrder,
    handlePageChange,
    handlePageSizeChange,
  } = usePartnerOrdersActions();

  useEffect(() => {
    notifyOrders(orders.map((o) => o.id));
  }, [orders, notifyOrders]);

  return (
    <>
      <PartnerOrdersCardList
        orders={orders}
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
        orders={orders}
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
  );
}

