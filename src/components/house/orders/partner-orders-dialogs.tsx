"use client";

import dynamic from "next/dynamic";
import type { PartnerOrderListItemDTO } from "@/dal/partner-order.dal";

const PartnerOrderDetailSheet = dynamic(
  () =>
    import("./partner-order-detail-sheet").then(
      (m) => m.PartnerOrderDetailSheet
    ),
  { ssr: false }
);

const PartnerOrderRejectDialog = dynamic(
  () =>
    import("./partner-order-reject-dialog").then(
      (m) => m.PartnerOrderRejectDialog
    ),
  { ssr: false }
);

const PartnerOrderIssueDialog = dynamic(
  () =>
    import("./partner-order-issue-dialog").then(
      (m) => m.PartnerOrderIssueDialog
    ),
  { ssr: false }
);

const PartnerOrderTicketDialog = dynamic(
  () =>
    import("./partner-order-ticket-dialog").then(
      (m) => m.PartnerOrderTicketDialog
    ),
  { ssr: false }
);

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
      {detailOrder && (
        <PartnerOrderDetailSheet
          order={detailOrder}
          houseSlug={houseSlug}
          isOpen={Boolean(detailOrder)}
          onClose={() => setDetailOrder(null)}
        />
      )}

      {ticketOrder && (
        <PartnerOrderTicketDialog
          order={ticketOrder}
          isOpen={Boolean(ticketOrder)}
          onClose={() => setTicketOrder(null)}
        />
      )}

      {rejectOrder && (
        <PartnerOrderRejectDialog
          order={rejectOrder}
          isOpen={Boolean(rejectOrder)}
          onClose={() => setRejectOrder(null)}
          onConfirm={onReject}
        />
      )}

      {issueOrder && (
        <PartnerOrderIssueDialog
          order={issueOrder}
          isOpen={Boolean(issueOrder)}
          onClose={() => setIssueOrder(null)}
          onConfirm={onReportIssue}
        />
      )}
    </>
  );
}
