"use client";

import { CheckCircle2, FileText } from "lucide-react";
import { formatMoney } from "@/lib/cash-formatters";
import type { PartnerPayoutDTO } from "@/types/partner-settlements";
import { EmptyState } from "@/components/shared";

interface PayoutsMobileListProps {
  payouts: PartnerPayoutDTO[];
  methodLabels: Record<string, string>;
  onSelectPayout: (payout: PartnerPayoutDTO) => void;
  onOpenReportDialog: (payout: PartnerPayoutDTO) => void;
  onOpenReceiptModal: (payout: PartnerPayoutDTO) => void;
}

export function PayoutsMobileList({
  payouts,
  methodLabels,
  onSelectPayout,
  onOpenReportDialog,
  onOpenReceiptModal,
}: PayoutsMobileListProps) {
  if (payouts.length === 0) {
    return (
      <EmptyState
        title="Aucun versement"
        description="Aucun versement enregistré pour cette période."
      />
    );
  }

  return (
    <div className="md:hidden space-y-3">
      {payouts.map((p) => (
        <div
          key={p.id}
          onClick={() => onSelectPayout(p)}
          className="p-4 rounded-xl bg-surface border border-border shadow-2xs space-y-2.5 cursor-pointer active:scale-[0.99] transition"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-xs text-muted-foreground">
              {new Intl.DateTimeFormat("fr-FR", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }).format(new Date(p.date))}
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-success-light text-success-base text-2xs font-semibold border border-success-base/30">
              <CheckCircle2 className="size-3" />
              Payé
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-xs text-muted-foreground block">
                {methodLabels[p.method] || p.method}
              </span>
              {p.reference && (
                <span className="font-mono text-2xs text-heading font-semibold">
                  {p.reference}
                </span>
              )}
            </div>

            <div className="font-mono font-bold text-lg text-success-base tabular-nums">
              +{formatMoney(p.amount, "CDF")}
            </div>
          </div>

          <div className="pt-2 border-t border-border flex items-center justify-between text-2xs text-muted-foreground">
            <span>{p.ordersCount} commande(s) incluse(s)</span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenReceiptModal(p);
                }}
                className="text-primary font-semibold hover:underline flex items-center gap-1 p-1 min-h-[44px]"
              >
                <FileText className="size-3.5" />
                <span>Reçu</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenReportDialog(p);
                }}
                className="text-muted-foreground hover:text-destructive-base underline p-1 min-h-[44px] flex items-center"
              >
                Signaler
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
