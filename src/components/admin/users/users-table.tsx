"use client";

import { useTranslations } from "next-intl";
import { ArrowUpDown, RotateCcw, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
      <TableHead
        scope="col"
        aria-sort={ariaSort}
        className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground select-none"
      >
        <button
          type="button"
          onClick={() => onSortChange(field)}
          className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors focus:outline-none focus-visible:underline cursor-pointer"
        >
          <span>{label}</span>
          <ArrowUpDown
            className={`size-3 transition-colors ${
              isSorted ? "text-primary" : "text-muted-foreground/60"
            }`}
          />
        </button>
      </TableHead>
    );
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto max-h-[70vh]">
        <Table className="w-full text-left text-xs border-collapse">
          <TableHeader className="bg-muted/30 border-b border-border sticky top-0 z-10">
            <TableRow className="hover:bg-transparent border-b border-border">
              {renderSortableHeader(t("colName"), "name")}
              <TableHead scope="col" className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                {t("colEmail")}
              </TableHead>
              <TableHead scope="col" className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                {t("colPhone")}
              </TableHead>
              {renderSortableHeader(t("colRole"), "role")}
              <TableHead scope="col" className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                {t("colHouse")}
              </TableHead>
              {renderSortableHeader(t("colLastLogin"), "lastLoginAt")}
              {renderSortableHeader(t("colStatus"), "status")}
              <TableHead scope="col" className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">
                {t("colActions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border bg-card">
            {users.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={8} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="size-12 rounded-xl bg-muted/50 border border-border flex items-center justify-center text-muted-foreground">
                      <Users className="size-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">
                        {t("emptyTitle")}
                      </p>
                      <p className="text-xs text-muted-foreground max-w-sm">
                        {t("emptySubtitle")}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onResetFilters}
                      className="gap-2 mt-2"
                    >
                      <RotateCcw className="size-3.5" />
                      <span>{t("resetFilters")}</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
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
          </TableBody>
        </Table>
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
