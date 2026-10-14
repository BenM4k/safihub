"use client";

import { useEffect, useMemo, useState } from "react";
import type { OrderListItemRecord } from "@/dal";
import { getOrderStatusConfig } from "@/lib/order-formatters";
import type { FilterState } from "./orders-filter-bar";
import type { SortDirection, SortField } from "./orders-data-table";

export function useOrdersFilter(initialOrders: OrderListItemRecord[]) {
  const [now, setNow] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setNow(Date.now());
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const [filters, setFilters] = useState<FilterState>({
    search: "",
    tab: "all",
    dateRange: "30d",
    houseId: "",
    source: "",
  });

  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Compute live counts across entire dataset
  const stats = useMemo(() => {
    const referenceNow = now || (initialOrders.length > 0 ? new Date(initialOrders[0].createdAt).getTime() : 0);
    const oneDayMs = 24 * 60 * 60 * 1000;

    let today = 0;
    let awaiting = 0;
    let inProgress = 0;
    let delivered = 0;
    let cancelled = 0;

    for (const o of initialOrders) {
      const orderTime = new Date(o.createdAt).getTime();
      if (referenceNow - orderTime <= oneDayMs) today++;

      const category = getOrderStatusConfig(o.status).category;
      if (category === "pending") awaiting++;
      else if (category === "progress") inProgress++;
      else if (category === "delivered") delivered++;
      else if (category === "cancelled") cancelled++;
    }

    return {
      today,
      awaiting,
      inProgress,
      delivered,
      cancelled,
      all: initialOrders.length,
    };
  }, [initialOrders, now]);

  const tabCounts = useMemo(
    () => ({
      all: stats.all,
      awaiting: stats.awaiting,
      in_progress: stats.inProgress,
      delivered: stats.delivered,
      cancelled: stats.cancelled,
    }),
    [stats]
  );

  // Filtered dataset
  const filteredOrders = useMemo(() => {
    const referenceNow = now || (initialOrders.length > 0 ? new Date(initialOrders[0].createdAt).getTime() : 0);
    const dayMs = 24 * 60 * 60 * 1000;

    return initialOrders.filter((o) => {
      // 1. Tab / Category filter
      if (filters.tab !== "all") {
        if (filters.tab === "today") {
          if (referenceNow - new Date(o.createdAt).getTime() > dayMs) return false;
        } else {
          const category = getOrderStatusConfig(o.status).category;
          if (filters.tab === "awaiting" && category !== "pending") return false;
          if (filters.tab === "in_progress" && category !== "progress") return false;
          if (filters.tab === "delivered" && category !== "delivered") return false;
          if (filters.tab === "cancelled" && category !== "cancelled") return false;
        }
      }

      // 2. Date Range filter
      if (filters.dateRange !== "all") {
        const orderTime = new Date(o.createdAt).getTime();
        const diff = referenceNow - orderTime;
        if (filters.dateRange === "today" && diff > dayMs) return false;
        if (filters.dateRange === "7d" && diff > 7 * dayMs) return false;
        if (filters.dateRange === "30d" && diff > 30 * dayMs) return false;
      }

      // 3. House filter
      if (filters.houseId && o.houseId !== filters.houseId) return false;

      // 4. Source filter
      if (filters.source && o.source !== filters.source) return false;

      // 5. Search query
      if (filters.search.trim()) {
        const q = filters.search.trim().toLowerCase();
        const matchCode = o.code?.toLowerCase().includes(q);
        const matchPhone = o.customerPhone?.toLowerCase().includes(q);
        const matchName = o.customerName?.toLowerCase().includes(q);
        const matchHouse = o.houseName?.toLowerCase().includes(q);
        if (!matchCode && !matchPhone && !matchName && !matchHouse) return false;
      }

      return true;
    });
  }, [initialOrders, filters, now]);

  // Sorted dataset
  const sortedOrders = useMemo(() => {
    return [...filteredOrders].sort((a, b) => {
      let comparison = 0;
      if (sortField === "date") {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortField === "amount") {
        comparison = a.totalDue - b.totalDue;
      } else if (sortField === "code") {
        comparison = (a.code || "").localeCompare(b.code || "");
      } else if (sortField === "customer") {
        comparison = (a.customerName || a.customerPhone || "").localeCompare(
          b.customerName || b.customerPhone || ""
        );
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredOrders, sortField, sortDirection]);

  // Paginated slice
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedOrders.slice(start, start + pageSize);
  }, [sortedOrders, currentPage, pageSize]);

  function handleFilterChange(partial: Partial<FilterState>) {
    setFilters((prev) => ({ ...prev, ...partial }));
    setCurrentPage(1);
    setSelectedIds([]);
  }

  function handleResetFilters() {
    setFilters({
      search: "",
      tab: "all",
      dateRange: "30d",
      houseId: "",
      source: "",
    });
    setCurrentPage(1);
    setSelectedIds([]);
  }

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
    setCurrentPage(1);
  }

  function handleToggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  function handleToggleSelectAll() {
    const isAllSelected =
      paginatedOrders.length > 0 &&
      paginatedOrders.every((o) => selectedIds.includes(o.id));

    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedOrders.map((o) => o.id));
    }
  }

  return {
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
  };
}
