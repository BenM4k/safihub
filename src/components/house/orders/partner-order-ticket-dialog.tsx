"use client";

import { useRef } from "react";
import { Printer, QrCode, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
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

  if (!isOpen || !order) return null;

  function handlePrint() {
    window.print();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ticket-dialog-title"
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
    >
      <div className="bg-card rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-border space-y-4 font-sans">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Printer className="size-4 text-primary" />
            <h3 id="ticket-dialog-title" className="text-sm font-bold text-heading">
              {t("ticketTitle")}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="text-muted-foreground hover:text-foreground p-1 rounded-lg"
          >
            <X className="size-4" />
          </button>
        </div>

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
            <span className="text-[9px] text-slate-500 mt-1 uppercase">Scan coursier / atelier</span>
          </div>

          {/* Customer & Location */}
          <div className="border-t border-dashed border-slate-300 pt-2 space-y-1 text-[11px]">
            <div><strong>Client :</strong> {order.customerDisplayName}</div>
            {order.customerPhone && <div><strong>Tél :</strong> {order.customerPhone}</div>}
            <div><strong>Quartier :</strong> {order.neighborhoodName}</div>
          </div>

          {/* Items & Services */}
          <div className="border-t border-dashed border-slate-300 pt-2 space-y-1 text-[11px]">
            <div><strong>Articles :</strong> {order.itemsSummary}</div>
            <div><strong>Services :</strong> {order.services.join(", ")}</div>
            {order.estimatedDeliveryAt && (
              <div><strong>Promis le :</strong> {formatDateTime(order.estimatedDeliveryAt)}</div>
            )}
          </div>

          {/* Amount */}
          <div className="border-t border-dashed border-slate-300 pt-2 text-right">
            <div className="text-xs">Total : <strong>{formatAmount(order.totalDue, order.currency)}</strong></div>
            <div className="text-xs text-slate-700">Part atelier : <strong>{formatAmount(order.netPartnerShare, order.currency)}</strong></div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-xs min-h-[44px] sm:min-h-[36px]"
          >
            Fermer
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handlePrint}
            className="bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs min-h-[44px] sm:min-h-[36px]"
          >
            <Printer className="size-3.5 mr-1.5" />
            <span>{t("ticketPrintBtn")}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
