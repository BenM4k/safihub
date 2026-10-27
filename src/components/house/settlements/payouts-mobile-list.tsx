"use client";

import { useTranslations } from "next-intl";
import { CheckCircle2, FileText } from "lucide-react";
import { formatMoney } from "@/lib/cash-formatters";
import type { PartnerPayoutDTO } from "@/types/partner-settlements";
import { EmptyState } from "@/components/shared";
import { Badge } from "@/components/ui/badge";

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
  const t = useTranslations("house.settlements");

  if (payouts.length === 0) {
    return (
      <div className="md:hidden">
        <EmptyState
          title={t("noPayouts")}
          description={t("noDeliveredOrdersDesc")}
        />
      </div>
    );
  }

  return (
    <div className="md:hidden rounded-2xl border border-border/60 bg-card overflow-hidden divide-y divide-border/60 shadow-xs">
      {payouts.map((p) => (
        <div
          key={p.id}
          role="button"
          tabIndex={0}
          onClick={() => onSelectPayout(p)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSelectPayout(p);
            }
          }}
          className="p-4 space-y-2.5 cursor-pointer hover:bg-muted/30 active:bg-muted/50 transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-xs text-muted-foreground">
              {new Intl.DateTimeFormat("fr-FR", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }).format(new Date(p.date))}
            </span>

            <Badge variant="outline" className="gap-1 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-2xs font-semibold">
              <CheckCircle2 className="size-3" />
              <span>{t("statusPaid")}</span>
            </Badge>
          </div>

          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-xs text-muted-foreground block">
                {methodLabels[p.method] || p.method}
              </span>
              {p.reference && (
                <span className="font-mono text-2xs text-foreground font-semibold">
                  {p.reference}
                </span>
              )}
            </div>

            <div className="font-mono font-bold text-lg text-emerald-600 dark:text-emerald-400 tabular-nums">
              +{formatMoney(p.amount, "CDF")}
            </div>
          </div>

          <div className="pt-2 border-t border-border/60 flex items-center justify-between text-2xs text-muted-foreground">
            <span>{t("ordersIncluded", { count: p.ordersCount })}</span>

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
                <span>{t("receipt")}</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenReportDialog(p);
                }}
                className="text-muted-foreground hover:text-destructive underline p-1 min-h-[44px] flex items-center"
              >
                {t("report")}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
