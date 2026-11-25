"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { OrderListItemRecord, PaginatedOrdersResult } from "@/dal";
import {
  exportFilteredAdminOrdersAction,
  getAdminOrderDetailAction,
} from "@/actions/admin-order.actions";
import { err } from "@/lib/result";
import { exportOrdersToCSV } from "@/lib/order-formatters";
import {
  buildAdminOrdersQueryString,
  DEFAULT_ADMIN_ORDERS_QUERY,
  type AdminOrdersQueryParams,
  type AdminOrderSortField,
} from "@/lib/admin-orders-query";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { OrdersStatsRow } from "./orders-stats-row";
import { OrdersFilterBar, type FilterState } from "./orders-filter-bar";
import { OrdersBulkActions } from "./orders-bulk-actions";
import { OrdersDataTable } from "./orders-data-table";
import { DataTablePagination } from "@/components/admin/shared/data-table-pagination";
import type { OrderDetailActionResult } from "./order-details-async-body";

const OrderDetailsSheet = dynamic(
  () => import("./order-details-sheet").then((m) => m.OrderDetailsSheet),
  { ssr: false }
);

const OrderReassignDialog = dynamic(
  () => import("./order-reassign-dialog").then((m) => m.OrderReassignDialog),
  { ssr: false }
);

const OrderCancelDialog = dynamic(
  () => import("./order-cancel-dialog").then((m) => m.OrderCancelDialog),
  { ssr: false }
);

interface OrdersManagementClientProps {
  data: PaginatedOrdersResult;
  query: AdminOrdersQueryParams;
  houses: Array<{ id: string; name: string }>;
}

