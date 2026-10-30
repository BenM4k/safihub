"use client";

import type { PartnerOrderListItemDTO } from "@/dal/partner-order.dal";
import { PartnerOrderDetailSheet } from "./partner-order-detail-sheet";
import { PartnerOrderRejectDialog } from "./partner-order-reject-dialog";
import { PartnerOrderIssueDialog } from "./partner-order-issue-dialog";
import { PartnerOrderTicketDialog } from "./partner-order-ticket-dialog";

interface PartnerOrdersDialogsProps {
  houseSlug: string;
  detailOrder: PartnerOrderListItemDTO | null;
  setDetailOrder: (order: PartnerOrderListItemDTO | null) => void;
  ticketOrder: PartnerOrderListItemDTO | null;
  setTicketOrder: (order: PartnerOrderListItemDTO | null) => void;
  rejectOrder: PartnerOrderListItemDTO | null;
  setRejectOrder: (order: PartnerOrderListItemDTO | null) => void;
  issueOrder: PartnerOrderListItemDTO | null;
  setIssueOrder: (order: PartnerOrderListItemDTO | null) => void;
  onReject: (orderId: string, reason: string) => Promise<void>;
  onReportIssue: (orderId: string, reason: string, note?: string) => Promise<void>;
}

export function PartnerOrdersDialogs({
  houseSlug,
  detailOrder,
  setDetailOrder,
  ticketOrder,
  setTicketOrder,
  rejectOrder,
  setRejectOrder,
  issueOrder,
  setIssueOrder,
  onReject,
  onReportIssue,
}: PartnerOrdersDialogsProps) {
  return (
    <>
      <PartnerOrderDetailSheet
        order={detailOrder}
        houseSlug={houseSlug}
        isOpen={Boolean(detailOrder)}
        onClose={() => setDetailOrder(null)}
      />

      <PartnerOrderTicketDialog
        order={ticketOrder}
        isOpen={Boolean(ticketOrder)}
        onClose={() => setTicketOrder(null)}
      />

      <PartnerOrderRejectDialog
        order={rejectOrder}
        isOpen={Boolean(rejectOrder)}
        onClose={() => setRejectOrder(null)}
        onConfirm={onReject}
      />

      <PartnerOrderIssueDialog
        order={issueOrder}
        isOpen={Boolean(issueOrder)}
        onClose={() => setIssueOrder(null)}
        onConfirm={onReportIssue}
      />
    </>
  );
}
