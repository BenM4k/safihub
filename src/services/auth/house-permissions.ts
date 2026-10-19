export type HouseStaffRole = "owner" | "manager" | "operator";

export interface HouseRolePermissionMatrix {
  canAcceptRejectOrders: boolean;
  canCountReception: boolean;
  canMarkOrdersReady: boolean;
  canEditCatalogue: boolean;
  canEditHours: boolean;
  canEditExclusions: boolean;
  canEditSettings: boolean;
  canEditPayout: boolean;
  canManageTeam: boolean;
  canCloseAccount: boolean;
}

export const HOUSE_ROLE_PERMISSIONS: Record<HouseStaffRole, HouseRolePermissionMatrix> = {
  owner: {
    canAcceptRejectOrders: true,
    canCountReception: true,
    canMarkOrdersReady: true,
    canEditCatalogue: true,
    canEditHours: true,
    canEditExclusions: true,
    canEditSettings: true,
    canEditPayout: true,
    canManageTeam: true,
    canCloseAccount: true,
  },
  manager: {
    canAcceptRejectOrders: true,
    canCountReception: true,
    canMarkOrdersReady: true,
    canEditCatalogue: true,
    canEditHours: true,
    canEditExclusions: true,
    canEditSettings: true,
    canEditPayout: false,
    canManageTeam: false,
    canCloseAccount: false,
  },
  operator: {
    canAcceptRejectOrders: true,
    canCountReception: true,
    canMarkOrdersReady: true,
    canEditCatalogue: false,
    canEditHours: false,
    canEditExclusions: false,
    canEditSettings: false,
    canEditPayout: false,
    canManageTeam: false,
    canCloseAccount: false,
  },
};

export interface StaffMemberRecord {
  userId: string;
  name: string;
  email: string;
  role: string;
  createdAt?: Date | null;
}

export function normalizeStaffRole(rawRole: string): HouseStaffRole {
  if (rawRole === "owner" || rawRole === "admin" || rawRole === "house") {
    return "owner";
  }
  if (rawRole === "manager") {
    return "manager";
  }
  return "operator";
}

/**
 * Validates whether a staff member can be demoted or removed from a house.
 * Guardrails enforced:
 * 1. The last owner cannot be removed or demoted.
 * 2. An operator cannot manage members.
 * 3. A manager cannot remove or demote an owner.
 * 4. A user cannot elevate their own role.
 */
export function validateMemberActionGuardrails({
  staffList,
  callerUserId,
  callerRole,
  targetUserId,
  targetNewRole,
  isRemoval = false,
}: {
  staffList: StaffMemberRecord[];
  callerUserId: string;
  callerRole: HouseStaffRole;
  targetUserId: string;
  targetNewRole?: HouseStaffRole;
  isRemoval?: boolean;
}): { allowed: true } | { allowed: false; error: string } {
  // 1. Permission check of the caller
  if (callerRole === "operator") {
    return {
      allowed: false,
      error: "Les opérateurs n'ont pas la permission de gérer l'équipe.",
    };
  }

  // 2. Prevent self-elevation
  if (callerUserId === targetUserId && targetNewRole && targetNewRole !== callerRole) {
    const roleRank: Record<HouseStaffRole, number> = {
      operator: 1,
      manager: 2,
      owner: 3,
    };
    if (roleRank[targetNewRole] > roleRank[callerRole]) {
      return {
        allowed: false,
        error: "Vous ne pouvez pas élever votre propre rôle.",
      };
    }
  }

  // Find target member
  const targetMember = staffList.find((m) => m.userId === targetUserId);
  if (!targetMember) {
    return { allowed: false, error: "Membre introuvable dans l'équipe." };
  }

  // 3. Manager cannot remove or change owner
  const targetCurrentRole = normalizeStaffRole(targetMember.role);
  if (callerRole === "manager" && targetCurrentRole === "owner") {
    return {
      allowed: false,
      error: "Seul un propriétaire peut modifier ou retirer un autre propriétaire.",
    };
  }

  // 4. Last owner protection
  const ownerCount = staffList.filter(
    (m) => normalizeStaffRole(m.role) === "owner"
  ).length;

  if (targetCurrentRole === "owner" && (isRemoval || (targetNewRole && targetNewRole !== "owner"))) {
    if (ownerCount <= 1) {
      return {
        allowed: false,
        error: "Impossible de supprimer ou rétrograder le dernier propriétaire du pressing.",
      };
    }
  }

  return { allowed: true };
}
