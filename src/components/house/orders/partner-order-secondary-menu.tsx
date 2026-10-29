"use client";

import { AlertCircle, Eye, MoreHorizontal, Printer, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={t("secondaryActionsAria")}
          className="size-9 rounded-lg"
        >
          <MoreHorizontal className="size-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 font-sans p-1.5 rounded-xl bg-card border border-border shadow-lift space-y-0.5">
        <DropdownMenuItem onClick={() => onOpenDetail(order)} className="gap-2.5 text-xs font-semibold px-2.5 py-2 rounded-lg cursor-pointer">
          <Eye className="size-4 text-primary shrink-0" />
          <span>{t("actionViewDetails")}</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => onOpenTicket(order)} className="gap-2.5 text-xs font-semibold px-2.5 py-2 rounded-lg cursor-pointer">
          <Printer className="size-4 text-muted-foreground shrink-0" />
          <span>{t("actionPrintTicket")}</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => onOpenIssue(order)}
          className="gap-2.5 text-xs font-semibold px-2.5 py-2 rounded-lg cursor-pointer text-amber-600 dark:text-amber-400 focus:text-amber-700 dark:focus:text-amber-300"
        >
          <AlertCircle className="size-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>{t("actionReportIssue")}</span>
        </DropdownMenuItem>

        {order.status === "created" && (
          <>
            <DropdownMenuSeparator className="my-1 bg-border/60" />
            <DropdownMenuItem
              onClick={() => onOpenReject(order)}
              className="gap-2.5 text-xs font-semibold px-2.5 py-2 rounded-lg cursor-pointer text-destructive focus:text-destructive"
            >
              <XCircle className="size-4 text-destructive shrink-0" />
              <span>{t("reject")}</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
