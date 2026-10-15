"use client";

import { useTranslations } from "next-intl";
import { ArrowUpDown, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/admin/shared/empty-state";
import { CustomersTableRow } from "./customers-table-row";
import { CustomersTablePagination } from "./customers-table-pagination";
import type { CustomerRow, SortState, SortableField } from "./types";

interface CustomersTableProps {
  customers: CustomerRow[];
  totalItems: number;
  currentPage: number;
  pageSize: number;
  isLoading?: boolean;
  isAdmin: boolean;
  sortState: SortState;
  onSortChange: (field: SortableField) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onResetFilters: () => void;
  onSelectCustomer: (customer: CustomerRow) => void;
  onViewProfile: (customer: CustomerRow) => void;
  onViewOrders: (customer: CustomerRow) => void;
  onResetPassword: (customer: CustomerRow) => void;
  onMergeGuest: (customer: CustomerRow) => void;
  onToggleBlock: (customer: CustomerRow) => void;
}

export function CustomersTable({
  customers,
  totalItems,
  currentPage,
  pageSize,
  isLoading = false,
  isAdmin,
  sortState,
  onSortChange,
  onPageChange,
  onPageSizeChange,
  onResetFilters,
  onSelectCustomer,
  onViewProfile,
  onViewOrders,
  onResetPassword,
  onMergeGuest,
  onToggleBlock,
}: CustomersTableProps) {
  const t = useTranslations("admin.customers");

  const renderSortHeader = (label: string, field: SortableField, align: "left" | "right" | "center" = "left", className = "") => {
    const isSorted = sortState.field === field;
    return (
      <th
        scope="col"
        className={`py-3 px-3 text-2xs font-bold uppercase tracking-wider text-ink-700 ${className} ${
          align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left"
        }`}
      >
        <button
          type="button"
          onClick={() => onSortChange(field)}
          className="inline-flex items-center gap-1 hover:text-primary transition-colors focus-visible:outline-hidden"
        >
          <span>{label}</span>
          <ArrowUpDown className={`size-3 ${isSorted ? "text-primary" : "text-ink-400"}`} />
        </button>
      </th>
    );
  };

  return (
    <div className="bg-card rounded-xl border-2 border-border-strong shadow-xs overflow-hidden flex flex-col">
      <div className="overflow-x-auto relative">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b-2 border-border-strong bg-slate-50 sticky top-0 z-10 shadow-2xs">
              {renderSortHeader(t("colClient"), "name")}
              <th scope="col" className="py-3 px-3 text-2xs font-bold uppercase tracking-wider text-ink-700 hidden sm:table-cell">
                {t("colPhone")}
              </th>
              <th scope="col" className="py-3 px-3 text-2xs font-bold uppercase tracking-wider text-ink-700 hidden md:table-cell">
                {t("colEmail")}
              </th>
              <th scope="col" className="py-3 px-2 text-2xs font-bold uppercase tracking-wider text-ink-700 hidden lg:table-cell text-center">
                {t("colType")}
              </th>
              {renderSortHeader(t("colOrders"), "ordersCount", "center", "hidden sm:table-cell")}
              {renderSortHeader(t("colTotalSpent"), "totalSpentCDF", "right", "hidden md:table-cell")}
              <th scope="col" className="py-3 px-3 text-2xs font-bold uppercase tracking-wider text-ink-700 hidden lg:table-cell">
                {t("colLastOrder")}
              </th>
              {renderSortHeader(t("colRegisteredAt"), "createdAt", "left", "hidden xl:table-cell")}
              <th scope="col" className="py-3 px-3 text-2xs font-bold uppercase tracking-wider text-ink-700">
                {t("colStatus")}
              </th>
              <th scope="col" className="py-3 px-3 text-2xs font-bold uppercase tracking-wider text-ink-700 text-right">
                {t("colActions")}
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border-strong">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="h-[52px] animate-pulse">
                  <td colSpan={10} className="py-3 px-4">
                    <div className="h-4 bg-slate-200 rounded w-full" />
                  </td>
                </tr>
              ))
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={10} className="p-8">
                  <EmptyState
                    icon={Users}
                    title={t("emptyTitle")}
                    description={t("emptySubtitle")}
                    action={
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onResetFilters}
                        className="mt-2 text-xs font-bold border-2 border-border-strong"
                      >
                        {t("resetFilters")}
                      </Button>
                    }
                  />
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <CustomersTableRow
                  key={customer.id}
                  customer={customer}
                  isAdmin={isAdmin}
                  onSelect={onSelectCustomer}
                  onViewProfile={onViewProfile}
                  onViewOrders={onViewOrders}
                  onResetPassword={onResetPassword}
                  onMergeGuest={onMergeGuest}
                  onToggleBlock={onToggleBlock}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <CustomersTablePagination
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={totalItems}
        isLoading={isLoading}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
}
