"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { formatMoney } from "@/lib/cash-formatters";
import type { PartnerDeliveredOrderDTO } from "@/types/partner-settlements";
import { EmptyState } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeliveredOrdersMobileList } from "./delivered-orders-mobile-list";
import { DeliveredOrderTableRow } from "./delivered-order-table-row";

interface DeliveredOrdersTableProps {
  orders: PartnerDeliveredOrderDTO[];
  houseSlug: string;
  onOpenReportDialog: (order: PartnerDeliveredOrderDTO) => void;
}

export function DeliveredOrdersTable({
  orders,
  houseSlug,
  onOpenReportDialog,
}: DeliveredOrdersTableProps) {
  const t = useTranslations("house.settlements");
  const [search, setSearch] = useState("");
  const [localSearch, setLocalSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "settled" | "disputed">("all");

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== "all" && o.settlementStatus !== statusFilter) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase().trim();
      return (
        o.code.toLowerCase().includes(q) ||
        o.shortReference.toLowerCase().includes(q) ||
        o.customerDisplayName.toLowerCase().includes(q) ||
        (o.settlementReference && o.settlementReference.toLowerCase().includes(q))
      );
    });
  }, [orders, search, statusFilter]);

  const totals = useMemo(() => {
    return filteredOrders.reduce(
      (acc, o) => {
        acc.itemsTotal += o.itemsTotal;
        acc.commission += o.commissionAmount;
        acc.net += o.netReceivable;
        return acc;
      },
      { itemsTotal: 0, commission: 0, net: 0 }
    );
  }, [filteredOrders]);

  const filterTabs = [
    { key: "all", label: t("statusAll") },
    { key: "pending", label: t("statusPending") },
    { key: "settled", label: t("statusSettled") },
    { key: "disputed", label: t("statusDisputed") },
  ];

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSearch(localSearch.trim());
  }

  return (
    <div className="space-y-4 py-2">
      {/* Table filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-sm flex items-center gap-1.5">
          <div className="relative flex-1">
            <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              type="search"
              value={localSearch}
              onChange={(e) => {
                const val = e.target.value;
                setLocalSearch(val);
                if (val === "" && search !== "") {
                  setSearch("");
                }
              }}
              placeholder={t("searchDeliveredOrders")}
              className="pl-9 h-10 sm:h-9 rounded-xl border-input text-base sm:text-xs"
              aria-label={t("searchDeliveredOrdersAria")}
            />
          </div>
          <Button
            type="submit"
            size="sm"
            aria-label={t("searchButton")}
            className="h-10 sm:h-9 px-3 sm:px-3.5 rounded-xl text-xs font-semibold shrink-0 gap-1.5"
          >
            <Search className="size-3.5" />
            <span className="hidden sm:inline">{t("searchButton")}</span>
          </Button>
        </form>

        {/* Status filter tabs: text-primary, no bg */}
        <div
          className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0"
          role="group"
          aria-label={t("filterSettlementStatusAria")}
        >
          {filterTabs.map((tab) => {
            const isSelected = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key as "all" | "pending" | "settled" | "disputed")}
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
      <div className="hidden md:block rounded-2xl bg-card shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">{t("orderCode")}</TableHead>
              <TableHead>{t("client")}</TableHead>
              <TableHead>{t("deliveryDate")}</TableHead>
              <TableHead className="text-right">{t("itemsAmount")}</TableHead>
              <TableHead className="text-right">{t("commissionCol")}</TableHead>
              <TableHead className="text-right">{t("netReceivableCol")}</TableHead>
              <TableHead className="text-center">{t("settlementStatusCol")}</TableHead>
              <TableHead>{t("payoutCol")}</TableHead>
              <TableHead className="text-right">{t("actionCol")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-8">
                  <EmptyState
                    title={t("noDeliveredOrdersFound")}
                    description={t("noDeliveredOrdersDesc")}
                  />
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((o) => (
                <DeliveredOrderTableRow
                  key={o.id}
                  order={o}
                  houseSlug={houseSlug}
                  onOpenReportDialog={onOpenReportDialog}
                />
              ))
            )}
          </TableBody>

          {filteredOrders.length > 0 && (
            <TableFooter>
              <TableRow className="font-bold text-foreground">
                <TableCell colSpan={3} className="text-xs font-bold">
                  {t("totalFiltered", { count: filteredOrders.length })}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {formatMoney(totals.itemsTotal, "CDF")}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums text-muted-foreground">
                  -{formatMoney(totals.commission, "CDF")}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums text-success text-sm font-black">
                  {formatMoney(totals.net, "CDF")}
                </TableCell>
                <TableCell colSpan={3} />
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </div>

      {/* Mobile Stacked Card List */}
      <DeliveredOrdersMobileList
        orders={filteredOrders}
        houseSlug={houseSlug}
        totals={totals}
        onOpenReportDialog={onOpenReportDialog}
      />
    </div>
  );
}
