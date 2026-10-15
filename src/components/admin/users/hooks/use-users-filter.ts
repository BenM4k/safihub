"use client";

import { useMemo, useState } from "react";
import { isTestStaffAccount } from "@/lib/user-guardrails";
import type {
  SortableUserField,
  UserFiltersState,
  UserRow,
  UserSortState,
} from "../types";

export function useUsersFilter(users: UserRow[]) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortState, setSortState] = useState<UserSortState>({
    field: "createdAt",
    direction: "desc",
  });

  // Default type to 'staff' and hide test accounts by default as required
  const [filters, setFilters] = useState<UserFiltersState>({
    search: "",
    role: "all",
    status: "all",
    type: "staff",
    hideTestAccounts: true,
  });

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (filters.hideTestAccounts && isTestStaffAccount(u)) {
        return false;
      }

      if (filters.type === "staff" && u.role === "customer") {
        return false;
      }
      if (filters.type === "customer" && u.role !== "customer") {
        return false;
      }

      if (filters.role !== "all" && u.role !== filters.role) {
        return false;
      }

      const isBlocked = u.banned || u.status === "blocked";
      if (filters.status === "active" && (isBlocked || u.status === "invitation_sent")) {
        return false;
      }
      if (filters.status === "blocked" && !isBlocked) {
        return false;
      }
      if (filters.status === "invitation_sent" && u.status !== "invitation_sent") {
        return false;
      }

      if (filters.search.trim()) {
        const q = filters.search.toLowerCase();
        const matchesName = (u.name || "").toLowerCase().includes(q);
        const matchesEmail = (u.email || "").toLowerCase().includes(q);
        const matchesPhone = (u.contactPhone || "").toLowerCase().includes(q);
        const matchesHouse = (u.houseName || "").toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesPhone && !matchesHouse) {
          return false;
        }
      }

      return true;
    });
  }, [users, filters]);

  const sortedUsers = useMemo(() => {
    const list = [...filteredUsers];
    const { field, direction } = sortState;

    list.sort((a, b) => {
      let comparison = 0;
      if (field === "name") {
        comparison = (a.name || "").localeCompare(b.name || "");
      } else if (field === "role") {
        comparison = (a.role || "").localeCompare(b.role || "");
      } else if (field === "status") {
        comparison = (a.status || "").localeCompare(b.status || "");
      } else if (field === "lastLoginAt") {
        const timeA = a.lastLoginAt ? new Date(a.lastLoginAt).getTime() : 0;
        const timeB = b.lastLoginAt ? new Date(b.lastLoginAt).getTime() : 0;
        comparison = timeA - timeB;
      } else {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return direction === "asc" ? comparison : -comparison;
    });

    return list;
  }, [filteredUsers, sortState]);

  const pagedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedUsers.slice(start, start + pageSize);
  }, [sortedUsers, currentPage, pageSize]);

  const handleSortChange = (field: SortableUserField) => {
    setSortState((prev) => ({
      field,
      direction: prev.field === field && prev.direction === "desc" ? "asc" : "desc",
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      role: "all",
      status: "all",
      type: "staff",
      hideTestAccounts: true,
    });
    setCurrentPage(1);
  };

  // KPI counts computed over users (respecting hideTestAccounts toggle)
  const baseUsersForKpis = useMemo(() => {
    if (!filters.hideTestAccounts) return users;
    return users.filter((u) => !isTestStaffAccount(u));
  }, [users, filters.hideTestAccounts]);

  const staffCount = useMemo(
    () => baseUsersForKpis.filter((u) => u.role !== "customer").length,
    [baseUsersForKpis]
  );
  const activeCount = useMemo(
    () => baseUsersForKpis.filter((u) => !u.banned && u.status !== "blocked").length,
    [baseUsersForKpis]
  );
  const blockedCount = useMemo(
    () => baseUsersForKpis.filter((u) => u.banned || u.status === "blocked").length,
    [baseUsersForKpis]
  );

  return {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    sortState,
    filters,
    setFilters,
    sortedUsers,
    pagedUsers,
    handleSortChange,
    handleResetFilters,
    staffCount,
    activeCount,
    blockedCount,
  };
}
