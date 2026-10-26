"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/shared/page-header";
import { UsersDialogsContainer } from "./users-dialogs-container";
import { useUsersFilter } from "./hooks/use-users-filter";
import { exportUsersCsv } from "./users-export";
import { UsersKpiBadges } from "./users-kpi-badges";
import { UsersTable } from "./users-table";
import { UsersTableToolbar } from "./users-table-toolbar";
import type { UserDetailsTab, UserFiltersState, UserRow } from "./types";

interface UsersManagementViewProps {
  initialUsers: UserRow[];
  houses: Array<{ id: string; name: string }>;
  currentUserId?: string | null;
  isAdmin: boolean;
  activeAdminsCount: number;
  initialFilters?: Partial<UserFiltersState>;
}

export function UsersManagementView({
  initialUsers,
  houses,
  currentUserId,
  isAdmin,
  activeAdminsCount,
  initialFilters,
}: UsersManagementViewProps) {
  const router = useRouter();
  const t = useTranslations("admin.users");

  const {
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
  } = useUsersFilter(initialUsers, initialFilters);

  // Sheets & Dialogs State
  const [createSheetOpen, setCreateSheetOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const selectedUser = selectedUserId
    ? initialUsers.find((u) => u.id === selectedUserId) ?? null
    : null;
  const [detailsTab, setDetailsTab] = useState<UserDetailsTab>("profile");
  const [userToBlock, setUserToBlock] = useState<UserRow | null>(null);
  const [userToUnblock, setUserToUnblock] = useState<UserRow | null>(null);
  const [userToChangeRole, setUserToChangeRole] = useState<UserRow | null>(null);
  const [userToResetPassword, setUserToResetPassword] = useState<UserRow | null>(null);

  const handleRefresh = () => {
    router.refresh();
  };

  const handleSelectUser = (user: UserRow, tab: UserDetailsTab = "profile") => {
    setSelectedUserId(user.id);
    setDetailsTab(tab);
  };

  const handleToggleBlock = (user: UserRow) => {
    const isBlocked = user.banned || user.status === "blocked";
    if (isBlocked) {
      setUserToUnblock(user);
    } else {
      setUserToBlock(user);
    }
  };

  return (
    <div className="space-y-4">
      {/* Page Header with primary action & KPI badges */}
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          <Button
            type="button"
            disabled={!isAdmin}
            onClick={() => setCreateSheetOpen(true)}
            className="gap-2"
            aria-label={t("addMember")}
          >
            <UserPlus className="size-4" />
            <span>{t("addMember")}</span>
          </Button>
        }
      >
        <UsersKpiBadges
          totalCount={initialUsers.length}
          staffCount={staffCount}
          activeCount={activeCount}
          blockedCount={blockedCount}
        />
      </PageHeader>

      {/* Filter and Search Toolbar */}
      <UsersTableToolbar
        filters={filters}
        onChange={(next) => {
          setFilters(next);
          setCurrentPage(1);
        }}
        onReset={handleResetFilters}
        onExport={() =>
          exportUsersCsv(sortedUsers, {
            id: t("colUserId"),
            name: t("colName"),
            email: t("colEmail"),
            phone: t("colPhone"),
            role: t("colRole"),
            house: t("colHouse"),
            status: t("colStatus"),
            lastLogin: t("colLastLogin"),
            createdAt: t("colCreatedAt"),
            blocked: t("statusBlocked"),
            invited: t("statusInvited"),
            active: t("statusActive"),
            neverLoggedIn: t("neverLoggedIn"),
          })
        }
        totalFiltered={sortedUsers.length}
      />

      {/* Main Table */}
      <UsersTable
        users={pagedUsers}
        totalItems={sortedUsers.length}
        currentPage={currentPage}
        pageSize={pageSize}
        currentUserId={currentUserId}
        isAdmin={isAdmin}
        activeAdminsCount={activeAdminsCount}
        sortState={sortState}
        selectedUserId={selectedUser?.id}
        onSortChange={handleSortChange}
        onPageChange={setCurrentPage}
        onPageSizeChange={(sz) => {
          setPageSize(sz);
          setCurrentPage(1);
        }}
        onResetFilters={handleResetFilters}
        onSelectUser={(u) => handleSelectUser(u, "profile")}
        onViewProfile={(u) => handleSelectUser(u, "profile")}
        onChangeRole={(u) => setUserToChangeRole(u)}
        onResetPassword={(u) => setUserToResetPassword(u)}
        onViewActivity={(u) => handleSelectUser(u, "activity")}
        onToggleBlock={handleToggleBlock}
      />

      {/* Dialogs and Slide-over Sheets */}
      <UsersDialogsContainer
        createSheetOpen={createSheetOpen}
        onCloseCreateSheet={() => setCreateSheetOpen(false)}
        selectedUser={selectedUser}
        detailsTab={detailsTab}
        onCloseDetails={() => setSelectedUserId(null)}
        userToBlock={userToBlock}
        onCloseBlock={() => setUserToBlock(null)}
        userToUnblock={userToUnblock}
        onCloseUnblock={() => setUserToUnblock(null)}
        userToChangeRole={userToChangeRole}
        onCloseChangeRole={() => setUserToChangeRole(null)}
        userToResetPassword={userToResetPassword}
        onCloseResetPassword={() => setUserToResetPassword(null)}
        houses={houses}
        currentUserId={currentUserId}
        isAdmin={isAdmin}
        activeAdminsCount={activeAdminsCount}
        onRefresh={handleRefresh}
        onTriggerChangeRole={(u) => setUserToChangeRole(u)}
        onTriggerResetPassword={(u) => setUserToResetPassword(u)}
        onTriggerToggleBlock={handleToggleBlock}
      />
    </div>
  );
}
