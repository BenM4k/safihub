"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, Eye, MoreHorizontal, Printer, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import type { PartnerOrderListItemDTO } from "@/dal/partner-order.dal";

interface PartnerOrderSecondaryMenuProps {
  order: PartnerOrderListItemDTO;
  onOpenDetail: (order: PartnerOrderListItemDTO) => void;
  onOpenTicket: (order: PartnerOrderListItemDTO) => void;
  onOpenIssue: (order: PartnerOrderListItemDTO) => void;
  onOpenReject: (order: PartnerOrderListItemDTO) => void;
}

export function PartnerOrderSecondaryMenu({
  order,
  onOpenDetail,
  onOpenTicket,
  onOpenIssue,
  onOpenReject,
}: PartnerOrderSecondaryMenuProps) {
  const t = useTranslations("house.orders");
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        aria-label="Actions secondaires de la commande"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] sm:min-w-[36px] sm:min-h-[36px] rounded-lg border border-border bg-card text-foreground hover:bg-surface transition-colors cursor-pointer"
      >
        <MoreHorizontal className="size-4" aria-hidden="true" />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-30 mt-1 w-52 origin-top-right rounded-xl border border-border bg-card p-1.5 shadow-xl animate-in fade-in zoom-in-95 font-sans">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onOpenDetail(order);
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-foreground hover:bg-surface cursor-pointer text-left"
          >
            <Eye className="size-4 text-primary shrink-0" />
            <span>{t("actionViewDetails")}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onOpenTicket(order);
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-foreground hover:bg-surface cursor-pointer text-left"
          >
            <Printer className="size-4 text-muted-foreground shrink-0" />
            <span>{t("actionPrintTicket")}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onOpenIssue(order);
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 cursor-pointer text-left"
          >
            <AlertCircle className="size-4 text-amber-600 shrink-0" />
            <span>{t("actionReportIssue")}</span>
          </button>

          {order.status === "created" && (
            <div className="mt-1 pt-1 border-t border-border">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenReject(order);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-destructive hover:bg-destructive-soft cursor-pointer text-left"
              >
                <XCircle className="size-4 text-destructive shrink-0" />
                <span>{t("reject")}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
