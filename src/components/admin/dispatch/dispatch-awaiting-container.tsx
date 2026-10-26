"use client";

import { useMemo, useState } from "react";
import { DispatchAwaitingToolbar } from "./dispatch-awaiting-toolbar";
import { DispatchAwaitingEmpty } from "./dispatch-awaiting-empty";
import { DispatchAwaitingPagination } from "./dispatch-awaiting-pagination";
import { DispatchPressingGroupCard } from "./dispatch-pressing-group-card";
import { DispatchOrderRow } from "./dispatch-order-row";
import { DispatchOrderDetailsSheet } from "./dispatch-order-details-sheet";
import { DispatchCallOutcomeModal } from "./dispatch-call-outcome-modal";
import { DispatchReassignDialog } from "./dispatch-reassign-dialog";
import { useDispatchModals } from "./use-dispatch-modals";
import {
  filterAndSortGroups,
  filterAndSortOrders,
  groupOrdersByPressing,
  type DelayFilter,
  type EnrichedDispatchOrder,
  type SortOption,
} from "@/lib/dispatch-grouping";
import type { AvailablePressingOption } from "@/services/admin";

interface DispatchAwaitingContainerProps {
  orders: EnrichedDispatchOrder[];
  availablePressings: AvailablePressingOption[];
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function DispatchAwaitingContainer({
  orders,
  availablePressings,
  onRefresh,
  isRefreshing,
}: DispatchAwaitingContainerProps) {
  const [viewMode, setViewMode] = useState<"pressing" | "order">("pressing");
  const [search, setSearch] = useState("");
  const [delayFilter, setDelayFilter] = useState<DelayFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("oldest");
  const [expandedGroupIds, setExpandedGroupIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const {
    selectedOrderForDetails,
    setSelectedOrderForDetails,
    outcomeModal,
    reassignModal,
    openOrderOutcome,
    openGroupOutcome,
    openReassign,
    closeOutcomeModal,
    closeReassignModal,
  } = useDispatchModals();

  const rawGroups = useMemo(() => groupOrdersByPressing(orders), [orders]);
  const filteredGroups = useMemo(
    () => filterAndSortGroups(rawGroups, { search, delayFilter, sortBy }),
    [rawGroups, search, delayFilter, sortBy]
  );
  const filteredOrders = useMemo(
    () => filterAndSortOrders(orders, { search, delayFilter, sortBy }),
    [orders, search, delayFilter, sortBy]
  );

  function toggleExpandGroup(houseId: string) {
    setExpandedGroupIds((prev) => {
      const next = new Set(prev);
      if (next.has(houseId)) next.delete(houseId);
      else next.add(houseId);
      return next;
    });
  }

  const totalItems = viewMode === "pressing" ? filteredGroups.length : filteredOrders.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedGroups = filteredGroups.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="rounded-xl border border-border bg-background overflow-hidden">
      <DispatchAwaitingToolbar
        totalOrdersCount={orders.length}
        viewMode={viewMode}
        onChangeViewMode={(mode) => {
          setViewMode(mode);
          setPage(1);
        }}
        search={search}
        onSearchChange={(s) => {
          setSearch(s);
          setPage(1);
        }}
        delayFilter={delayFilter}
        onDelayFilterChange={(f) => {
          setDelayFilter(f);
          setPage(1);
        }}
        sortBy={sortBy}
        onSortByChange={(s) => setSortBy(s)}
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
      />

      {totalItems === 0 ? (
        <DispatchAwaitingEmpty />
      ) : viewMode === "pressing" ? (
        <div className="p-4 space-y-3">
          {paginatedGroups.map((group) => (
            <DispatchPressingGroupCard
              key={group.houseId}
              group={group}
              isExpanded={expandedGroupIds.has(group.houseId)}
              onToggleExpand={() => toggleExpandGroup(group.houseId)}
              onSelectOrder={setSelectedOrderForDetails}
              onOpenOutcomeModal={openOrderOutcome}
              onOpenGroupOutcomeModal={openGroupOutcome}
              onOpenReassignDialog={openReassign}
            />
          ))}
        </div>
      ) : (
        <div className="divide-y divide-border">
          {paginatedOrders.map((order) => (
            <DispatchOrderRow
              key={order.id}
              order={order}
              onSelectOrder={setSelectedOrderForDetails}
              onOpenOutcomeModal={openOrderOutcome}
              onOpenReassignDialog={openReassign}
            />
          ))}
        </div>
      )}

      <DispatchAwaitingPagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={setPage}
      />

      <DispatchOrderDetailsSheet
        order={selectedOrderForDetails}
        onClose={() => setSelectedOrderForDetails(null)}
        onOpenOutcomeModal={openOrderOutcome}
        onOpenReassignDialog={openReassign}
      />

      <DispatchCallOutcomeModal
        isOpen={outcomeModal.isOpen}
        onClose={closeOutcomeModal}
        pressingId={outcomeModal.pressingId}
        pressingName={outcomeModal.pressingName}
        orderIds={outcomeModal.orderIds}
        channel={outcomeModal.channel}
        onSuccess={onRefresh}
      />

      <DispatchReassignDialog
        isOpen={reassignModal.isOpen}
        onClose={closeReassignModal}
        orderId={reassignModal.orderId}
        orderCode={reassignModal.orderCode}
        currentHouseId={reassignModal.currentHouseId}
        currentHouseName={reassignModal.currentHouseName}
        availablePressings={availablePressings}
        onSuccess={onRefresh}
      />
    </div>
  );
}
