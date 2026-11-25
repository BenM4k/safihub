"use client";

import dynamic from "next/dynamic";
import type { UserDetailsTab, UserRow } from "./types";

const CreateStaffSheet = dynamic(
  () => import("./create-staff-sheet").then((m) => m.CreateStaffSheet),
  { ssr: false }
);

const UserDetailsSheet = dynamic(
  () =>
    import("./details/user-details-sheet").then((m) => m.UserDetailsSheet),
  { ssr: false }
);

const UserBlockDialog = dynamic(
  () =>
    import("./dialogs/user-block-dialog").then((m) => m.UserBlockDialog),
  { ssr: false }
);

const UserUnblockDialog = dynamic(
  () =>
    import("./dialogs/user-unblock-dialog").then((m) => m.UserUnblockDialog),
  { ssr: false }
);

const UserRoleDialog = dynamic(
  () => import("./dialogs/user-role-dialog").then((m) => m.UserRoleDialog),
  { ssr: false }
);

const UserResetPasswordDialog = dynamic(
  () =>
    import("./dialogs/user-reset-password-dialog").then(
      (m) => m.UserResetPasswordDialog
    ),
  { ssr: false }
);

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
      userToResetPassword
  );

  return (
    <>
      {createSheetOpen && (
        <CreateStaffSheet
          isOpen
          houses={houses}
          onClose={onCloseCreateSheet}
          onSuccess={onRefresh}
        />
      )}

      {selectedUser && (
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
      )}

      {userToBlock && (
        <UserBlockDialog
          key={`block-${userToBlock.id}`}
          user={userToBlock}
          isOpen
          currentUserId={currentUserId}
          onClose={onCloseBlock}
          onSuccess={onRefresh}
        />
      )}

      {userToUnblock && (
        <UserUnblockDialog
          key={`unblock-${userToUnblock.id}`}
          user={userToUnblock}
          isOpen
          onClose={onCloseUnblock}
          onSuccess={onRefresh}
        />
      )}

      {userToChangeRole && (
        <UserRoleDialog
          key={`role-${userToChangeRole.id}`}
          user={userToChangeRole}
          isOpen
          currentUserId={currentUserId}
          activeAdminsCount={activeAdminsCount}
          houses={houses}
          onClose={onCloseChangeRole}
          onSuccess={onRefresh}
        />
      )}

      {userToResetPassword && (
        <UserResetPasswordDialog
          key={`reset-${userToResetPassword.id}`}
          user={userToResetPassword}
          isOpen
          onClose={onCloseResetPassword}
          onSuccess={onRefresh}
        />
      )}
    </>
  );
}
