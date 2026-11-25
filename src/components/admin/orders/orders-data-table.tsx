"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { useTranslations } from "next-intl";
import type { OrderListItemRecord } from "@/dal";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrdersTableRow } from "./orders-table-row";
import { OrdersTableSkeleton } from "./orders-table-skeleton";
import { OrdersTableEmpty } from "./orders-table-empty";
import type {
  AdminOrderSortDirection,
  AdminOrderSortField,
} from "@/lib/admin-orders-query";

export type SortField = AdminOrderSortField;
export type SortDirection = AdminOrderSortDirection;

interface OrdersDataTableProps {
  orders: OrderListItemRecord[];
  isLoading?: boolean;
  selectedIds: string[];
  onToggleSelectAll: () => void;
  onToggleSelect: (id: string) => void;
  onOpenDetails: (order: OrderListItemRecord) => void;
  onOpenReassign: (order: OrderListItemRecord) => void;
  onOpenCancel: (order: OrderListItemRecord) => void;
  onResetFilters: () => void;
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  showPaymentColumn?: boolean;
}

export function OrdersDataTable({
  orders,
  isLoading = false,
  selectedIds,
  onToggleSelectAll,
  onToggleSelect,
  onOpenDetails,
  onOpenReassign,
  onOpenCancel,
  onResetFilters,
  sortField,
  sortDirection,
  onSort,
  showPaymentColumn = false,
}: OrdersDataTableProps) {
  const t = useTranslations("admin.orders");

  const isAllSelected =
    orders.length > 0 && orders.every((o) => selectedIds.includes(o.id));
  const isPartiallySelected =
    !isAllSelected && orders.some((o) => selectedIds.includes(o.id));

  function renderSortIcon(field: SortField) {
    if (sortField !== field) {
      return <ArrowUpDown className="size-3 text-muted-foreground/60" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="size-3 text-primary" />
    ) : (
      <ArrowDown className="size-3 text-primary" />
    );
  }

  return (
    <div
      className={`rounded-lg border border-border bg-background overflow-hidden transition-opacity duration-200 ${
        isLoading ? "opacity-65" : "opacity-100"
      }`}
    >
      <div className="overflow-x-auto max-h-[640px] relative">
        <Table className="w-full text-left text-xs">
          <TableHeader className="sticky top-0 z-10 bg-muted/40 backdrop-blur-xs border-b border-border">
            <TableRow className="border-b border-border hover:bg-muted/40">
              {/* @ui-sdk/react Checkbox */}
              <TableHead className="w-11 px-3 py-2 text-center">
                <div className="flex items-center justify-center">
                  <Checkbox
                    checked={isPartiallySelected ? "indeterminate" : isAllSelected}
                    onCheckedChange={onToggleSelectAll}
                    aria-label={t("selectAll")}
                  />
                </div>
              </TableHead>

              <TableHead className="px-3 py-2">
                <button
                  type="button"
                  onClick={() => onSort("code")}
                  className="inline-flex items-center gap-1.5 hover:text-foreground font-semibold uppercase text-2xs cursor-pointer"
                >
                  <span>{t("colReference")}</span>
                  {renderSortIcon("code")}
                </button>
              </TableHead>

              <TableHead className="px-3 py-2">
                <button
                  type="button"
                  onClick={() => onSort("customer")}
                  className="inline-flex items-center gap-1.5 hover:text-foreground font-semibold uppercase text-2xs cursor-pointer"
                >
                  <span>{t("colCustomer")}</span>
                  {renderSortIcon("customer")}
                </button>
              </TableHead>

              <TableHead className="px-3 py-2 hidden md:table-cell font-semibold uppercase text-2xs">
                {t("colPressing")}
              </TableHead>

              <TableHead className="px-3 py-2 hidden sm:table-cell">
                <button
                  type="button"
                  onClick={() => onSort("date")}
                  className="inline-flex items-center gap-1.5 hover:text-foreground font-semibold uppercase text-2xs cursor-pointer"
                >
                  <span>{t("colCreatedAt")}</span>
                  {renderSortIcon("date")}
                </button>
              </TableHead>

              <TableHead className="px-3 py-2 hidden lg:table-cell font-semibold uppercase text-2xs">
                {t("colChannel")}
              </TableHead>

              {showPaymentColumn && (
                <TableHead className="px-3 py-2 hidden xl:table-cell font-semibold uppercase text-2xs">
                  {t("colPayment")}
                </TableHead>
              )}

              <TableHead className="px-3 py-2 text-right">
                <button
                  type="button"
                  onClick={() => onSort("amount")}
                  className="inline-flex items-center gap-1.5 hover:text-foreground font-semibold uppercase text-2xs cursor-pointer ml-auto"
                >
                  <span>{t("colAmount")}</span>
                  {renderSortIcon("amount")}
                </button>
              </TableHead>

              <TableHead className="px-3 py-2 font-semibold uppercase text-2xs">
                {t("colStatus")}
              </TableHead>

              <TableHead className="w-10 px-2 py-2 text-right font-semibold uppercase text-2xs">
                {t("colActions")}
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading && orders.length === 0 ? (
              <OrdersTableSkeleton showPaymentColumn={showPaymentColumn} />
            ) : orders.length === 0 ? (
              <OrdersTableEmpty
                onResetFilters={onResetFilters}
                colSpan={showPaymentColumn ? 10 : 9}
              />
            ) : (
              orders.map((order) => (
                <OrdersTableRow
                  key={order.id}
                  order={order}
                  isSelected={selectedIds.includes(order.id)}
                  onToggleSelect={onToggleSelect}
                  onOpenDetails={onOpenDetails}
                  onOpenReassign={onOpenReassign}
                  onOpenCancel={onOpenCancel}
                  showPaymentColumn={showPaymentColumn}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
