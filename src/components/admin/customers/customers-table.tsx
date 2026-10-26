"use client";

import { useTranslations } from "next-intl";
import { ArrowUpDown, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
      <TableHead
        className={`py-3 px-3 text-2xs font-semibold uppercase tracking-wider text-muted-foreground ${className} ${
          align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left"
        }`}
      >
        <button
          type="button"
          onClick={() => onSortChange(field)}
          className="inline-flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
        >
          <span>{label}</span>
          <ArrowUpDown className={`size-3 ${isSorted ? "text-primary" : "text-muted-foreground/60"}`} />
        </button>
      </TableHead>
    );
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden flex flex-col">
      <div className="overflow-x-auto relative">
        <Table className="w-full text-left text-xs">
          <TableHeader>
            <TableRow className="border-b border-border bg-muted/40 hover:bg-muted/40">
              {renderSortHeader(t("colClient"), "name")}
              <TableHead className="py-3 px-3 text-2xs font-semibold uppercase tracking-wider text-muted-foreground hidden sm:table-cell">
                {t("colPhone")}
              </TableHead>
              <TableHead className="py-3 px-3 text-2xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                {t("colEmail")}
              </TableHead>
              <TableHead className="py-3 px-2 text-2xs font-semibold uppercase tracking-wider text-muted-foreground hidden lg:table-cell text-center">
                {t("colType")}
              </TableHead>
              {renderSortHeader(t("colOrders"), "ordersCount", "center", "hidden sm:table-cell")}
              {renderSortHeader(t("colTotalSpent"), "totalSpentCDF", "right", "hidden md:table-cell")}
              <TableHead className="py-3 px-3 text-2xs font-semibold uppercase tracking-wider text-muted-foreground hidden lg:table-cell">
                {t("colLastOrder")}
              </TableHead>
              {renderSortHeader(t("colRegisteredAt"), "createdAt", "left", "hidden xl:table-cell")}
              <TableHead className="py-3 px-3 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("colStatus")}
              </TableHead>
              <TableHead className="py-3 px-3 text-2xs font-semibold uppercase tracking-wider text-muted-foreground text-right">
                {t("colActions")}
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`} className="h-12 animate-pulse">
                  <TableCell colSpan={10} className="py-3 px-4">
                    <div className="h-4 bg-muted rounded w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="p-8">
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
                        className="mt-2 text-xs font-semibold"
                      >
                        {t("resetFilters")}
                      </Button>
                    }
                  />
                </TableCell>
              </TableRow>
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
          </TableBody>
        </Table>
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
