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

      <DropdownMenuContent align="end" className="w-52 font-sans">
        <DropdownMenuItem onClick={() => onOpenDetail(order)} className="gap-2.5 text-xs">
          <Eye className="size-4 text-primary shrink-0" />
          <span>{t("actionViewDetails")}</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => onOpenTicket(order)} className="gap-2.5 text-xs">
          <Printer className="size-4 text-muted-foreground shrink-0" />
          <span>{t("actionPrintTicket")}</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => onOpenIssue(order)}
          className="gap-2.5 text-xs text-amber-600 dark:text-amber-400 focus:text-amber-700 dark:focus:text-amber-300"
        >
          <AlertCircle className="size-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>{t("actionReportIssue")}</span>
        </DropdownMenuItem>

        {order.status === "created" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onOpenReject(order)}
              className="gap-2.5 text-xs text-destructive focus:text-destructive"
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
