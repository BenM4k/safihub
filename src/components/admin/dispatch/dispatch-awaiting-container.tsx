"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  ArrowUpDown,
  Filter,
  Layers,
  List,
  RefreshCw,
  Search,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DispatchPressingGroupCard } from "./dispatch-pressing-group-card";
import { DispatchOrderRow } from "./dispatch-order-row";
import { DispatchOrderDetailsSheet } from "./dispatch-order-details-sheet";
import { DispatchCallOutcomeModal } from "./dispatch-call-outcome-modal";
import { DispatchReassignDialog } from "./dispatch-reassign-dialog";
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
  const t = useTranslations("admin.dispatch");
  const [viewMode, setViewMode] = useState<"pressing" | "order">("pressing");
  const [search, setSearch] = useState("");
  const [delayFilter, setDelayFilter] = useState<DelayFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("oldest");
  const [expandedGroupIds, setExpandedGroupIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const pageSize = 15;

  // Selected modals/drawers
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<EnrichedDispatchOrder | null>(null);
  const [outcomeModal, setOutcomeModal] = useState<{
    isOpen: boolean;
    pressingId: string;
    pressingName: string;
    orderIds: string[];
    channel: "call" | "whatsapp";
  }>({
    isOpen: false,
    pressingId: "",
    pressingName: "",
    orderIds: [],
    channel: "call",
  });
  const [reassignModal, setReassignModal] = useState<{
    isOpen: boolean;
    orderId: string;
    orderCode?: string;
    currentHouseId: string;
    currentHouseName?: string;
  }>({
    isOpen: false,
    orderId: "",
    currentHouseId: "",
  });

  // Compute groups and filtered data
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

  // Pagination slice
  const totalItems = viewMode === "pressing" ? filteredGroups.length : filteredOrders.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedGroups = filteredGroups.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
      {/* Sticky Header with Controls */}
      <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-xs border-b border-border p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-heading font-display">
                {t("awaitingAcceptanceTitle")}
              </h2>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                {orders.length}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              SLA 45 minutes • Chasse proactive des pressings partenaires
            </p>
          </div>

          {/* View toggle & Refresh button */}
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-lg border border-border p-0.5 bg-muted">
              <button
                type="button"
                onClick={() => setViewMode("pressing")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  viewMode === "pressing"
                    ? "bg-card text-heading shadow-xs"
                    : "text-muted-foreground hover:text-heading"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                {t("viewByPressing")}
              </button>
              <button
                type="button"
                onClick={() => setViewMode("order")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  viewMode === "order"
                    ? "bg-card text-heading shadow-xs"
                    : "text-muted-foreground hover:text-heading"
                }`}
              >
                <List className="w-3.5 h-3.5" />
                {t("viewByOrder")}
              </button>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="text-xs min-h-[36px] px-3 border-border hover:bg-muted text-foreground"
              aria-label={t("refreshNow")}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-primary" : "text-ink-400"}`} />
            </Button>
          </div>
        </div>

        {/* Search, Filter & Sort bar */}
        <div className="flex flex-col md:flex-row gap-2 pt-1">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder={t("searchPlaceholder")}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-heading placeholder:text-ink-400"
            />
          </div>

          {/* Delay filter */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Filter className="w-3.5 h-3.5 text-ink-400 hidden sm:block" />
            <select
              value={delayFilter}
              onChange={(e) => {
                setDelayFilter(e.target.value as DelayFilter);
                setPage(1);
              }}
              className="text-xs py-2 px-3 rounded-lg border border-border bg-card text-heading focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">{t("filterDelayAll")}</option>
              <option value="overdue">{t("filterDelayOverdue")}</option>
              <option value="critical">{t("filterDelayCritical")}</option>
              <option value="never_relanced">{t("filterDelayNeverRelanced")}</option>
            </select>
          </div>

          {/* Sort option */}
          <div className="flex items-center gap-1.5 shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-ink-400 hidden sm:block" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="text-xs py-2 px-3 rounded-lg border border-border bg-card text-heading focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="oldest">{t("sortOldest")}</option>
              <option value="newest">{t("sortNewest")}</option>
              {viewMode === "pressing" && (
                <option value="order_count">{t("sortOrderCount")}</option>
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="divide-y divide-border">
        {totalItems === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-success-soft text-success flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-heading">{t("emptyAwaiting")}</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">{t("emptyAwaitingDesc")}</p>
            </div>
          </div>
        ) : viewMode === "pressing" ? (
          <div className="p-4 space-y-3">
            {paginatedGroups.map((group) => (
              <DispatchPressingGroupCard
                key={group.houseId}
                group={group}
                isExpanded={expandedGroupIds.has(group.houseId)}
                onToggleExpand={() => toggleExpandGroup(group.houseId)}
                onSelectOrder={(ord) => setSelectedOrderForDetails(ord)}
                onOpenOutcomeModal={(ord, channel) =>
                  setOutcomeModal({
                    isOpen: true,
                    pressingId: ord.houseId,
                    pressingName: ord.houseName || "Pressing",
                    orderIds: [ord.id],
                    channel,
                  })
                }
                onOpenGroupOutcomeModal={(grp, channel) =>
                  setOutcomeModal({
                    isOpen: true,
                    pressingId: grp.houseId,
                    pressingName: grp.houseName,
                    orderIds: grp.orderIds,
                    channel,
                  })
                }
                onOpenReassignDialog={(ord) =>
                  setReassignModal({
                    isOpen: true,
                    orderId: ord.id,
                    orderCode: ord.code,
                    currentHouseId: ord.houseId,
                    currentHouseName: ord.houseName,
                  })
                }
              />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {paginatedOrders.map((order) => (
              <DispatchOrderRow
                key={order.id}
                order={order}
                onSelectOrder={(ord) => setSelectedOrderForDetails(ord)}
                onOpenOutcomeModal={(ord, channel) =>
                  setOutcomeModal({
                    isOpen: true,
                    pressingId: ord.houseId,
                    pressingName: ord.houseName || "Pressing",
                    orderIds: [ord.id],
                    channel,
                  })
                }
                onOpenReassignDialog={(ord) =>
                  setReassignModal({
                    isOpen: true,
                    orderId: ord.id,
                    orderCode: ord.code,
                    currentHouseId: ord.houseId,
                    currentHouseName: ord.houseName,
                  })
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground bg-surface">
          <span>
            Affichage de {(currentPage - 1) * pageSize + 1} à{" "}
            {Math.min(currentPage * pageSize, totalItems)} sur {totalItems} {viewMode === "pressing" ? "groupes" : "commandes"}
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="text-xs h-8 px-3 border-border hover:bg-muted text-foreground"
            >
              Précédent
            </Button>
            <span className="font-semibold text-heading px-2">
              {currentPage} / {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="text-xs h-8 px-3"
            >
              Suivant
            </Button>
          </div>
        </div>
      )}

      {/* Slide-over Details Sheet */}
      <DispatchOrderDetailsSheet
        order={selectedOrderForDetails}
        onClose={() => setSelectedOrderForDetails(null)}
        onOpenOutcomeModal={(ord, channel) =>
          setOutcomeModal({
            isOpen: true,
            pressingId: ord.houseId,
            pressingName: ord.houseName || "Pressing",
            orderIds: [ord.id],
            channel,
          })
        }
        onOpenReassignDialog={(ord) =>
          setReassignModal({
            isOpen: true,
            orderId: ord.id,
            orderCode: ord.code,
            currentHouseId: ord.houseId,
            currentHouseName: ord.houseName,
          })
        }
      />

      {/* Call / Follow-up Outcome Modal */}
      <DispatchCallOutcomeModal
        isOpen={outcomeModal.isOpen}
        onClose={() => setOutcomeModal((prev) => ({ ...prev, isOpen: false }))}
        pressingId={outcomeModal.pressingId}
        pressingName={outcomeModal.pressingName}
        orderIds={outcomeModal.orderIds}
        channel={outcomeModal.channel}
        onSuccess={onRefresh}
      />

      {/* Reassign Dialog */}
      <DispatchReassignDialog
        isOpen={reassignModal.isOpen}
        onClose={() => setReassignModal((prev) => ({ ...prev, isOpen: false }))}
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
