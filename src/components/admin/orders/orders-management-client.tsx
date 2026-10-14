"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { OrderListItemRecord } from "@/dal";
import { exportOrdersToCSV } from "@/lib/order-formatters";
import { OrdersStatsRow } from "./orders-stats-row";
import { OrdersFilterBar } from "./orders-filter-bar";
import { OrdersBulkActions } from "./orders-bulk-actions";
import { OrdersDataTable } from "./orders-data-table";
import { OrdersPagination } from "./orders-pagination";
import { OrderDetailsSheet } from "./order-details-sheet";
import { OrderReassignDialog } from "./order-reassign-dialog";
import { OrderCancelDialog } from "./order-cancel-dialog";
import { useOrdersFilter } from "./use-orders-filter";

interface OrdersManagementClientProps {
  initialOrders: OrderListItemRecord[];
  houses: Array<{ id: string; name: string }>;
}

export function OrdersManagementClient({
  initialOrders,
  houses,
}: OrdersManagementClientProps) {
  const router = useRouter();

  const {
    filters,
    stats,
    tabCounts,
    filteredOrders,
    sortedOrders,
    paginatedOrders,
    sortField,
    sortDirection,
    currentPage,
    pageSize,
    selectedIds,
    handleFilterChange,
    handleResetFilters,
    handleSort,
    handleToggleSelect,
    handleToggleSelectAll,
    setCurrentPage,
    setPageSize,
    setSelectedIds,
  } = useOrdersFilter(initialOrders);

  // Dialog / Sheet states
  const [detailsOrder, setDetailsOrder] = useState<OrderListItemRecord | null>(null);
  const [reassignOrder, setReassignOrder] = useState<OrderListItemRecord | null>(null);
  const [cancelOrder, setCancelOrder] = useState<OrderListItemRecord | null>(null);

  function handleExportAllFiltered() {
    exportOrdersToCSV(sortedOrders);
  }

  function handleExportSelected() {
    const selected = initialOrders.filter((o) => selectedIds.includes(o.id));
    exportOrdersToCSV(selected);
  }

  function handleActionSuccess() {
    router.refresh();
  }

  return (
    <div className="space-y-4 font-sans">
      {/* 1. Clickable Stats Row */}
      <OrdersStatsRow
        stats={stats}
        activeTab={filters.tab}
        onSelectTab={(tab) => handleFilterChange({ tab })}
      />

      {/* 2. Filter Bar with Tabs, Search, Dropdowns & Export */}
      <OrdersFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        onExport={handleExportAllFiltered}
        houses={houses}
        tabCounts={tabCounts}
        totalFilteredCount={filteredOrders.length}
      />

      {/* 3. Bulk Action Bar */}
      <OrdersBulkActions
        selectedCount={selectedIds.length}
        onClearSelection={() => setSelectedIds([])}
        onExportSelected={handleExportSelected}
        onCancelSelected={
          selectedIds.length === 1
            ? () => {
                const target = initialOrders.find((o) => o.id === selectedIds[0]);
                if (target) setCancelOrder(target);
              }
            : undefined
        }
        onReassignSelected={
          selectedIds.length === 1
            ? () => {
                const target = initialOrders.find((o) => o.id === selectedIds[0]);
                if (target) setReassignOrder(target);
              }
            : undefined
        }
      />

      {/* 4. Orders Data Table */}
      <OrdersDataTable
        orders={paginatedOrders}
        selectedIds={selectedIds}
        onToggleSelectAll={handleToggleSelectAll}
        onToggleSelect={handleToggleSelect}
        onOpenDetails={(o) => setDetailsOrder(o)}
        onOpenReassign={(o) => setReassignOrder(o)}
        onOpenCancel={(o) => setCancelOrder(o)}
        onResetFilters={handleResetFilters}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
      />

      {/* 5. Pagination */}
      <OrdersPagination
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={sortedOrders.length}
        onPageChange={(p) => {
          setSelectedIds([]);
          setCurrentPage(p);
        }}
        onPageSizeChange={(s) => {
          setPageSize(s);
          setCurrentPage(1);
          setSelectedIds([]);
        }}
      />

      {/* 6. Details Sheet (Audit Timeline + On-Behalf Actions) */}
      <OrderDetailsSheet
        order={detailsOrder}
        onClose={() => setDetailsOrder(null)}
        onOpenReassign={(o) => {
          setDetailsOrder(null);
          setReassignOrder(o);
        }}
        onOpenCancel={(o) => {
          setDetailsOrder(null);
          setCancelOrder(o);
        }}
      />

      {/* 7. Dialogs */}
      <OrderReassignDialog
        order={reassignOrder}
        houses={houses}
        onClose={() => setReassignOrder(null)}
        onSuccess={handleActionSuccess}
      />

      <OrderCancelDialog
        order={cancelOrder}
        onClose={() => setCancelOrder(null)}
        onSuccess={handleActionSuccess}
      />
    </div>
  );
}
