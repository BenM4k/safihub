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
  const hasOverlay = Boolean(
    createSheetOpen ||
    userToBlock ||
    userToUnblock ||
    userToChangeRole ||
    userToResetPassword,
  );

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
        hasOverlay={hasOverlay}
        onClose={onCloseDetails}
        onChangeRole={onTriggerChangeRole}
        onResetPassword={onTriggerResetPassword}
        onToggleBlock={onTriggerToggleBlock}
      />

      <UserBlockDialog
        key={userToBlock ? `block-${userToBlock.id}` : "block-none"}
        user={userToBlock}
        isOpen={Boolean(userToBlock)}
        currentUserId={currentUserId}
        onClose={onCloseBlock}
        onSuccess={onRefresh}
      />

      <UserUnblockDialog
        key={userToUnblock ? `unblock-${userToUnblock.id}` : "unblock-none"}
        user={userToUnblock}
        isOpen={Boolean(userToUnblock)}
        onClose={onCloseUnblock}
        onSuccess={onRefresh}
      />

      <UserRoleDialog
        key={userToChangeRole ? `role-${userToChangeRole.id}` : "role-none"}
        user={userToChangeRole}
        isOpen={Boolean(userToChangeRole)}
        currentUserId={currentUserId}
        activeAdminsCount={activeAdminsCount}
        houses={houses}
        onClose={onCloseChangeRole}
        onSuccess={onRefresh}
      />

      <UserResetPasswordDialog
        key={userToResetPassword ? `reset-${userToResetPassword.id}` : "reset-none"}
        user={userToResetPassword}
        isOpen={Boolean(userToResetPassword)}
        onClose={onCloseResetPassword}
        onSuccess={onRefresh}
      />
    </>
  );
}