export function OrdersManagementClient({
  data,
  query,
  houses,
}: OrdersManagementClientProps) {
  const t = useTranslations("admin.orders");
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const latestQueryRef = useRef<AdminOrdersQueryParams>(query);
  useEffect(() => {
    latestQueryRef.current = query;
  }, [query]);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [detailState, setDetailState] = useState<{
    order: OrderListItemRecord;
    promise: Promise<OrderDetailActionResult>;
  } | null>(null);
  const [reassignOrder, setReassignOrder] = useState<OrderListItemRecord | null>(null);
  const [cancelOrder, setCancelOrder] = useState<OrderListItemRecord | null>(null);

  function navigateQuery(next: AdminOrdersQueryParams) {
    latestQueryRef.current = next;
    const qs = buildAdminOrdersQueryString(next);
    startTransition(() => {
      router.replace(qs ? `${pathname}${qs}` : pathname, { scroll: false });
    });
  }

  function handleFilterChange(partial: Partial<FilterState>) {
    setSelectedIds([]);
    navigateQuery({
      ...latestQueryRef.current,
      ...partial,
      page: 1,
    });
  }

  function handleResetFilters() {
    setSelectedIds([]);
    navigateQuery({
      ...DEFAULT_ADMIN_ORDERS_QUERY,
      pageSize: latestQueryRef.current.pageSize,
    });
  }

  function handleSort(field: AdminOrderSortField) {
    const base = latestQueryRef.current;
    const nextDirection =
      base.sortField === field
        ? base.sortDirection === "asc"
          ? "desc"
          : "asc"
        : "desc";
    setSelectedIds([]);
    navigateQuery({
      ...base,
      sortField: field,
      sortDirection: nextDirection,
      page: 1,
    });
  }

  function handleToggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  function handleToggleSelectAll() {
    const allSelected =
      data.orders.length > 0 &&
      data.orders.every((o) => selectedIds.includes(o.id));
    setSelectedIds(allSelected ? [] : data.orders.map((o) => o.id));
  }

  function fetchDetailSafely(orderId: string): Promise<OrderDetailActionResult> {
    return getAdminOrderDetailAction(orderId).catch(() =>
      err(t("detailLoadError"))
    );
  }

  function openOrderDetails(order: OrderListItemRecord) {
    setDetailState({
      order,
      promise: fetchDetailSafely(order.id),
    });
  }

  function refreshOrderDetails() {
    setDetailState((prev) =>
      prev
        ? {
            order: prev.order,
            promise: fetchDetailSafely(prev.order.id),
          }
        : null
    );
    startTransition(() => {
      router.refresh();
    });
  }

  async function handleExportFiltered() {
    setExportError(null);
    setIsExporting(true);
    try {
      const active = latestQueryRef.current;
      const res = await exportFilteredAdminOrdersAction({
        search: active.search,
        tab: active.tab,
        dateRange: active.dateRange,
        houseId: active.houseId,
        source: active.source,
        sortField: active.sortField,
        sortDirection: active.sortDirection,
      });
      if (!res.ok) {
        setExportError(res.error);
        return;
      }
      exportOrdersToCSV(res.value);
    } catch {
      setExportError(t("exportOrdersError"));
    } finally {
      setIsExporting(false);
    }
  }

  const singleSelectedOrder =
    selectedIds.length === 1
      ? data.orders.find((o) => o.id === selectedIds[0])
      : undefined;

  return (
    <div className="space-y-4 font-sans">
      <OrdersStatsRow
        stats={data.stats}
        activeTab={query.tab}
        onSelectTab={(tab) => handleFilterChange({ tab })}
      />

      <OrdersFilterBar
        filters={{
          search: query.search,
          tab: query.tab,
          dateRange: query.dateRange,
          houseId: query.houseId,
          source: query.source,
        }}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        onExport={handleExportFiltered}
        houses={houses}
        tabCounts={data.tabCounts}
        isPending={isPending || isExporting}
      />

      {exportError && (
        <Alert variant="destructive">
          <AlertDescription className="text-xs">{exportError}</AlertDescription>
        </Alert>
      )}

      <OrdersBulkActions
        selectedCount={selectedIds.length}
        onClearSelection={() => setSelectedIds([])}
        onExportSelected={() =>
          exportOrdersToCSV(data.orders.filter((o) => selectedIds.includes(o.id)))
        }
        onCancelSelected={
          singleSelectedOrder ? () => setCancelOrder(singleSelectedOrder) : undefined
        }
        onReassignSelected={
          singleSelectedOrder ? () => setReassignOrder(singleSelectedOrder) : undefined
        }
      />

      <OrdersDataTable
        orders={data.orders}
        isLoading={isPending}
        selectedIds={selectedIds}
        onToggleSelectAll={handleToggleSelectAll}
        onToggleSelect={handleToggleSelect}
        onOpenDetails={openOrderDetails}
        onOpenReassign={setReassignOrder}
        onOpenCancel={setCancelOrder}
        onResetFilters={handleResetFilters}
        sortField={query.sortField}
        sortDirection={query.sortDirection}
        onSort={handleSort}
      />

      <DataTablePagination
        page={query.page}
        pageSize={query.pageSize}
        totalItems={data.totalCount}
        onPageChange={(page) => {
          setSelectedIds([]);
          navigateQuery({ ...latestQueryRef.current, page });
        }}
        onPageSizeChange={(pageSize) => {
          setSelectedIds([]);
          navigateQuery({ ...latestQueryRef.current, pageSize, page: 1 });
        }}
        className="rounded-xl border border-border"
      />

      {detailState && (
        <OrderDetailsSheet
          order={detailState.order}
          detailPromise={detailState.promise}
          onRefreshDetail={refreshOrderDetails}
          onClose={() => setDetailState(null)}
          onOpenReassign={(o) => {
            setDetailState(null);
            setReassignOrder(o);
          }}
          onOpenCancel={(o) => {
            setDetailState(null);
            setCancelOrder(o);
          }}
        />
      )}

      {reassignOrder && (
        <OrderReassignDialog
          order={reassignOrder}
          houses={houses}
          onClose={() => setReassignOrder(null)}
          onSuccess={() => router.refresh()}
        />
      )}

      {cancelOrder && (
        <OrderCancelDialog
          order={cancelOrder}
          onClose={() => setCancelOrder(null)}
          onSuccess={() => router.refresh()}
        />
      )}
    </div>
  );
}
