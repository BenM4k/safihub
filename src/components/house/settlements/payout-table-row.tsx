"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, CheckCircle2, ChevronRight, Copy, FileText, XCircle } from "lucide-react";
import { formatMoney } from "@/lib/cash-formatters";
import type { PartnerPayoutDTO } from "@/types/partner-settlements";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface PayoutTableRowProps {
  payout: PartnerPayoutDTO;
  methodLabel: string;
  onSelectPayout: (payout: PartnerPayoutDTO) => void;
  onOpenReportDialog: (payout: PartnerPayoutDTO) => void;
  onOpenReceiptModal: (payout: PartnerPayoutDTO) => void;
}

export function PayoutTableRow({
  payout: p,
  methodLabel,
  onSelectPayout,
  onOpenReportDialog,
  onOpenReceiptModal,
}: PayoutTableRowProps) {
  const t = useTranslations("house.settlements");
  const [copiedRef, setCopiedRef] = useState<string | null>(null);

  function handleCopyReference(e: React.MouseEvent, ref: string) {
    e.stopPropagation();
    navigator.clipboard.writeText(ref);
    setCopiedRef(ref);
    setTimeout(() => setCopiedRef(null), 2000);
  }

  return (
    <TableRow
      tabIndex={0}
      role="button"
      onClick={() => onSelectPayout(p)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelectPayout(p);
        }
      }}
      className="cursor-pointer group"
    >
      <TableCell className="font-mono font-medium text-foreground">
        {new Intl.DateTimeFormat("fr-FR", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          timeZone: "Africa/Lubumbashi",
        }).format(new Date(p.date))}
      </TableCell>

      <TableCell className="text-muted-foreground">
        {p.periodCovered || t("defaultPayoutNote")}
      </TableCell>

      <TableCell className="text-foreground font-medium">{methodLabel}</TableCell>

      <TableCell className="font-mono font-bold text-success text-right tabular-nums text-sm">
        +{formatMoney(p.amount, "CDF")}
      </TableCell>

      <TableCell className="text-center">
        {p.status === "paid" ? (
          <Badge variant="outline" className="gap-1 rounded-full border-success/30 text-success bg-success-soft/30 text-2xs font-semibold">
            <CheckCircle2 className="size-3" />
            <span>{t("statusPaid")}</span>
          </Badge>
        ) : (
          <Badge variant="destructive" className="gap-1 rounded-full text-2xs font-bold">
            <XCircle className="size-3" />
            <span>{t("statusCancelled")}</span>
          </Badge>
        )}
      </TableCell>

      <TableCell className="font-mono text-2xs text-foreground">
        {p.reference ? (
          <button
            type="button"
            onClick={(e) => handleCopyReference(e, p.reference!)}
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-muted hover:bg-muted/80 transition text-muted-foreground hover:text-foreground cursor-pointer"
            title={t("copyRef")}
          >
            <span>{p.reference}</span>
            {copiedRef === p.reference ? (
              <Check className="size-3 text-success" />
            ) : (
              <Copy className="size-3" />
            )}
          </button>
        ) : (
          "—"
        )}
      </TableCell>

      <TableCell className="text-center">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onOpenReceiptModal(p);
          }}
          className="size-8 p-0 text-primary hover:text-primary hover:bg-primary/10 rounded-lg cursor-pointer"
          title={t("viewReceiptAria")}
          aria-label={t("viewReceiptAria")}
        >
          <FileText className="size-4" />
        </Button>
      </TableCell>

      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenReportDialog(p);
            }}
            className="text-2xs text-muted-foreground hover:text-destructive transition underline-offset-2 hover:underline cursor-pointer"
          >
            {t("report")}
          </button>
          <ChevronRight className="size-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition" />
        </div>
      </TableCell>
    </TableRow>
  );
}
