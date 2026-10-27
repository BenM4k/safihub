"use client";

import type { PartnerOrderListItemDTO } from "@/dal/partner-order.dal";
import { PartnerOrderCard } from "./partner-order-card";

interface PartnerOrdersCardListProps {
  orders: PartnerOrderListItemDTO[];
  pendingOrderId: string | null;
  onAccept: (orderId: string) => void;
  onMarkReceived: (orderId: string) => void;
  onStartWashing: (orderId: string) => void;
  onMarkReady: (orderId: string) => void;
  onHandover: (orderId: string) => void;
  onOpenDetail: (order: PartnerOrderListItemDTO) => void;
  onOpenTicket: (order: PartnerOrderListItemDTO) => void;
  onOpenIssue: (order: PartnerOrderListItemDTO) => void;
  onOpenReject: (order: PartnerOrderListItemDTO) => void;
}

export function PartnerOrdersCardList({
  orders,
  pendingOrderId,
  onAccept,
  onMarkReceived,
  onStartWashing,
  onMarkReady,
  onHandover,
  onOpenDetail,
  onOpenTicket,
  onOpenIssue,
  onOpenReject,
}: PartnerOrdersCardListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4 lg:hidden">
      {orders.map((order) => (
        <PartnerOrderCard
          key={order.id}
          order={order}
          isActionPending={pendingOrderId === order.id}
          onAccept={onAccept}
          onMarkReceived={onMarkReceived}
          onStartWashing={onStartWashing}
          onMarkReady={onMarkReady}
          onHandover={onHandover}
          onOpenDetail={onOpenDetail}
          onOpenTicket={onOpenTicket}
          onOpenIssue={onOpenIssue}
          onOpenReject={onOpenReject}
        />
      ))}
    </div>
  );
}
