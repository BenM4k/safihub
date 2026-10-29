"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { CheckCircle2, Clock, ShieldAlert } from "lucide-react";
import { formatMoney } from "@/lib/cash-formatters";
import type { PartnerDeliveredOrderDTO } from "@/types/partner-settlements";
import { EmptyState } from "@/components/shared";
import { Badge } from "@/components/ui/badge";

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
  const t = useTranslations("house.settlements");

  if (orders.length === 0) {
    return (
      <div className="md:hidden">
        <EmptyState
          title={t("noOrders")}
          description={t("noDeliveredOrdersDesc")}
        />
      </div>
    );
  }

  return (
    <div className="md:hidden space-y-4">
      {/* Unified Orders List */}
      <div className="rounded-2xl bg-card overflow-hidden divide-y divide-border/60 shadow-xs">
        {orders.map((o) => (
          <div key={o.id} className="p-4 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <Link
                href={`/partner/${houseSlug}/orders?search=${o.code}`}
                className="font-mono font-bold text-sm text-foreground hover:text-primary transition min-h-[44px] flex items-center"
              >
                {o.shortReference}
              </Link>

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
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{t("client")} : {o.customerDisplayName}</span>
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

            <div className="pt-2 border-t border-border/60 flex items-center justify-between">
              <div className="text-2xs text-muted-foreground">
                Brut: {formatMoney(o.itemsTotal)} · Com: -{formatMoney(o.commissionAmount)}
              </div>
              <div className="font-mono font-bold text-sm text-success tabular-nums">
                {formatMoney(o.netReceivable, "CDF")}
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-2xs">
              {o.settlementReference ? (
                <span className="text-muted-foreground">
                  {t("payoutCol")} : <strong className="text-foreground font-mono">{o.settlementReference}</strong>
                </span>
              ) : (
                <span className="text-muted-foreground">{t("upcomingSettlement")}</span>
              )}

              <button
                type="button"
                onClick={() => onOpenReportDialog(o)}
                className="text-muted-foreground hover:text-destructive transition underline cursor-pointer p-1 min-h-[44px] flex items-center"
              >
                {t("reportIssue")}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Totals Summary */}
      <div className="p-4 rounded-2xl bg-muted/30 space-y-2 text-xs">
        <div className="flex justify-between text-muted-foreground">
          <span>{t("itemsAmount")} ({orders.length} cmd) :</span>
          <span className="font-mono font-bold text-foreground">{formatMoney(totals.itemsTotal)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>{t("commissionCol")} :</span>
          <span className="font-mono text-destructive">-{formatMoney(totals.commission)}</span>
        </div>
        <div className="flex justify-between pt-2 border-t border-border/60 font-bold text-foreground">
          <span>{t("netReceivableCol")} :</span>
          <span className="font-mono text-success text-base font-black">{formatMoney(totals.net)}</span>
        </div>
      </div>
    </div>
  );
}
