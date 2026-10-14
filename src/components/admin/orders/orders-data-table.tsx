"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { useTranslations } from "next-intl";
import type { OrderListItemRecord } from "@/dal";
import { OrdersTableRow } from "./orders-table-row";
import { OrdersTableSkeleton } from "./orders-table-skeleton";
import { OrdersTableEmpty } from "./orders-table-empty";

export type SortField = "date" | "amount" | "code" | "customer";
export type SortDirection = "asc" | "desc";

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

  const isAllSelected = orders.length > 0 && selectedIds.length === orders.length;
  const isPartiallySelected = selectedIds.length > 0 && selectedIds.length < orders.length;

  function renderSortIcon(field: SortField) {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-ink-400 group-hover:text-heading" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="w-3 h-3 text-primary" />
    ) : (
      <ArrowDown className="w-3 h-3 text-primary" />
    );
  }

  return (
    <div className="rounded-xl border border-border-strong bg-card shadow-md overflow-hidden">
      <div className="overflow-x-auto max-h-[640px] relative">
        <table className="w-full text-left text-xs border-collapse">
          {/* Sticky Table Header */}
          <thead className="sticky top-0 z-10 bg-slate-100/95 border-b-2 border-border-strong shadow-xs text-ink-700 font-bold uppercase tracking-wider text-[11px] backdrop-blur-xs">
            <tr>
              {/* Checkbox */}
              <th className="w-10 px-3.5 py-3.5 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isPartiallySelected;
                  }}
                  onChange={onToggleSelectAll}
                  aria-label="Sélectionner toutes les commandes"
                  className="rounded border-border text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                />
              </th>

              {/* Référence */}
              <th className="px-3.5 py-3.5">
                <button
                  type="button"
                  onClick={() => onSort("code")}
                  className="group inline-flex items-center gap-1.5 hover:text-heading font-bold uppercase cursor-pointer"
                >
                  <span>{t("colReference")}</span>
                  {renderSortIcon("code")}
                </button>
              </th>

              {/* Client */}
              <th className="px-3.5 py-3.5">
                <button
                  type="button"
                  onClick={() => onSort("customer")}
                  className="group inline-flex items-center gap-1.5 hover:text-heading font-bold uppercase cursor-pointer"
                >
                  <span>{t("colCustomer")}</span>
                  {renderSortIcon("customer")}
                </button>
              </th>

              {/* Pressing */}
              <th className="px-3.5 py-3.5 hidden md:table-cell">
                {t("colPressing")}
              </th>

              {/* Date de création */}
              <th className="px-3.5 py-3.5 hidden sm:table-cell">
                <button
                  type="button"
                  onClick={() => onSort("date")}
                  className="group inline-flex items-center gap-1.5 hover:text-heading font-bold uppercase cursor-pointer"
                >
                  <span>{t("colCreatedAt")}</span>
                  {renderSortIcon("date")}
                </button>
              </th>

              {/* Canal */}
              <th className="px-3.5 py-3.5 hidden lg:table-cell">
                {t("colChannel")}
              </th>

              {/* Paiement */}
              {showPaymentColumn && (
                <th className="px-3.5 py-3.5 hidden xl:table-cell">
                  {t("colPayment")}
                </th>
              )}

              {/* Montant */}
              <th className="px-3.5 py-3.5 text-right">
                <button
                  type="button"
                  onClick={() => onSort("amount")}
                  className="group inline-flex items-center gap-1.5 hover:text-heading font-bold uppercase ml-auto cursor-pointer"
                >
                  <span>{t("colAmount")}</span>
                  {renderSortIcon("amount")}
                </button>
              </th>

              {/* Statut */}
              <th className="px-3.5 py-3.5">{t("colStatus")}</th>

              {/* Actions */}
              <th className="w-10 px-3 py-3.5 text-right">
                <span className="sr-only">{t("colActions")}</span>
              </th>
            </tr>
          </thead>

          {/* Table Body with visible separators */}
          <tbody className="divide-y divide-border-strong bg-card">
            {isLoading ? (
              <OrdersTableSkeleton showPaymentColumn={showPaymentColumn} />
            ) : orders.length === 0 ? (
              <OrdersTableEmpty
                colSpan={showPaymentColumn ? 10 : 9}
                onResetFilters={onResetFilters}
              />
            ) : (
              orders.map((o) => (
                <OrdersTableRow
                  key={o.id}
                  order={o}
                  isSelected={selectedIds.includes(o.id)}
                  onToggleSelect={onToggleSelect}
                  onOpenDetails={onOpenDetails}
                  onOpenReassign={onOpenReassign}
                  onOpenCancel={onOpenCancel}
                  showPaymentColumn={showPaymentColumn}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
