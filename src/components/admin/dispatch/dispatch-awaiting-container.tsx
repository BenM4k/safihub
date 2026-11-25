"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DispatchAwaitingToolbar } from "./dispatch-awaiting-toolbar";
import { DispatchAwaitingEmpty } from "./dispatch-awaiting-empty";
import { DataTablePagination } from "@/components/admin/shared/data-table-pagination";
import { DispatchPressingGroupCard } from "./dispatch-pressing-group-card";
import { DispatchOrderRow } from "./dispatch-order-row";
import { useDispatchModals } from "./use-dispatch-modals";
import {
  buildAdminDispatchQueryString,
  parseAdminDispatchSearchParams,
  type AdminDispatchQueryParams,
} from "@/lib/admin-dispatch-query";
import {
  filterAndSortGroups,
  filterAndSortOrders,
  groupOrdersByPressing,
  type DelayFilter,
  type EnrichedDispatchOrder,
  type SortOption,
} from "@/lib/dispatch-grouping";
import type { AvailablePressingOption } from "@/services/admin";

const DispatchOrderDetailsSheet = dynamic(
  () =>
    import("./dispatch-order-details-sheet").then(
      (m) => m.DispatchOrderDetailsSheet
    ),
  { ssr: false }
);

const DispatchCallOutcomeModal = dynamic(
  () =>
    import("./dispatch-call-outcome-modal").then(
      (m) => m.DispatchCallOutcomeModal
    ),
  { ssr: false }
);

const DispatchReassignDialog = dynamic(
  () =>
    import("./dispatch-reassign-dialog").then((m) => m.DispatchReassignDialog),
  { ssr: false }
);

interface DispatchAwaitingContainerProps {
  orders: EnrichedDispatchOrder[];
  availablePressings: AvailablePressingOption[];
  initialQuery: AdminDispatchQueryParams;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

interface LocalAwaitingState {
  view: "pressing" | "order";
  search: string;
  delay: DelayFilter;
  sort: SortOption;
  page: number;
}

export function DispatchAwaitingContainer({
  orders,
  availablePressings,
  initialQuery,
  onRefresh,
  isRefreshing,
}: DispatchAwaitingContainerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const liveSearchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [viewMode, setViewMode] = useState<"pressing" | "order">(initialQuery.view);
  const [search, setSearch] = useState(initialQuery.search);
  const [delayFilter, setDelayFilter] = useState<DelayFilter>(initialQuery.delay);
  const [sortBy, setSortBy] = useState<SortOption>(initialQuery.sort);
  const [page, setPage] = useState(initialQuery.page);
  const [expandedGroupIds, setExpandedGroupIds] = useState<Set<string>>(new Set());
  const pageSize = 15;

  const latestStateRef = useRef<LocalAwaitingState>({
    view: initialQuery.view,
    search: initialQuery.search,
    delay: initialQuery.delay,
    sort: initialQuery.sort,
    page: initialQuery.page,
  });

  const searchKey = liveSearchParams.toString();
  const [trackedSearchKey, setTrackedSearchKey] = useState(searchKey);

  if (trackedSearchKey !== searchKey) {
    setTrackedSearchKey(searchKey);
    const parsed = parseAdminDispatchSearchParams(
      Object.fromEntries(new URLSearchParams(searchKey).entries())
    );
    setViewMode(parsed.view);
    setSearch(parsed.search);
    setDelayFilter(parsed.delay);
    setSortBy(parsed.sort);
    setPage(parsed.page);
  }

  useEffect(() => {
    latestStateRef.current = {
      view: viewMode,
      search,
      delay: delayFilter,
      sort: sortBy,
      page,
    };
  }, [viewMode, search, delayFilter, sortBy, page]);

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

  function applyStateAndSyncUrl(partial: Partial<LocalAwaitingState>) {
    const nextState: LocalAwaitingState = {
      ...latestStateRef.current,
      ...partial,
    };
    latestStateRef.current = nextState;

    setViewMode(nextState.view);
    setSearch(nextState.search);
    setDelayFilter(nextState.delay);
    setSortBy(nextState.sort);
    setPage(nextState.page);

    const urlParsed = parseAdminDispatchSearchParams(
      Object.fromEntries(liveSearchParams.entries())
    );
    const qs = buildAdminDispatchQueryString({
      tab: urlParsed.tab,
      view: nextState.view,
      search: nextState.search,
      delay: nextState.delay,
      sort: nextState.sort,
      page: nextState.page,
    });
    startTransition(() => {
      router.replace(qs ? `${pathname}${qs}` : pathname, { scroll: false });
    });
  }

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

  const totalItems =
    viewMode === "pressing" ? filteredGroups.length : filteredOrders.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedGroups = filteredGroups.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="rounded-xl border border-border bg-background overflow-hidden">
      <DispatchAwaitingToolbar
        totalOrdersCount={orders.length}
        viewMode={viewMode}
        onChangeViewMode={(mode) => applyStateAndSyncUrl({ view: mode, page: 1 })}
        search={search}
        onSearchChange={(s) => applyStateAndSyncUrl({ search: s, page: 1 })}
        delayFilter={delayFilter}
        onDelayFilterChange={(f) => applyStateAndSyncUrl({ delay: f, page: 1 })}
        sortBy={sortBy}
        onSortByChange={(s) => applyStateAndSyncUrl({ sort: s })}
        onRefresh={onRefresh}
        isRefreshing={isRefreshing || isPending}
      />

      {totalItems === 0 ? (
        <DispatchAwaitingEmpty />
      ) : viewMode === "pressing" ? (
        <div className="p-4 space-y-3 animate-stagger">
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
        <div className="divide-y divide-border animate-stagger">
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

      <DataTablePagination
        page={currentPage}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={(nextPage) => applyStateAndSyncUrl({ page: nextPage })}
        hideIfSinglePage
      />

      {selectedOrderForDetails && (
        <DispatchOrderDetailsSheet
          order={selectedOrderForDetails}
          onClose={() => setSelectedOrderForDetails(null)}
          onOpenOutcomeModal={openOrderOutcome}
          onOpenReassignDialog={openReassign}
        />
      )}

      {outcomeModal.isOpen && (
        <DispatchCallOutcomeModal
          isOpen={outcomeModal.isOpen}
          onClose={closeOutcomeModal}
          pressingId={outcomeModal.pressingId}
          pressingName={outcomeModal.pressingName}
          orderIds={outcomeModal.orderIds}
          channel={outcomeModal.channel}
          onSuccess={onRefresh}
        />
      )}

      {reassignModal.isOpen && (
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
      )}
    </div>
  );
}
