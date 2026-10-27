"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import type { PartnerPayoutDTO } from "@/types/partner-settlements";
import { EmptyState } from "@/components/shared";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PayoutsMobileList } from "./payouts-mobile-list";
import { PayoutTableRow } from "./payout-table-row";

interface PayoutsTableProps {
  payouts: PartnerPayoutDTO[];
  onSelectPayout: (payout: PartnerPayoutDTO) => void;
  onOpenReportDialog: (payout: PartnerPayoutDTO) => void;
  onOpenReceiptModal: (payout: PartnerPayoutDTO) => void;
}

export function PayoutsTable({
  payouts,
  onSelectPayout,
  onOpenReportDialog,
  onOpenReceiptModal,
}: PayoutsTableProps) {
  const t = useTranslations("house.settlements");
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState<string>("all");

  const methodLabels: Record<string, string> = {
    mobile_money: t("methodMobileMoney"),
    bank: t("methodBank"),
    cash: t("methodCash"),
  };

  const filteredPayouts = useMemo(() => {
    return payouts.filter((p) => {
      if (methodFilter !== "all" && p.method !== methodFilter) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase().trim();
      return (
        (p.reference && p.reference.toLowerCase().includes(q)) ||
        (p.periodCovered && p.periodCovered.toLowerCase().includes(q)) ||
        (p.note && p.note.toLowerCase().includes(q))
      );
    });
  }, [payouts, search, methodFilter]);

  const methodTabs = [
    { key: "all", label: t("methodAll") },
    { key: "mobile_money", label: t("methodMobileMoney") },
    { key: "bank", label: t("methodBank") },
    { key: "cash", label: t("methodCash") },
  ];

  return (
    <div className="space-y-4 py-2">
      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPayouts")}
            className="pl-9 h-10 sm:h-9 rounded-xl text-base sm:text-xs"
            aria-label={t("searchPayoutsAria")}
          />
        </div>

        {/* Method filter tabs: text-primary, no bg */}
        <div
          className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0"
          role="group"
          aria-label={t("filterMethodAria")}
        >
          {methodTabs.map((tab) => {
            const isSelected = methodFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setMethodFilter(tab.key)}
                className={`px-3 py-1.5 text-xs transition cursor-pointer min-h-[40px] sm:min-h-[36px] flex items-center bg-transparent border-0 shadow-none ${
                  isSelected
                    ? "text-primary font-bold"
                    : "text-muted-foreground hover:text-foreground font-medium"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-xl border border-border/80 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[140px]">{t("settlementDate")}</TableHead>
              <TableHead>{t("periodCoveredLabel")}</TableHead>
              <TableHead>{t("paymentMethodLabel")}</TableHead>
              <TableHead className="text-right">{t("settlementAmount")}</TableHead>
              <TableHead className="text-center">{t("settlementStatusCol")}</TableHead>
              <TableHead>{t("settlementRef")}</TableHead>
              <TableHead className="text-center">{t("officialReceiptTitle")}</TableHead>
              <TableHead className="text-right">{t("actionsCol")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayouts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-8">
                  <EmptyState
                    title={t("noPayouts")}
                    description={t("noDeliveredOrdersDesc")}
                  />
                </TableCell>
              </TableRow>
            ) : (
              filteredPayouts.map((p) => (
                <PayoutTableRow
                  key={p.id}
                  payout={p}
                  methodLabel={methodLabels[p.method] || p.method}
                  onSelectPayout={onSelectPayout}
                  onOpenReportDialog={onOpenReportDialog}
                  onOpenReceiptModal={onOpenReceiptModal}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Stacked Card List */}
      <PayoutsMobileList
        payouts={filteredPayouts}
        methodLabels={methodLabels}
        onSelectPayout={onSelectPayout}
        onOpenReportDialog={onOpenReportDialog}
        onOpenReceiptModal={onOpenReceiptModal}
      />
    </div>
  );
}
