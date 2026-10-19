import Link from "next/link";
import { CheckCircle2, Clock, ExternalLink, ShieldAlert } from "lucide-react";
import { formatMoney } from "@/lib/cash-formatters";
import type { PartnerDeliveredOrderDTO } from "@/types/partner-settlements";

interface DeliveredOrderTableRowProps {
  order: PartnerDeliveredOrderDTO;
  houseSlug: string;
  onOpenReportDialog: (order: PartnerDeliveredOrderDTO) => void;
}

export function DeliveredOrderTableRow({
  order,
  houseSlug,
  onOpenReportDialog,
}: DeliveredOrderTableRowProps) {
  const o = order;

  return (
    <tr className="hover:bg-surface/60 transition group">
      <td className="py-3 px-4 font-mono font-bold text-heading">
        <Link
          href={`/partner/${houseSlug}/orders?search=${o.code}`}
          className="hover:text-primary transition underline-offset-4 hover:underline flex items-center gap-1 min-h-[32px]"
        >
          <span>{o.shortReference}</span>
          <ExternalLink className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition" />
        </Link>
      </td>

      <td className="py-3 px-4 text-heading font-medium">
        {o.customerDisplayName}
      </td>

      <td className="py-3 px-4 text-muted-foreground font-mono text-2xs">
        {o.deliveredAt
          ? new Intl.DateTimeFormat("fr-FR", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "Africa/Lubumbashi",
            }).format(new Date(o.deliveredAt))
          : "—"}
      </td>

      <td className="py-3 px-4 font-mono tabular-nums text-right text-heading">
        {formatMoney(o.itemsTotal, "CDF")}
      </td>

      <td className="py-3 px-4 font-mono tabular-nums text-right text-muted-foreground">
        -{formatMoney(o.commissionAmount, "CDF")}
      </td>

      <td className="py-3 px-4 font-mono tabular-nums text-right font-bold text-primary">
        {formatMoney(o.netReceivable, "CDF")}
      </td>

      <td className="py-3 px-4 text-center">
        {o.settlementStatus === "settled" ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-success-light text-success-base text-2xs font-semibold border border-success-base/30">
            <CheckCircle2 className="size-3" />
            Inclus
          </span>
        ) : o.settlementStatus === "disputed" ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-destructive-light text-destructive-base text-2xs font-bold border border-destructive-base/30">
            <ShieldAlert className="size-3" />
            Litige
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-300 text-2xs font-medium border border-amber-500/20">
            <Clock className="size-3" />
            En attente
          </span>
        )}
      </td>

      <td className="py-3 px-4 font-mono text-2xs text-muted-foreground">
        {o.settlementReference ? (
          <span className="font-semibold text-heading bg-surface px-2 py-1 rounded border border-border">
            {o.settlementReference}
          </span>
        ) : (
          "—"
        )}
      </td>

      <td className="py-3 px-4 text-right">
        <button
          type="button"
          onClick={() => onOpenReportDialog(o)}
          className="text-2xs text-muted-foreground hover:text-destructive-base transition underline-offset-2 hover:underline cursor-pointer min-h-[32px] px-1"
        >
          Signaler
        </button>
      </td>
    </tr>
  );
}
