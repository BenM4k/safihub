"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { CheckCircle2, Clock, ExternalLink, ShieldAlert } from "lucide-react";
import { formatMoney } from "@/lib/cash-formatters";
import type { PartnerDeliveredOrderDTO } from "@/types/partner-settlements";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface DeliveredOrderTableRowProps {
  order: PartnerDeliveredOrderDTO;
  houseSlug: string;
  onOpenReportDialog: (order: PartnerDeliveredOrderDTO) => void;
}

export function DeliveredOrderTableRow({
  order: o,
  houseSlug,
  onOpenReportDialog,
}: DeliveredOrderTableRowProps) {
  const t = useTranslations("house.settlements");

  return (
    <TableRow className="group">
      <TableCell className="font-mono font-bold text-foreground">
        <Link
          href={`/partner/${houseSlug}/orders?search=${o.code}`}
          className="hover:text-primary transition underline-offset-4 hover:underline flex items-center gap-1 min-h-[32px]"
        >
          <span>{o.shortReference}</span>
          <ExternalLink className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition" />
        </Link>
      </TableCell>

      <TableCell className="text-foreground font-medium">
        {o.customerDisplayName}
      </TableCell>

      <TableCell className="text-muted-foreground font-mono text-2xs">
        {o.deliveredAt
          ? new Intl.DateTimeFormat("fr-FR", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "Africa/Lubumbashi",
            }).format(new Date(o.deliveredAt))
          : "—"}
      </TableCell>

      <TableCell className="font-mono tabular-nums text-right text-foreground">
        {formatMoney(o.itemsTotal, "CDF")}
      </TableCell>

      <TableCell className="font-mono tabular-nums text-right text-muted-foreground">
        -{formatMoney(o.commissionAmount, "CDF")}
      </TableCell>

      <TableCell className="font-mono tabular-nums text-right font-bold text-success">
        {formatMoney(o.netReceivable, "CDF")}
      </TableCell>

      <TableCell className="text-center">
        {o.settlementStatus === "settled" ? (
          <Badge variant="outline" className="gap-1 rounded-full border-success/30 text-success bg-success-soft/30 text-2xs font-semibold">
            <CheckCircle2 className="size-3" />
            <span>{t("statusSettled")}</span>
          </Badge>
        ) : o.settlementStatus === "disputed" ? (
          <Badge variant="destructive" className="gap-1 rounded-full text-2xs font-bold">
            <ShieldAlert className="size-3" />
            <span>{t("statusDisputed")}</span>
          </Badge>
        ) : (
          <Badge variant="outline" className="gap-1 rounded-full border-amber-500/30 text-amber-800 dark:text-amber-300 text-2xs font-medium">
            <Clock className="size-3" />
            <span>{t("statusPending")}</span>
          </Badge>
        )}
      </TableCell>

      <TableCell className="font-mono text-2xs text-muted-foreground">
        {o.settlementReference ? (
          <span className="font-semibold text-foreground bg-muted px-2 py-0.5 rounded">
            {o.settlementReference}
          </span>
        ) : (
          "—"
        )}
      </TableCell>

      <TableCell className="text-right">
        <button
          type="button"
          onClick={() => onOpenReportDialog(o)}
          className="text-2xs text-muted-foreground hover:text-destructive transition underline-offset-2 hover:underline cursor-pointer min-h-[32px] px-1"
        >
          {t("report")}
        </button>
      </TableCell>
    </TableRow>
  );
}
