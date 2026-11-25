"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  buildAdminCustomersQueryString,
  parseAdminCustomersSearchParams,
  type AdminCustomersUrlState,
} from "@/lib/admin-customers-query";
import { useCustomersFilter } from "./use-customers-filter";
import type { CustomerFiltersState, CustomerRow } from "../types";

export function useCustomersUrlState(
  initialCustomers: CustomerRow[],
  initialUrlState?: AdminCustomersUrlState
) {
  const router = useRouter();
  const pathname = usePathname();
  const liveSearchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const filterState = useCustomersFilter(initialCustomers, initialUrlState);
  const {
    pageSize,
    filters,
    setFilters,
    setCurrentPage,
    setPageSize,
    handleResetFilters,
  } = filterState;

  const searchKey = liveSearchParams.toString();
  const [trackedSearchKey, setTrackedSearchKey] = useState(searchKey);

  if (trackedSearchKey !== searchKey) {
    setTrackedSearchKey(searchKey);
    const parsed = parseAdminCustomersSearchParams(
      Object.fromEntries(new URLSearchParams(searchKey).entries())
    );
    setFilters(parsed.filters);
    setCurrentPage(parsed.page);
    setPageSize(parsed.pageSize);
  }

  function syncUrl(next: AdminCustomersUrlState) {
    const qs = buildAdminCustomersQueryString(next);
    startTransition(() => {
      router.replace(qs ? `${pathname}${qs}` : pathname, { scroll: false });
    });
  }

  function handleFiltersUpdate(nextFilters: CustomerFiltersState) {
    setFilters(nextFilters);
    setCurrentPage(1);
    syncUrl({ filters: nextFilters, page: 1, pageSize });
  }

  function handleResetAll() {
    handleResetFilters();
    syncUrl({
      filters: {
        search: "",
        status: "all",
        type: "all",
        hasOrdered: false,
        hideTestAccounts: false,
        dateFrom: "",
        dateTo: "",
      },
      page: 1,
      pageSize,
    });
  }

  function handlePageChange(page: number) {
    setCurrentPage(page);
    syncUrl({ filters, page, pageSize });
  }

  function handlePageSizeChange(nextSize: number) {
    setPageSize(nextSize);
    setCurrentPage(1);
    syncUrl({ filters, page: 1, pageSize: nextSize });
  }

  function handleRefresh() {
    startTransition(() => {
      router.refresh();
    });
  }

  return {
    ...filterState,
    isPending,
    handleFiltersUpdate,
    handleResetAll,
    handlePageChange,
    handlePageSizeChange,
    handleRefresh,
  };
}
