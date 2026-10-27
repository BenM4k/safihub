import { useTranslations } from "next-intl";
import type { PartnerOrderListItemDTO } from "@/dal/partner-order.dal";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PartnerOrdersTableRow } from "./partner-orders-table-row";

interface PartnerOrdersTableProps {
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

/**
 * Desktop table for partner orders using shadcn Table primitives and AC 15 privacy.
 */
export function PartnerOrdersTable({
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
}: PartnerOrdersTableProps) {
  const t = useTranslations("house.orders");

  return (
    <div className="hidden lg:block rounded-2xl border border-border bg-card shadow-xs overflow-hidden font-sans">
      <Table>
        <TableHeader className="bg-muted/40 font-semibold border-b border-border">
          <TableRow>
            <TableHead className="py-3 px-4 text-xs">{t("thOrder")}</TableHead>
            <TableHead className="py-3 px-4 text-xs">
              {t("thCustomer")}
            </TableHead>
            <TableHead className="py-3 px-4 text-xs">
              {t("thItemsServices")}
            </TableHead>
            <TableHead className="py-3 px-4 text-xs">
              {t("thDeadline")}
            </TableHead>
            <TableHead className="py-3 px-4 text-xs text-right">
              {t("thAmountShare")}
            </TableHead>
            <TableHead className="py-3 px-4 text-xs text-center">
              {t("thAction")}
            </TableHead>
            <TableHead className="py-3 px-3 text-xs text-center w-12">
              <span className="sr-only">{t("thActionsSecondary")}</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-border">
          {orders.map((order) => (
            <PartnerOrdersTableRow
              key={order.id}
              order={order}
              isPending={pendingOrderId === order.id}
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
        </TableBody>
      </Table>
    </div>
  );
}
