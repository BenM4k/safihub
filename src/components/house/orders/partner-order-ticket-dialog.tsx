"use client";

import { useRef } from "react";
import { Printer, QrCode } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { PartnerOrderListItemDTO } from "@/dal/partner-order.dal";
import { formatAmount, formatDateTime } from "@/lib/order-formatters";

interface PartnerOrderTicketDialogProps {
  order: PartnerOrderListItemDTO | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PartnerOrderTicketDialog({
  order,
  isOpen,
  onClose,
}: PartnerOrderTicketDialogProps) {
  const t = useTranslations("house.orders");
  const ticketRef = useRef<HTMLDivElement>(null);

  if (!order) return null;

  function handlePrint() {
    window.print();
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Printer className="size-4 text-primary" />
            <DialogTitle className="text-sm font-bold text-heading">
              {t("ticketTitle")}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            {t("orderCodeLabel", { code: order.shortReference })}
          </DialogDescription>
        </DialogHeader>

        {/* Printable Ticket Area */}
        <div
          ref={ticketRef}
          className="p-4 bg-white text-slate-950 rounded-xl border border-dashed border-slate-300 font-mono text-xs space-y-3 print:border-none print:p-0"
        >
          {/* Header */}
          <div className="text-center space-y-0.5 border-b border-dashed border-slate-300 pb-2.5">
            <div className="text-sm font-black tracking-wider uppercase">SafiHub Pressing</div>
            <div className="text-lg font-black">{order.shortReference}</div>
            <div className="text-[10px] text-slate-500">{order.code}</div>
          </div>

          {/* QR representation placeholder / SVG */}
          <div className="flex flex-col items-center justify-center py-1">
            <div className="p-2 border border-slate-900 rounded-lg bg-slate-50 flex items-center justify-center">
              <QrCode className="size-20 text-slate-900" />
            </div>
            <span className="text-[9px] text-slate-500 mt-1 uppercase">{t("ticketScanNote")}</span>
          </div>

          {/* Customer & Location (AC 15 Customer Privacy Firewall: No Phone) */}
          <div className="border-t border-dashed border-slate-300 pt-2 space-y-1 text-[11px]">
            <div><strong>{t("customer")} :</strong> {order.customerDisplayName}</div>
            <div><strong>{t("neighborhood")} :</strong> {order.neighborhoodName}</div>
          </div>

          {/* Items & Services */}
          <div className="border-t border-dashed border-slate-300 pt-2 space-y-1 text-[11px]">
            <div><strong>{t("itemsCount")} :</strong> {order.itemsSummary}</div>
            <div><strong>{t("services")} :</strong> {order.services.join(", ")}</div>
            {order.estimatedDeliveryAt && (
              <div><strong>{t("promisedDate")} :</strong> {formatDateTime(order.estimatedDeliveryAt)}</div>
            )}
          </div>

          {/* Amount */}
          <div className="border-t border-dashed border-slate-300 pt-2 text-right">
            <div className="text-xs">{t("financialItemsTotal")} : <strong>{formatAmount(order.itemsTotal, order.currency)}</strong></div>
            <div className="text-xs text-slate-700">{t("partnerShare")} : <strong>{formatAmount(order.netPartnerShare, order.currency)}</strong></div>
          </div>
        </div>

        <DialogFooter className="flex flex-row items-center justify-end gap-2.5 pt-3 border-t border-border sm:space-x-0">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="flex-1 sm:flex-initial text-xs font-semibold cursor-pointer h-10 sm:h-9"
          >
            {t("close")}
          </Button>
          <Button
            type="button"
            onClick={handlePrint}
            className="flex-1 sm:flex-initial bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs cursor-pointer h-10 sm:h-9"
          >
            <Printer className="size-3.5 mr-1.5" />
            <span>{t("ticketPrintBtn")}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
