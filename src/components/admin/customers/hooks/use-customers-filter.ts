"use client";

import { useMemo, useState } from "react";
import { isTestCustomer } from "@/lib/customer-formatters";
import type {
  CustomerFiltersState,
  CustomerRow,
  SortState,
  SortableField,
} from "../types";

export function useCustomersFilter(customers: CustomerRow[]) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortState, setSortState] = useState<SortState>({
    field: "createdAt",
    direction: "desc",
  });

  const [filters, setFilters] = useState<CustomerFiltersState>({
    search: "",
    status: "all",
    type: "all",
    hasOrdered: false,
    hideTestAccounts: false,
    dateFrom: "",
    dateTo: "",
  });

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (filters.hideTestAccounts && isTestCustomer(c)) return false;
      if (filters.status === "active" && (c.banned || c.status === "blocked")) return false;
      if (filters.status === "blocked" && !c.banned && c.status !== "blocked") return false;
      if (filters.type === "registered" && c.isGuest) return false;
      if (filters.type === "guest" && !c.isGuest) return false;
      if (filters.hasOrdered && c.ordersCount === 0) return false;

      if (filters.dateFrom) {
        const [year, month, day] = filters.dateFrom.split("-").map(Number);
        const from = new Date(year, month - 1, day, 0, 0, 0, 0);
        if (new Date(c.createdAt) < from) return false;
      }
      if (filters.dateTo) {
        const [year, month, day] = filters.dateTo.split("-").map(Number);
        const to = new Date(year, month - 1, day, 23, 59, 59, 999);
        if (new Date(c.createdAt) > to) return false;
      }

      if (filters.search.trim()) {
        const q = filters.search.toLowerCase();
        const matchesName = (c.name || "").toLowerCase().includes(q);
        const matchesEmail = (c.email || "").toLowerCase().includes(q);
        const matchesPhone = (c.contactPhone || "").toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesPhone) return false;
      }

      return true;
    });
  }, [customers, filters]);

  const sortedCustomers = useMemo(() => {
    const list = [...filteredCustomers];
    const { field, direction } = sortState;

    list.sort((a, b) => {
      let comparison = 0;
      if (field === "name") {
        comparison = (a.name || "").localeCompare(b.name || "");
      } else if (field === "ordersCount") {
        comparison = a.ordersCount - b.ordersCount;
      } else if (field === "totalSpentCDF") {
        comparison = a.totalSpentCDF - b.totalSpentCDF;
      } else {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return direction === "asc" ? comparison : -comparison;
    });

    return list;
  }, [filteredCustomers, sortState]);

  const pagedCustomers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedCustomers.slice(start, start + pageSize);
  }, [sortedCustomers, currentPage, pageSize]);

  const handleSortChange = (field: SortableField) => {
    setSortState((prev) => ({
      field,
      direction: prev.field === field && prev.direction === "desc" ? "asc" : "desc",
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      status: "all",
      type: "all",
      hasOrdered: false,
      hideTestAccounts: false,
      dateFrom: "",
      dateTo: "",
    });
    setCurrentPage(1);
  };

  const registeredCount = useMemo(() => customers.filter((c) => !c.isGuest).length, [customers]);
  const guestCount = useMemo(() => customers.filter((c) => c.isGuest).length, [customers]);

  return {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    sortState,
    filters,
    setFilters,
    filteredCustomers,
    sortedCustomers,
    pagedCustomers,
    handleSortChange,
    handleResetFilters,
    registeredCount,
    guestCount,
  };
}
