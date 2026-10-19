"use client";

import Link from "next/link";
import { CheckCircle2, Clock, ShieldAlert } from "lucide-react";
import { formatMoney } from "@/lib/cash-formatters";
import type { PartnerDeliveredOrderDTO } from "@/types/partner-settlements";
import { EmptyState } from "@/components/shared";

interface DeliveredOrdersMobileListProps {
  orders: PartnerDeliveredOrderDTO[];
  houseSlug: string;
  totals: { itemsTotal: number; commission: number; net: number };
  onOpenReportDialog: (order: PartnerDeliveredOrderDTO) => void;
}

export function DeliveredOrdersMobileList({
  orders,
  houseSlug,
  totals,
  onOpenReportDialog,
}: DeliveredOrdersMobileListProps) {
  if (orders.length === 0) {
    return (
      <div className="md:hidden">
        <EmptyState
          title="Aucune commande livrée"
          description="Aucune commande livrée trouvée pour cette période."
        />
      </div>
    );
  }

  return (
    <div className="md:hidden space-y-3">
      {orders.map((o) => (
        <div
          key={o.id}
          className="p-4 rounded-xl bg-surface border border-border shadow-2xs space-y-2.5"
        >
          <div className="flex items-center justify-between gap-2">
            <Link
              href={`/partner/${houseSlug}/orders?search=${o.code}`}
              className="font-mono font-bold text-sm text-heading hover:text-primary transition min-h-[44px] flex items-center"
            >
              {o.shortReference}
            </Link>

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
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-800 text-2xs font-medium border border-amber-500/20">
                <Clock className="size-3" />
                En attente
              </span>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Client : {o.customerDisplayName}</span>
            <span className="font-mono text-2xs">
              {o.deliveredAt
                ? new Intl.DateTimeFormat("fr-FR", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(new Date(o.deliveredAt))
                : "—"}
            </span>
          </div>

          <div className="pt-2 border-t border-border/80 flex items-center justify-between">
            <div className="text-2xs text-muted-foreground">
              Brut: {formatMoney(o.itemsTotal)} · Com: -{formatMoney(o.commissionAmount)}
            </div>
            <div className="font-mono font-bold text-sm text-primary tabular-nums">
              {formatMoney(o.netReceivable, "CDF")}
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 text-2xs">
            {o.settlementReference ? (
              <span className="text-muted-foreground">
                Versement : <strong className="text-heading font-mono">{o.settlementReference}</strong>
              </span>
            ) : (
              <span className="text-muted-foreground">Règlement à venir</span>
            )}

            <button
              type="button"
              onClick={() => onOpenReportDialog(o)}
              className="text-muted-foreground hover:text-destructive-base transition underline cursor-pointer p-1 min-h-[44px] flex items-center"
            >
              Signaler un problème
            </button>
          </div>
        </div>
      ))}

      {/* Mobile Totals Card */}
      <div className="p-4 rounded-xl bg-surface border-2 border-primary/20 space-y-1 text-xs">
        <div className="flex justify-between text-muted-foreground">
          <span>Articles brut ({orders.length} cmd) :</span>
          <span className="font-mono font-bold text-heading">{formatMoney(totals.itemsTotal)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Commissions SafiHub :</span>
          <span className="font-mono text-destructive-base">-{formatMoney(totals.commission)}</span>
        </div>
        <div className="flex justify-between pt-2 border-t border-border font-bold text-heading">
          <span>Net total à percevoir :</span>
          <span className="font-mono text-primary text-base font-black">{formatMoney(totals.net)}</span>
        </div>
      </div>
    </div>
  );
}
