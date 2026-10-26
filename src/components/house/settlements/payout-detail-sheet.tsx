"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { CheckCircle2, ExternalLink, FileText, Receipt } from "lucide-react";
import { formatMoney } from "@/lib/cash-formatters";
import type { PartnerPayoutDTO } from "@/types/partner-settlements";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface PayoutDetailSheetProps {
  payout: PartnerPayoutDTO | null;
  onClose: () => void;
  houseSlug: string;
  onOpenReportDialog: (payout: PartnerPayoutDTO) => void;
  onOpenReceiptModal: (payout: PartnerPayoutDTO) => void;
}

export function PayoutDetailSheet({
  payout,
  onClose,
  houseSlug,
  onOpenReportDialog,
  onOpenReceiptModal,
}: PayoutDetailSheetProps) {
  const t = useTranslations("house.settlements");

  if (!payout) return null;

  return (
    <Sheet
      open={Boolean(payout)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0">
        {/* Header */}
        <SheetHeader className="p-4 sm:p-5 border-b border-border bg-surface text-left">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Receipt className="size-5" />
            </div>
            <div>
              <SheetTitle className="text-sm font-bold text-foreground">
                {t("payoutDetailTitle")}
              </SheetTitle>
              <SheetDescription className="text-2xs text-muted-foreground font-mono">
                {payout.reference || `#${payout.id.slice(0, 8)}`}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Main summary card */}
          <div className="p-5 rounded-xl bg-surface border border-border/80 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{t("payoutAmountLabel")}</span>
              <Badge variant="outline" className="gap-1 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-2xs font-semibold">
                <CheckCircle2 className="size-3" />
                <span>{t("statusPaid")}</span>
              </Badge>
            </div>

            <div className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
              +{formatMoney(payout.amount, "CDF")}
            </div>

            <div className="pt-2 border-t border-border grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div>
                <span className="block text-2xs text-muted-foreground">{t("payoutDateLabel")}</span>
                <span className="font-mono text-foreground font-medium">
                  {new Intl.DateTimeFormat("fr-FR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  }).format(new Date(payout.date))}
                </span>
              </div>
              <div>
                <span className="block text-2xs text-muted-foreground">{t("paymentMethodLabel")}</span>
                <span className="text-foreground font-medium capitalize">
                  {payout.method.replace("_", " ")}
                </span>
              </div>
            </div>

            {payout.periodCovered && (
              <div className="pt-2 border-t border-border text-xs">
                <span className="text-2xs text-muted-foreground block">{t("periodCoveredLabel")}</span>
                <span className="font-medium text-foreground">{payout.periodCovered}</span>
              </div>
            )}
          </div>

          {/* Included Orders Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                {t("includedOrdersCount", { count: payout.ordersCount })}
              </h3>
              <span className="text-2xs text-muted-foreground">
                {t("totalNetAssigned")}
              </span>
            </div>

            {payout.includedOrders.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-border text-center text-xs text-muted-foreground">
                {t("noIncludedOrdersDirect")}
              </div>
            ) : (
              <div className="divide-y divide-border rounded-xl border border-border overflow-hidden bg-surface">
                {payout.includedOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-3.5 flex items-center justify-between gap-3 text-xs hover:bg-muted/40 transition"
                  >
                    <div>
                      <Link
                        href={`/partner/${houseSlug}/orders?search=${ord.code}`}
                        className="font-mono font-bold text-foreground hover:text-primary transition flex items-center gap-1"
                      >
                        <span>{ord.shortReference}</span>
                        <ExternalLink className="size-3 text-muted-foreground" />
                      </Link>
                      <span className="text-2xs text-muted-foreground block">
                        {t("client")} : {ord.customerDisplayName}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-bold text-foreground tabular-nums block">
                        {formatMoney(ord.netAmount, "CDF")}
                      </span>
                      <span className="text-2xs text-emerald-600 dark:text-emerald-400 font-semibold">
                        {t("includedInPayout")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <SheetFooter className="p-4 border-t border-border bg-surface flex flex-row items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenReceiptModal(payout)}
            className="flex-1 min-h-[40px] text-xs font-semibold gap-1.5"
          >
            <FileText className="size-3.5" />
            <span>{t("viewOfficialReceipt")}</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenReportDialog(payout)}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive min-h-[40px] text-xs font-semibold"
          >
            {t("reportIssue")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
