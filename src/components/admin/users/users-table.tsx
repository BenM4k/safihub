"use client";

import { useTranslations } from "next-intl";
import { ArrowUpDown, Users, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UsersTablePagination } from "./users-table-pagination";
import { UsersTableRow } from "./users-table-row";
import type { SortableUserField, UserRow, UserSortState } from "./types";

interface UsersTableProps {
  users: UserRow[];
  totalItems: number;
  currentPage: number;
  pageSize: number;
  currentUserId?: string | null;
  isAdmin: boolean;
  activeAdminsCount: number;
  sortState: UserSortState;
  selectedUserId?: string | null;
  onSortChange: (field: SortableUserField) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onResetFilters: () => void;
  onSelectUser: (user: UserRow) => void;
  onViewProfile: (user: UserRow) => void;
  onChangeRole: (user: UserRow) => void;
  onResetPassword: (user: UserRow) => void;
  onViewActivity: (user: UserRow) => void;
  onToggleBlock: (user: UserRow) => void;
}

export function UsersTable({
  users,
  totalItems,
  currentPage,
  pageSize,
  currentUserId,
  isAdmin,
  activeAdminsCount,
  sortState,
  selectedUserId,
  onSortChange,
  onPageChange,
  onPageSizeChange,
  onResetFilters,
  onSelectUser,
  onViewProfile,
  onChangeRole,
  onResetPassword,
  onViewActivity,
  onToggleBlock,
}: UsersTableProps) {
  const t = useTranslations("admin.users");

  const renderSortableHeader = (label: string, field: SortableUserField) => {
    const isSorted = sortState.field === field;
    const ariaSort = isSorted
      ? sortState.direction === "asc"
        ? "ascending"
        : "descending"
      : undefined;

    return (
      <th
        scope="col"
        aria-sort={ariaSort}
        className="px-4 py-3 text-left text-xs font-bold text-ink-700 select-none"
      >
        <button
          type="button"
          onClick={() => onSortChange(field)}
          className="inline-flex items-center gap-1.5 hover:text-primary transition-colors focus:outline-none focus-visible:underline cursor-pointer"
        >
          <span>{label}</span>
          <ArrowUpDown
            className={`size-3 transition-colors ${
              isSorted ? "text-primary" : "text-ink-400"
            }`}
          />
        </button>
      </th>
    );
  };

  return (
    <div className="bg-card rounded-2xl border-2 border-border-strong shadow-2xs overflow-hidden">
      <div className="overflow-x-auto max-h-[70vh]">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-surface border-b-2 border-border-strong sticky top-0 z-10">
            <tr>
              {renderSortableHeader(t("colName"), "name")}
              <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-ink-700">
                {t("colEmail")}
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-ink-700">
                {t("colPhone")}
              </th>
              {renderSortableHeader(t("colRole"), "role")}
              <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-ink-700">
                {t("colHouse")}
              </th>
              {renderSortableHeader(t("colLastLogin"), "lastLoginAt")}
              {renderSortableHeader(t("colStatus"), "status")}
              <th scope="col" className="px-4 py-3 text-right text-xs font-bold text-ink-700">
                {t("colActions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-border-strong/70 bg-card">
            {users.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="size-12 rounded-2xl bg-surface border-2 border-border-strong flex items-center justify-center text-ink-400">
                      <Users className="size-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-heading">
                        {t("emptyTitle")}
                      </p>
                      <p className="text-xs text-ink-500 max-w-sm">
                        {t("emptySubtitle")}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onResetFilters}
                      className="min-h-[40px] px-4 text-xs font-semibold border-2 border-border-strong bg-surface hover:bg-muted gap-2 rounded-xl mt-2"
                    >
                      <RotateCcw className="size-3.5" />
                      <span>{t("resetFilters")}</span>
                    </Button>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <UsersTableRow
                  key={u.id}
                  user={u}
                  currentUserId={currentUserId}
                  isAdmin={isAdmin}
                  activeAdminsCount={activeAdminsCount}
                  isSelected={selectedUserId === u.id}
                  onSelect={onSelectUser}
                  onViewProfile={onViewProfile}
                  onChangeRole={onChangeRole}
                  onResetPassword={onResetPassword}
                  onViewActivity={onViewActivity}
                  onToggleBlock={onToggleBlock}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <UsersTablePagination
        totalItems={totalItems}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
}
