"use client";

import { CreateStaffSheet } from "./create-staff-sheet";
import { UserBlockDialog } from "./dialogs/user-block-dialog";
import { UserRoleDialog } from "./dialogs/user-role-dialog";
import { UserResetPasswordDialog } from "./dialogs/user-reset-password-dialog";
import { UserUnblockDialog } from "./dialogs/user-unblock-dialog";
import { UserDetailsSheet } from "./details/user-details-sheet";
import type { UserDetailsTab, UserRow } from "./types";

interface UsersDialogsContainerProps {
  createSheetOpen: boolean;
  onCloseCreateSheet: () => void;
  selectedUser: UserRow | null;
  detailsTab: UserDetailsTab;
  onCloseDetails: () => void;
  userToBlock: UserRow | null;
  onCloseBlock: () => void;
  userToUnblock: UserRow | null;
  onCloseUnblock: () => void;
  userToChangeRole: UserRow | null;
  onCloseChangeRole: () => void;
  userToResetPassword: UserRow | null;
  onCloseResetPassword: () => void;
  houses: Array<{ id: string; name: string }>;
  currentUserId?: string | null;
  isAdmin: boolean;
  activeAdminsCount: number;
  onRefresh: () => void;
  onTriggerChangeRole: (u: UserRow) => void;
  onTriggerResetPassword: (u: UserRow) => void;
  onTriggerToggleBlock: (u: UserRow) => void;
}

export function UsersDialogsContainer({
  createSheetOpen,
  onCloseCreateSheet,
  selectedUser,
  detailsTab,
  onCloseDetails,
  userToBlock,
  onCloseBlock,
  userToUnblock,
  onCloseUnblock,
  userToChangeRole,
  onCloseChangeRole,
  userToResetPassword,
  onCloseResetPassword,
  houses,
  currentUserId,
  isAdmin,
  activeAdminsCount,
  onRefresh,
  onTriggerChangeRole,
  onTriggerResetPassword,
  onTriggerToggleBlock,
}: UsersDialogsContainerProps) {
  return (
    <>
      <CreateStaffSheet
        isOpen={createSheetOpen}
        houses={houses}
        onClose={onCloseCreateSheet}
        onSuccess={onRefresh}
      />

      <UserDetailsSheet
        user={selectedUser}
        initialTab={detailsTab}
        currentUserId={currentUserId}
        isAdmin={isAdmin}
        activeAdminsCount={activeAdminsCount}
        onClose={onCloseDetails}
        onChangeRole={onTriggerChangeRole}
        onResetPassword={onTriggerResetPassword}
        onToggleBlock={onTriggerToggleBlock}
      />

      <UserBlockDialog
        user={userToBlock}
        isOpen={Boolean(userToBlock)}
        currentUserId={currentUserId}
        onClose={onCloseBlock}
        onSuccess={onRefresh}
      />

      <UserUnblockDialog
        user={userToUnblock}
        isOpen={Boolean(userToUnblock)}
        onClose={onCloseUnblock}
        onSuccess={onRefresh}
      />

      <UserRoleDialog
        user={userToChangeRole}
        isOpen={Boolean(userToChangeRole)}
        currentUserId={currentUserId}
        activeAdminsCount={activeAdminsCount}
        houses={houses}
        onClose={onCloseChangeRole}
        onSuccess={onRefresh}
      />

      <UserResetPasswordDialog
        user={userToResetPassword}
        isOpen={Boolean(userToResetPassword)}
        onClose={onCloseResetPassword}
        onSuccess={onRefresh}
      />
    </>
  );
}
