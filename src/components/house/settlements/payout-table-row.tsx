import { useState } from "react";
import { Check, CheckCircle2, ChevronRight, Copy, FileText, XCircle } from "lucide-react";
import { formatMoney } from "@/lib/cash-formatters";
import type { PartnerPayoutDTO } from "@/types/partner-settlements";
import { Button } from "@/components/ui/button";

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
  const [copiedRef, setCopiedRef] = useState<string | null>(null);

  function handleCopyReference(e: React.MouseEvent, ref: string) {
    e.stopPropagation();
    navigator.clipboard.writeText(ref);
    setCopiedRef(ref);
    setTimeout(() => setCopiedRef(null), 2000);
  }

  return (
    <tr
      tabIndex={0}
      role="button"
      onClick={() => onSelectPayout(p)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelectPayout(p);
        }
      }}
      className="hover:bg-surface/70 transition cursor-pointer group focus-visible:outline-hidden focus-visible:bg-surface"
    >
      <td className="py-3 px-4 font-mono font-medium text-heading">
        {new Intl.DateTimeFormat("fr-FR", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          timeZone: "Africa/Lubumbashi",
        }).format(new Date(p.date))}
      </td>

      <td className="py-3 px-4 text-muted-foreground">
        {p.periodCovered || "Règlement périodique"}
      </td>

      <td className="py-3 px-4 text-heading font-medium">{methodLabel}</td>

      <td className="py-3 px-4 font-mono font-bold text-success-base text-right tabular-nums text-sm">
        +{formatMoney(p.amount, "CDF")}
      </td>

      <td className="py-3 px-4 text-center">
        {p.status === "paid" ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-success-light text-success-base text-2xs font-semibold border border-success-base/30">
            <CheckCircle2 className="size-3" />
            Payé
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-destructive-light text-destructive-base text-2xs font-bold border border-destructive-base/30">
            <XCircle className="size-3" />
            Annulé
          </span>
        )}
      </td>

      <td className="py-3 px-4 font-mono text-2xs text-heading">
        {p.reference ? (
          <button
            type="button"
            onClick={(e) => handleCopyReference(e, p.reference!)}
            className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-surface hover:bg-surface-hover border border-border transition text-muted-foreground hover:text-heading cursor-pointer"
            title="Copier la référence"
          >
            <span>{p.reference}</span>
            {copiedRef === p.reference ? (
              <Check className="size-3 text-success-base" />
            ) : (
              <Copy className="size-3" />
            )}
          </button>
        ) : (
          "—"
        )}
      </td>

      <td className="py-3 px-4 text-center">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onOpenReceiptModal(p);
          }}
          className="size-8 p-0 text-primary hover:text-primary-hover hover:bg-primary-soft rounded-lg cursor-pointer"
          title="Voir le reçu de versement"
          aria-label="Voir le reçu de versement"
        >
          <FileText className="size-4" />
        </Button>
      </td>

      <td className="py-3 px-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenReportDialog(p);
            }}
            className="text-2xs text-muted-foreground hover:text-destructive-base transition underline-offset-2 hover:underline cursor-pointer"
          >
            Signaler
          </button>
          <ChevronRight className="size-4 text-muted-foreground group-hover:text-heading group-hover:translate-x-0.5 transition" />
        </div>
      </td>
    </tr>
  );
}
